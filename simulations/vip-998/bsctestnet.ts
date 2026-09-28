import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, BigNumberish, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip998, {
  ACM,
  CENTRIFUGE_SOURCE_USDT,
  DEFAULT_PROXY_ADMIN,
  EBRAKE,
  EBRAKE_NEW_IMPL,
  GUARDIAN,
  HUB_NAV_SENTINEL,
  HUB_REGISTRY,
  HUB_SIGS_FOR_EBRAKE,
  HUB_USDT,
  KEEPER,
  MOCK_CENTRIFUGE_VAULT_USDT,
  NORMAL_TIMELOCK,
  PAUSE_DOWN_BPS,
  PAUSE_UP_BPS,
  SENTINEL_CONFIG_SIGS,
  YIELD_GROUP_SIGS_FOR_EBRAKE,
} from "../../vips/vip-998/bsctestnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import EBRAKE_ABI from "./abi/EBrake.json";
import HUB_ABI from "./abi/Hub.json";
import SENTINEL_ABI from "./abi/HubNavDeviationSentinel.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import VAULT_ABI from "./abi/TestnetCentrifugeVault.json";
import YIELD_GROUP_ABI from "./abi/YieldGroupCentrifuge.json";

const BLOCK_NUMBER = 133646504;

const { UNITROLLER } = NETWORK_ADDRESSES.bsctestnet;

const LIVE_EBRAKE_IMPL = "0x9cA0f0C412d2E8a2c4323c04214D811375c17B24";
const EBRAKE_OWNER = "0x33C6476F88eeA28D7E7900F759B4597704Ef95B7";
const HUB_NAV_SENTINEL_IMPL = "0x35e6f59A1B9Ff16114e8B0da22acCa881b74aE70";
// Deployed the sentinel, and owns the mock vault: its only fund manager, so the one account that can move its price.
const DEPLOYER = "0x4cD6300F5cb8D6BbA5E646131c3522664C10dF11";
const DEVIATION_SENTINEL = "0x9245d72712548707809D66848e63B8E2B169F3c1";
const CORE_SOURCE_USDT = "0x11e39DC7b8b16BBDA8D9C2903dF741Ae9341Ec88";
const VUSDT_CORE = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";
const ADAPTER_CENTRIFUGE = "0x8219375B48a9fcca0F9E5eA1c1B171524aa347E1";

// The three Hub levers the EBrake upgrade adds, with arguments that reach a real target.
const EBRAKE_HUB_LEVERS: [string, string[]][] = [
  ["pauseHub(address)", [HUB_USDT]],
  ["pauseHubYieldGroup(address)", [CENTRIFUGE_SOURCE_USDT]],
  ["pauseHubResource(address,address)", [CENTRIFUGE_SOURCE_USDT, MOCK_CENTRIFUGE_VAULT_USDT]],
];

// The loosening side of each pause, which nothing on the sentinel path may hold.
const UNPAUSES: [string, string][] = [
  [HUB_USDT, "unpauseHub()"],
  [HUB_USDT, "unpauseYieldGroup(address)"],
  [CENTRIFUGE_SOURCE_USDT, "unpauseResource(address)"],
];

// The Hub's `maxWithdrawalSize` on testnet. USDT and the vault's shares both have 6 decimals.
const TRANCHE = parseUnits("10", 6);
const PAR = parseUnits("1", 6);
const UNCAPPED = BigNumber.from(2).pow(128).sub(1);
const BORROW = 2;

const Status = {
  MonitoringDisabled: 0,
  YieldGroupNotRegistered: 1,
  ResourceNotRegistered: 2,
  ObservedValueZero: 3,
  CentreZero: 4,
  WithinThreshold: 5,
  Breached: 6,
};

const roleOf = (contract: string, sig: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [contract, sig]);

const GRANTS: [contract: string, sig: string, account: string][] = [
  ...[NORMAL_TIMELOCK, GUARDIAN].flatMap(account =>
    SENTINEL_CONFIG_SIGS.map(sig => [HUB_NAV_SENTINEL, sig, account] as [string, string, string]),
  ),
  [EBRAKE, "pauseHub(address)", HUB_NAV_SENTINEL],
  ...HUB_SIGS_FOR_EBRAKE.map(sig => [HUB_USDT, sig, EBRAKE] as [string, string, string]),
  ...YIELD_GROUP_SIGS_FOR_EBRAKE.map(sig => [CENTRIFUGE_SOURCE_USDT, sig, EBRAKE] as [string, string, string]),
];

// Each transaction lands one second after the last block. Left to the wall clock, a slow fork could let the
// band's 450 bps drift grow the 10 USDT centre by a unit (one every ~70 s) and move the trip points.
const nextSecond = async () => time.setNextBlockTimestamp((await time.latest()) + 1);

forking(BLOCK_NUMBER, async () => {
  let acm: Contract;
  let proxyAdmin: Contract;
  let eBrake: Contract;
  let sentinel: Contract;
  let hub: Contract;
  let source: Contract;
  let vault: Contract;

  // ACM's own view, asked from the target the way the target asks it, so a wildcard grant counts too.
  const isAllowed = (contract: string, sig: string, account: string): Promise<boolean> =>
    acm.connect(ethers.provider).isAllowedToCall(account, sig, { from: contract });

  const expectCheck = async (
    status: number,
    expectedHub: string,
    observedValue: BigNumberish,
    centre: BigNumberish,
    minAllowedValue: BigNumberish,
    maxAllowedValue: BigNumberish,
  ) => {
    const check = await sentinel.checkNavGuardDeviation(CENTRIFUGE_SOURCE_USDT, MOCK_CENTRIFUGE_VAULT_USDT);
    expect(check.status).to.equal(status);
    expect(check.hub).to.equal(expectedHub);
    expect(check.observedValue).to.equal(observedValue);
    expect(check.centre).to.equal(centre);
    expect(check.minAllowedValue).to.equal(minAllowedValue);
    expect(check.maxAllowedValue).to.equal(maxAllowedValue);
  };

  before(async () => {
    acm = await ethers.getContractAt(ACM_ABI, ACM);
    proxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, DEFAULT_PROXY_ADMIN);
    eBrake = await ethers.getContractAt(EBRAKE_ABI, EBRAKE);
    sentinel = await ethers.getContractAt(SENTINEL_ABI, HUB_NAV_SENTINEL);
    hub = await ethers.getContractAt(HUB_ABI, HUB_USDT);
    source = await ethers.getContractAt(YIELD_GROUP_ABI, CENTRIFUGE_SOURCE_USDT);
    vault = await ethers.getContractAt(VAULT_ABI, MOCK_CENTRIFUGE_VAULT_USDT);
  });

  describe("Pre-VIP behavior", () => {
    it("EBrake runs the live implementation, which has no Hub levers", async () => {
      expect(await proxyAdmin.getProxyImplementation(EBRAKE)).to.equal(LIVE_EBRAKE_IMPL);
      expect(await eBrake.owner()).to.equal(EBRAKE_OWNER);
      const [caller] = await ethers.getSigners();
      for (const [sig, args] of EBRAKE_HUB_LEVERS) {
        await expect(
          caller.sendTransaction({ to: EBRAKE, data: eBrake.interface.encodeFunctionData(sig, args) }),
          sig,
        ).to.be.revertedWithoutReason();
      }
    });

    it("the sentinel runs the deployed implementation, pending the Normal Timelock", async () => {
      expect(await proxyAdmin.getProxyImplementation(HUB_NAV_SENTINEL)).to.equal(HUB_NAV_SENTINEL_IMPL);
      expect(await sentinel.EBRAKE()).to.equal(EBRAKE);
      expect(await sentinel.HUB_REGISTRY()).to.equal(HUB_REGISTRY);
      expect(await sentinel.accessControlManager()).to.equal(ACM);
      expect(await sentinel.owner()).to.equal(DEPLOYER);
      expect(await sentinel.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await sentinel.minHubNavGapBps()).to.equal(100);
    });

    it("the sentinel trusts no keeper and watches nothing", async () => {
      expect(await sentinel.trustedKeepers(KEEPER)).to.equal(false);
      const config = await sentinel.navGuardConfigs(CENTRIFUGE_SOURCE_USDT, MOCK_CENTRIFUGE_VAULT_USDT);
      expect(config.hub).to.equal(ethers.constants.AddressZero);
      expect(config.pauseUpBps).to.equal(0);
      expect(config.pauseDownBps).to.equal(0);
      expect(config.enabled).to.equal(false);
      await expectCheck(Status.MonitoringDisabled, ethers.constants.AddressZero, 0, 0, 0, 0);
    });

    it("nobody holds any of the roles the VIP grants, by grant or by wildcard", async () => {
      for (const [contract, sig, account] of GRANTS) {
        expect(await acm.hasRole(roleOf(contract, sig), account), `${sig} -> ${account}`).to.equal(false);
        expect(await isAllowed(contract, sig, account), `${sig} -> ${account}`).to.equal(false);
      }
    });

    it("the keeper is the one the testnet DeviationSentinel trusts", async () => {
      const deviationSentinel = await ethers.getContractAt(SENTINEL_ABI, DEVIATION_SENTINEL);
      expect(await deviationSentinel.trustedKeepers(KEEPER)).to.equal(true);
    });

    it("the Guardian can already pause and unpause the Hub directly", async () => {
      expect(await isAllowed(HUB_USDT, "pauseHub()", GUARDIAN)).to.equal(true);
      for (const [contract, sig] of UNPAUSES) {
        expect(await isAllowed(contract, sig, GUARDIAN), sig).to.equal(true);
      }
    });

    it("the Centrifuge vault is registered on a live Hub, with an empty position and an unanchored band", async () => {
      const registry = new ethers.Contract(
        HUB_REGISTRY,
        ["function isHub(address) view returns (bool)"],
        ethers.provider,
      );
      expect(await registry.isHub(HUB_USDT)).to.equal(true);
      expect(await hub.hubPaused()).to.equal(false);
      expect(await source.hub()).to.equal(HUB_USDT);

      const group = await hub.yieldGroupConfig(CENTRIFUGE_SOURCE_USDT);
      expect(group.absoluteCap).to.equal(UNCAPPED);
      expect(group.percentageCapBps).to.equal(10_000);
      expect(group.paused).to.equal(false);
      expect(group.registered).to.equal(true);
      const resource = await source.resourceConfig(MOCK_CENTRIFUGE_VAULT_USDT);
      expect(resource.registered).to.equal(true);
      expect(resource.paused).to.equal(false);
      expect(resource.adapter).to.equal(ADAPTER_CENTRIFUGE);

      const band = await source.navGuard(MOCK_CENTRIFUGE_VAULT_USDT);
      expect(band.anchor).to.equal(0);
      expect(band.centre).to.equal(0);
      expect(band.interval).to.equal(86_400);
      expect(band.driftBps).to.equal(450);
      expect(band.upGapBps).to.equal(500);
      expect(band.downGapBps).to.equal(500);
      expect(band.capEnabled).to.equal(false);
      expect(band.floorEnabled).to.equal(false);
      // The group holds idle USDT, but the band only values the vault position, which has no shares yet.
      expect((await source.navGuardStatus(MOCK_CENTRIFUGE_VAULT_USDT)).observedValue).to.equal(0);

      expect(await vault.pricePerShare()).to.equal(PAR);
      expect(await vault.driftBps()).to.equal(0);
      expect(await vault.autoFulfill()).to.equal(true);
      expect(await vault.isFundManager(DEPLOYER)).to.equal(true);
    });
  });

  testVip("VIP-998 [BNB Chain Testnet] Hub NAV deviation sentinel and EBrake Hub pause levers", await vip998(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted", "PermissionGranted"], [GRANTS.length, GRANTS.length]);
      for (const [contract, sig, account] of GRANTS) {
        await expect(txResponse).to.emit(acm, "RoleGranted").withArgs(roleOf(contract, sig), account, NORMAL_TIMELOCK);
        await expect(txResponse).to.emit(acm, "PermissionGranted").withArgs(account, contract, sig);
      }

      await expectEvents(
        txResponse,
        [SENTINEL_ABI],
        [
          "OwnershipTransferred",
          "TrustedKeeperUpdated",
          "MinHubNavGapUpdated",
          "NavGuardConfigUpdated",
          "NavGuardStatusChanged",
        ],
        [1, 1, 1, 1, 1],
      );
      await expect(txResponse).to.emit(sentinel, "OwnershipTransferred").withArgs(DEPLOYER, NORMAL_TIMELOCK);
      await expect(txResponse).to.emit(sentinel, "TrustedKeeperUpdated").withArgs(KEEPER, true);
      await expect(txResponse).to.emit(sentinel, "MinHubNavGapUpdated").withArgs(100, 0);
      // The thresholds land disarmed; only `setNavMonitoringEnabled` arms them.
      await expect(txResponse)
        .to.emit(sentinel, "NavGuardConfigUpdated")
        .withArgs(HUB_USDT, CENTRIFUGE_SOURCE_USDT, MOCK_CENTRIFUGE_VAULT_USDT, [
          HUB_USDT,
          PAUSE_UP_BPS,
          PAUSE_DOWN_BPS,
          false,
        ]);
      await expect(txResponse)
        .to.emit(sentinel, "NavGuardStatusChanged")
        .withArgs(HUB_USDT, CENTRIFUGE_SOURCE_USDT, MOCK_CENTRIFUGE_VAULT_USDT, true);
    },
  });

  describe("Post-VIP behavior", () => {
    it("EBrake runs the new implementation for the Core Pool comptroller, with its state carried over", async () => {
      expect(await proxyAdmin.getProxyImplementation(EBRAKE)).to.equal(EBRAKE_NEW_IMPL);
      expect(await eBrake.COMPTROLLER()).to.equal(UNITROLLER);
      expect(await eBrake.IS_ISOLATED_POOL()).to.equal(false);
      expect(await eBrake.accessControlManager()).to.equal(ACM);
      expect(await eBrake.owner()).to.equal(EBRAKE_OWNER);
      expect(await eBrake.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("the Normal Timelock owns the sentinel, which still runs the same implementation", async () => {
      expect(await sentinel.owner()).to.equal(NORMAL_TIMELOCK);
      expect(await sentinel.pendingOwner()).to.equal(ethers.constants.AddressZero);
      expect(await proxyAdmin.getProxyImplementation(HUB_NAV_SENTINEL)).to.equal(HUB_NAV_SENTINEL_IMPL);
    });

    it("every role is granted, and ACM allows it from the target", async () => {
      for (const [contract, sig, account] of GRANTS) {
        expect(await acm.hasRole(roleOf(contract, sig), account), `${sig} -> ${account}`).to.equal(true);
        expect(await isAllowed(contract, sig, account), `${sig} -> ${account}`).to.equal(true);
      }
    });

    it("nothing on the sentinel path can loosen a pause", async () => {
      for (const account of [EBRAKE, HUB_NAV_SENTINEL]) {
        for (const [contract, sig] of UNPAUSES) {
          expect(await isAllowed(contract, sig, account), `${sig} -> ${account}`).to.equal(false);
        }
      }
    });

    it("the keeper is trusted, the Hub NAV floor is off and the Centrifuge vault's band is armed", async () => {
      expect(await sentinel.trustedKeepers(KEEPER)).to.equal(true);
      expect(await sentinel.minHubNavGapBps()).to.equal(0);
      const config = await sentinel.navGuardConfigs(CENTRIFUGE_SOURCE_USDT, MOCK_CENTRIFUGE_VAULT_USDT);
      expect(config.hub).to.equal(HUB_USDT);
      expect(config.pauseUpBps).to.equal(PAUSE_UP_BPS);
      expect(config.pauseDownBps).to.equal(PAUSE_DOWN_BPS);
      expect(config.enabled).to.equal(true);
    });

    it("on the empty position there is nothing to judge, so the keeper cannot pause", async () => {
      await expectCheck(Status.ObservedValueZero, HUB_USDT, 0, 0, 0, 0);
      const keeper = await initMainnetUser(KEEPER, parseUnits("1"));
      await expect(sentinel.connect(keeper).handleNavGuardDeviation(CENTRIFUGE_SOURCE_USDT, MOCK_CENTRIFUGE_VAULT_USDT))
        .to.be.revertedWithCustomError(sentinel, "NavGuardObservedValueZero")
        .withArgs(MOCK_CENTRIFUGE_VAULT_USDT);
    });
  });

  describe("Post-VIP: a NAV move past the threshold pauses the Hub", () => {
    let keeper: SignerWithAddress;
    let fundManager: SignerWithAddress;
    let timelock: SignerWithAddress;
    let stranger: SignerWithAddress;

    // The prices sitting exactly on each trip point, and the value the 10 USDT position then reports.
    const downEdge = PAR.mul(10_000 - PAUSE_DOWN_BPS).div(10_000);
    const upEdge = PAR.mul(10_000 + PAUSE_UP_BPS).div(10_000);
    const breachPrice = PAR.mul(10_000 - PAUSE_DOWN_BPS - 100).div(10_000);
    const observedAt = (price: BigNumber) => TRANCHE.mul(price).div(PAR);

    const setPrice = async (price: BigNumber) => {
      await nextSecond();
      await vault.connect(fundManager).setPrice(price);
    };
    const handle = async (signer: SignerWithAddress) => {
      await nextSecond();
      return sentinel.connect(signer).handleNavGuardDeviation(CENTRIFUGE_SOURCE_USDT, MOCK_CENTRIFUGE_VAULT_USDT);
    };

    before(async () => {
      keeper = await initMainnetUser(KEEPER, parseUnits("1"));
      fundManager = await initMainnetUser(DEPLOYER, parseUnits("1"));
      timelock = await initMainnetUser(NORMAL_TIMELOCK, parseUnits("1"));
      [stranger] = await ethers.getSigners();
    });

    it("an operator reallocation opens the position, centring a band that has no width until it anchors", async () => {
      // The Guardian is also the Operator on this network, and already holds `reallocate` and `claimDeposit`.
      await nextSecond();
      await hub
        .connect(keeper)
        .reallocate(
          [{ yieldGroup: CORE_SOURCE_USDT, resource: VUSDT_CORE, amount: TRANCHE }],
          [{ yieldGroup: CENTRIFUGE_SOURCE_USDT, resource: MOCK_CENTRIFUGE_VAULT_USDT, amount: TRANCHE }],
        );
      await nextSecond();
      await source.connect(keeper).claimDeposit(MOCK_CENTRIFUGE_VAULT_USDT);

      const band = await source.navGuard(MOCK_CENTRIFUGE_VAULT_USDT);
      expect(band.anchor).to.equal(0);
      expect(band.centre).to.equal(TRANCHE);
      const status = await source.navGuardStatus(MOCK_CENTRIFUGE_VAULT_USDT);
      expect(status.observedValue).to.equal(TRANCHE);
      expect(status.minAllowedValue).to.equal(TRANCHE);
      expect(status.maxAllowedValue).to.equal(TRANCHE);
      expect(status.isClamped).to.equal(false);
      await expectCheck(Status.WithinThreshold, HUB_USDT, TRANCHE, TRANCHE, TRANCHE, TRANCHE);
    });

    it("a move landing exactly on either trip point is left alone", async () => {
      for (const price of [downEdge, upEdge]) {
        await setPrice(price);
        await expectCheck(Status.WithinThreshold, HUB_USDT, observedAt(price), TRANCHE, TRANCHE, TRANCHE);
        await expect(handle(keeper))
          .to.be.revertedWithCustomError(sentinel, "DeviationWithinThreshold")
          .withArgs(MOCK_CENTRIFUGE_VAULT_USDT, observedAt(price));
      }
    });

    it("the smallest move past either trip point reads as a breach", async () => {
      for (const price of [downEdge.sub(1), upEdge.add(1)]) {
        await setPrice(price);
        await expectCheck(Status.Breached, HUB_USDT, observedAt(price), TRANCHE, TRANCHE, TRANCHE);
      }
    });

    it("a Hub NAV floor screens out a breach whose gap is a small share of the Hub", async () => {
      await setPrice(breachPrice);
      await expectCheck(Status.Breached, HUB_USDT, observedAt(breachPrice), TRANCHE, TRANCHE, TRANCHE);

      await nextSecond();
      await expect(sentinel.connect(timelock).setMinHubNavGapBps(100))
        .to.emit(sentinel, "MinHubNavGapUpdated")
        .withArgs(0, 100);
      await expectCheck(Status.WithinThreshold, HUB_USDT, observedAt(breachPrice), TRANCHE, TRANCHE, TRANCHE);
      await expect(handle(keeper))
        .to.be.revertedWithCustomError(sentinel, "DeviationWithinThreshold")
        .withArgs(MOCK_CENTRIFUGE_VAULT_USDT, observedAt(breachPrice));

      await nextSecond();
      await sentinel.connect(timelock).setMinHubNavGapBps(0);
      await expectCheck(Status.Breached, HUB_USDT, observedAt(breachPrice), TRANCHE, TRANCHE, TRANCHE);
    });

    it("only a trusted keeper can act on a breach", async () => {
      await setPrice(breachPrice);
      await expect(handle(stranger)).to.be.revertedWithCustomError(sentinel, "UnauthorizedKeeper");
      expect(await hub.hubPaused()).to.equal(false);
    });

    it("the keeper pauses the Hub through EBrake, stopping every deposit and redemption", async () => {
      expect(await hub.maxDeposit(GUARDIAN)).to.be.gt(0);
      expect(await hub.maxRedeem(GUARDIAN)).to.be.gt(0);

      const tx = await handle(keeper);
      await expect(tx)
        .to.emit(sentinel, "NavGuardDeviationHandled")
        .withArgs(
          HUB_USDT,
          CENTRIFUGE_SOURCE_USDT,
          MOCK_CENTRIFUGE_VAULT_USDT,
          observedAt(breachPrice),
          TRANCHE,
          TRANCHE,
          TRANCHE,
        );
      await expect(tx).to.emit(eBrake, "HubPaused").withArgs(HUB_NAV_SENTINEL, HUB_USDT);
      await expect(tx).to.emit(hub, "HubPauseToggled").withArgs(true);

      expect(await hub.hubPaused()).to.equal(true);
      expect(await hub.maxDeposit(GUARDIAN)).to.equal(0);
      expect(await hub.maxMint(GUARDIAN)).to.equal(0);
      expect(await hub.maxWithdraw(GUARDIAN)).to.equal(0);
      expect(await hub.maxRedeem(GUARDIAN)).to.equal(0);
      await expect(hub.connect(keeper).deposit(1, GUARDIAN)).to.be.revertedWithCustomError(hub, "HubPaused");
      await expect(hub.connect(keeper).redeem(1, GUARDIAN, GUARDIAN)).to.be.revertedWithCustomError(hub, "HubPaused");
    });

    it("a repeat call re-reports the breach and leaves the paused Hub untouched", async () => {
      const tx = await handle(keeper);
      await expect(tx)
        .to.emit(sentinel, "NavGuardDeviationHandled")
        .withArgs(
          HUB_USDT,
          CENTRIFUGE_SOURCE_USDT,
          MOCK_CENTRIFUGE_VAULT_USDT,
          observedAt(breachPrice),
          TRANCHE,
          TRANCHE,
          TRANCHE,
        );
      await expect(tx).to.not.emit(eBrake, "HubPaused");
      await expect(tx).to.not.emit(hub, "HubPauseToggled");
      expect(await hub.hubPaused()).to.equal(true);
    });

    it("recovery happens on the Hub itself, here by the Normal Timelock", async () => {
      await nextSecond();
      await expect(hub.connect(timelock).unpauseHub()).to.emit(hub, "HubPauseToggled").withArgs(false);
      expect(await hub.hubPaused()).to.equal(false);
    });

    it("with no Hub activity the centre grows by the band's drift, and the Hub's bounds grow with it", async () => {
      const band = await source.navGuard(MOCK_CENTRIFUGE_VAULT_USDT);
      await time.increase(30 * 86_400);
      const elapsed = BigNumber.from(await time.latest()).sub(band.driftFrom);
      const grown = band.centre.add(
        band.centre
          .mul(band.driftBps)
          .mul(elapsed)
          .div(10_000 * 365 * 86_400),
      );
      expect(grown).to.be.gt(TRANCHE);
      await expectCheck(Status.Breached, HUB_USDT, observedAt(breachPrice), grown, grown, grown);
    });

    it("disarming keeps the thresholds and stops the keeper acting", async () => {
      await nextSecond();
      await expect(
        sentinel.connect(timelock).setNavMonitoringEnabled(CENTRIFUGE_SOURCE_USDT, MOCK_CENTRIFUGE_VAULT_USDT, false),
      )
        .to.emit(sentinel, "NavGuardStatusChanged")
        .withArgs(HUB_USDT, CENTRIFUGE_SOURCE_USDT, MOCK_CENTRIFUGE_VAULT_USDT, false);

      const config = await sentinel.navGuardConfigs(CENTRIFUGE_SOURCE_USDT, MOCK_CENTRIFUGE_VAULT_USDT);
      expect(config.hub).to.equal(HUB_USDT);
      expect(config.pauseUpBps).to.equal(PAUSE_UP_BPS);
      expect(config.pauseDownBps).to.equal(PAUSE_DOWN_BPS);
      expect(config.enabled).to.equal(false);
      await expectCheck(Status.MonitoringDisabled, ethers.constants.AddressZero, 0, 0, 0, 0);
      await expect(handle(keeper))
        .to.be.revertedWithCustomError(sentinel, "NavGuardDisabled")
        .withArgs(CENTRIFUGE_SOURCE_USDT, MOCK_CENTRIFUGE_VAULT_USDT);
      expect(await hub.hubPaused()).to.equal(false);
    });
  });

  describe("Post-VIP: EBrake's Hub levers", () => {
    let keeper: SignerWithAddress;
    let stranger: SignerWithAddress;
    let operator: SignerWithAddress;

    before(async () => {
      keeper = await initMainnetUser(KEEPER, parseUnits("1"));
      [stranger, operator] = await ethers.getSigners();
    });

    it("the keeper and anyone else are refused all three; the sentinel holds only pauseHub(address)", async () => {
      for (const account of [keeper, stranger]) {
        for (const [sig, args] of EBRAKE_HUB_LEVERS) {
          await expect(eBrake.connect(account)[sig](...args), sig)
            .to.be.revertedWithCustomError(eBrake, "Unauthorized")
            .withArgs(account.address, EBRAKE, sig);
        }
      }
    });

    it("the Hub-side grants land once a lever holder exists", async () => {
      // Not granted by this proposal. Granted here only to drive EBrake's Hub-side roles end to end.
      const timelock = await initMainnetUser(NORMAL_TIMELOCK, parseUnits("1"));
      for (const sig of ["pauseHubYieldGroup(address)", "pauseHubResource(address,address)"]) {
        await acm.connect(timelock).giveCallPermission(EBRAKE, sig, operator.address);
      }

      const pauseGroup = await eBrake.connect(operator).pauseHubYieldGroup(CENTRIFUGE_SOURCE_USDT);
      await expect(pauseGroup)
        .to.emit(eBrake, "HubYieldGroupPaused")
        .withArgs(operator.address, HUB_USDT, CENTRIFUGE_SOURCE_USDT);
      await expect(pauseGroup).to.emit(hub, "YieldGroupPauseToggled").withArgs(CENTRIFUGE_SOURCE_USDT, true);
      expect((await hub.yieldGroupConfig(CENTRIFUGE_SOURCE_USDT)).paused).to.equal(true);

      const pauseResource = await eBrake
        .connect(operator)
        .pauseHubResource(CENTRIFUGE_SOURCE_USDT, MOCK_CENTRIFUGE_VAULT_USDT);
      await expect(pauseResource)
        .to.emit(eBrake, "HubResourcePaused")
        .withArgs(operator.address, CENTRIFUGE_SOURCE_USDT, MOCK_CENTRIFUGE_VAULT_USDT);
      await expect(pauseResource).to.emit(source, "ResourcePauseToggled").withArgs(MOCK_CENTRIFUGE_VAULT_USDT, true);
      expect((await source.resourceConfig(MOCK_CENTRIFUGE_VAULT_USDT)).paused).to.equal(true);
      expect(await hub.hubPaused()).to.equal(false);
    });

    it("the Guardian can still pause the Hub itself", async () => {
      const guardian = await initMainnetUser(GUARDIAN, parseUnits("1"));
      await expect(hub.connect(guardian).pauseHub()).to.emit(hub, "HubPauseToggled").withArgs(true);
      expect(await hub.hubPaused()).to.equal(true);
    });

    it("the upgrade keeps EBrake's existing levers: the DeviationSentinel still pauses a Core Pool market", async () => {
      const comptroller = new ethers.Contract(
        UNITROLLER,
        ["function actionPaused(address,uint8) view returns (bool)"],
        ethers.provider,
      );
      expect(await comptroller.actionPaused(VUSDT_CORE, BORROW)).to.equal(false);
      const deviationSentinel = await initMainnetUser(DEVIATION_SENTINEL, parseUnits("1"));
      await expect(eBrake.connect(deviationSentinel).pauseBorrow(VUSDT_CORE))
        .to.emit(eBrake, "ActionPaused")
        .withArgs(DEVIATION_SENTINEL, VUSDT_CORE, BORROW);
      expect(await comptroller.actionPaused(VUSDT_CORE, BORROW)).to.equal(true);
    });
  });
});
