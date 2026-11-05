import { SnapshotRestorer, takeSnapshot } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";

import {
  APRO_ORACLE,
  ATLAS_ORACLE,
  COLLATERAL_MARKETS_MAINSTREAM,
  LIQUIDITY_MARKETS_MAINSTREAM,
  MAINSTREAM_COMPTROLLER,
  VTSLAB_MAINSTREAM,
} from "../../vips/vip-675/addresses/bscmainnet";
import vip675 from "../../vips/vip-675/bscmainnet";
import vip677 from "../../vips/vip-675/bscmainnet-part-2";
import vip678 from "../../vips/vip-675/bscmainnet-part-3";
import vip680, { BSTOCK_PAUSE_SENTINEL, EBRAKE, KEEPER, SENTINEL_ADMINS } from "../../vips/vip-680/bscmainnet";
import {
  BSTOCK_MARKETS,
  CORE_ONLY_PERMISSIONS,
  CORE_PERMISSIONS_TO_REVOKE,
  WILDCARD_PERMISSIONS,
  vNVDAB,
  vQQQB,
  vSPYB,
  vTSLAB,
} from "../../vips/vip-680/config";
import CHAINLINK_ORACLE_ABI from "../vip-675/abi/ChainlinkOracle.json";
import ACM_ABI from "./abi/AccessControlManager.json";
import SENTINEL_ABI from "./abi/BStockPauseSentinel.json";
import COMPLIANCE_ABI from "./abi/Compliance.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import EBRAKE_ABI from "./abi/EBrake.json";
import HUB_ABI from "./abi/Hub.json";
import PROXY_ABI from "./abi/OptimizedTransparentUpgradeableProxy.json";
import PAUSE_MANAGER_ABI from "./abi/PauseManager.json";
import SPOKE_COMPTROLLER_ABI from "./abi/SpokeComptroller.json";

const { ACCESS_CONTROL_MANAGER, CRITICAL_GUARDIAN, GUARDIAN, NORMAL_TIMELOCK, UNITROLLER } =
  NETWORK_ADDRESSES.bscmainnet;

// After VIP-673 and all Mainstream listing batches were seeded; listing execution is simulated below.
const BLOCK_NUMBER = 131781257;

const DEPLOYER = "0x9b0A3EAE7f174937d31745B710BbeA68e9D1BEf7";
const PAUSE_MANAGER = "0x9fc74Be63f3589485B2423984a7a0557e0CF700a";
const COMPLIANCE = "0x53dBa7AaBDe774787A1F57236B235567dA8e14F4";
const TSLAB = "0x5b1910eAaD6450E50f816082Aa078C41F10C292f";
const QQQB = "0x205812CdBed920aFf76C6580abD681a46D11efc7";
const SPYB = "0x7138b48df7D98D7e3cc221BfE7192D0a178182D8";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const HUB_USDT = "0x18AfDACF30F8671021dec4b78297E39d2FE87226";
const BSTOCK_INDEX_COMPTROLLER = "0x1e75332a3e2CC8e5ee9055aF4c737DA34Cb7cEDf";

const CORE_POOL_ID = 0;
// EBrake reports a Spoke market under pool id 0
const SPOKE_POOL_ID = 0;
const MINT_ACTION = 0;

// At the fork block: vTSLAB and vNVDAB in the Core pool, vQQQB and vSPYB in the bStock index pool
const CORE_CF = parseUnits("0.6", 18);
const CORE_LT = parseUnits("0.7", 18);
const SPOKE_CF = parseUnits("0.8", 18);
const SPOKE_LT = parseUnits("0.85", 18);
const TSLAB_SUPPLY_CAP = parseUnits("236", 18);
const SPYB_SUPPLY_CAP = parseUnits("10000", 18);

const SENTINEL_PERMISSIONS = [
  [EBRAKE, "decreaseCF(address,uint256)", BSTOCK_PAUSE_SENTINEL],
  ...SENTINEL_ADMINS.map(account => [BSTOCK_PAUSE_SENTINEL, "setTrustedKeeper(address,bool)", account]),
  ...SENTINEL_ADMINS.map(account => [BSTOCK_PAUSE_SENTINEL, "setMarketMonitored(address,bool)", account]),
];

forking(BLOCK_NUMBER, async () => {
  const acm = new Contract(ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
  const ebrake = new Contract(EBRAKE, EBRAKE_ABI, ethers.provider);
  const sentinel = new Contract(BSTOCK_PAUSE_SENTINEL, SENTINEL_ABI, ethers.provider);
  const comptroller = new Contract(UNITROLLER, COMPTROLLER_ABI, ethers.provider);
  const spokeComptroller = new Contract(BSTOCK_INDEX_COMPTROLLER, SPOKE_COMPTROLLER_ABI, ethers.provider);

  const hasRole = (contract: string, signature: string, account: string) =>
    acm.hasRole(ethers.utils.solidityKeccak256(["address", "string"], [contract, signature]), account);
  // This ACM keys a wildcard by DEFAULT_ADMIN_ROLE (32 zero bytes), not by address(0)
  const hasWildcard = (signature: string, account: string) =>
    acm.hasRole(ethers.utils.solidityKeccak256(["bytes32", "string"], [ethers.constants.HashZero, signature]), account);

  // Pin feed answers on the fork so listing and governance delays do not introduce stale-price failures.
  // VIP-673 has already executed. Run the actual Mainstream listing commands before testing VIP-680.
  before(async () => {
    const timelock = await initMainnetUser(NORMAL_TIMELOCK, parseEther("1"));
    const atlas = new Contract(ATLAS_ORACLE, CHAINLINK_ORACLE_ABI, timelock);
    const apro = new Contract(APRO_ORACLE, CHAINLINK_ORACLE_ABI, timelock);
    for (const market of COLLATERAL_MARKETS_MAINSTREAM) {
      for (const [oracle, feed] of [
        [atlas, market.atlasFeed],
        [apro, market.aproFeed],
      ] as const) {
        if (!feed) continue;
        const aggregator = new Contract(
          feed,
          [
            "function decimals() view returns (uint8)",
            "function latestRoundData() view returns (uint80,int256,uint256,uint256,uint80)",
          ],
          ethers.provider,
        );
        const [, answer] = await aggregator.latestRoundData({ from: oracle.address });
        const decimals = await aggregator.decimals({ from: oracle.address });
        await oracle.setDirectPrice(market.underlying, answer.mul(parseUnits("1", 18 - decimals)));
      }
    }
    const chainlink = new Contract(NETWORK_ADDRESSES.bscmainnet.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, timelock);
    for (const market of LIQUIDITY_MARKETS_MAINSTREAM) {
      await chainlink.setDirectPrice(market.underlying, parseEther("1"));
      await atlas.setDirectPrice(market.underlying, parseEther("1"));
    }
    for (const listing of [vip675, vip677, vip678]) {
      await pretendExecutingVip(await listing(), NORMAL_TIMELOCK);
    }
  });

  describe("Pre-VIP behavior", () => {
    it("sentinel is wired to EBrake and pending Normal Timelock ownership", async () => {
      expect(await sentinel.EBRAKE()).to.equal(EBRAKE);
      expect(await sentinel.accessControlManager()).to.equal(ACCESS_CONTROL_MANAGER);
      expect(await sentinel.owner()).to.equal(DEPLOYER);
      expect(await sentinel.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await sentinel.trustedKeepers(KEEPER)).to.be.false;
      expect(await sentinel.getMonitoredMarkets()).to.be.empty;
    });

    it("EBrake holds its per-contract grants on the Core pool comptroller and no wildcards", async () => {
      for (const signature of [...CORE_PERMISSIONS_TO_REVOKE, ...CORE_ONLY_PERMISSIONS]) {
        expect(await hasRole(UNITROLLER, signature, EBRAKE), signature).to.be.true;
      }
      for (const signature of WILDCARD_PERMISSIONS) {
        expect(await hasWildcard(signature, EBRAKE), signature).to.be.false;
      }
    });

    it("sentinel permissions are not granted", async () => {
      for (const [contract, signature, account] of SENTINEL_PERMISSIONS) {
        expect(
          await acm.isAllowedToCall(account, signature, { from: contract }),
          `${signature} on ${contract} for ${account}`,
        ).to.be.false;
      }
    });

    it("Guardian cannot pause a Spoke market through EBrake", async () => {
      const guardian = await initMainnetUser(GUARDIAN, parseEther("1"));
      // EBrake still calls the Core pool comptroller, where the Spoke market is not listed
      await expect(ebrake.connect(guardian).pauseSupply(vSPYB)).to.be.revertedWith("market not listed");
    });
  });

  testVip("VIP-680 EBrake on Spoke pools and bStock pause sentinel", await vip680(), {
    // The usual proposer has active VIP-678 at this block; this Safe's VIP-677 is already queued.
    proposer: "0x34221485302f6F2029660a000908B5FCABB9BC6e",
    supporters: [
      "0x5176671de05380379399b669ed276feec99d59cb",
      "0xc444949e0054a23c44fc45789738bdf64aed2391",
      "0xeBA4b3c462B9C16f7CCaF4BE6f4D3c17c377411E",
    ],
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PROXY_ABI], ["Upgraded"], [1]);
      await expectEvents(
        txResponse,
        [ACM_ABI],
        ["RoleGranted", "RoleRevoked"],
        [WILDCARD_PERMISSIONS.length + SENTINEL_PERMISSIONS.length, CORE_PERMISSIONS_TO_REVOKE.length],
      );
      await expectEvents(
        txResponse,
        [SENTINEL_ABI],
        ["OwnershipTransferred", "TrustedKeeperUpdated", "MarketMonitoringUpdated"],
        [1, 1, BSTOCK_MARKETS.length],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("EBrake keeps its comptroller, ACM and owner", async () => {
      expect(await ebrake.COMPTROLLER()).to.equal(UNITROLLER);
      expect(await ebrake.IS_REMOTE_CHAIN()).to.be.false;
      expect(await ebrake.accessControlManager()).to.equal(ACCESS_CONTROL_MANAGER);
      expect(await ebrake.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("Normal Timelock owns the sentinel", async () => {
      expect(await sentinel.owner()).to.equal(NORMAL_TIMELOCK);
      expect(await sentinel.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("EBrake holds wildcards instead of its Core pool comptroller grants", async () => {
      for (const signature of WILDCARD_PERMISSIONS) {
        expect(await hasWildcard(signature, EBRAKE), `${signature} wildcard`).to.be.true;
        expect(await acm.isAllowedToCall(EBRAKE, signature, { from: UNITROLLER }), `${signature} on Core`).to.be.true;
        expect(
          await acm.isAllowedToCall(EBRAKE, signature, { from: BSTOCK_INDEX_COMPTROLLER }),
          `${signature} on bStock index`,
        ).to.be.true;
        expect(
          await acm.isAllowedToCall(EBRAKE, signature, { from: MAINSTREAM_COMPTROLLER }),
          `${signature} on bStock mainstream`,
        ).to.be.true;
      }
      for (const signature of CORE_PERMISSIONS_TO_REVOKE) {
        expect(await hasRole(UNITROLLER, signature, EBRAKE), signature).to.be.false;
      }
    });

    it("EBrake keeps its Core-only grants on the Core pool comptroller, without wildcards", async () => {
      for (const signature of CORE_ONLY_PERMISSIONS) {
        expect(await hasRole(UNITROLLER, signature, EBRAKE), signature).to.be.true;
        expect(await hasWildcard(signature, EBRAKE), `${signature} wildcard`).to.be.false;
      }
    });

    it("sentinel permissions are granted", async () => {
      for (const [contract, signature, account] of SENTINEL_PERMISSIONS) {
        expect(
          await acm.isAllowedToCall(account, signature, { from: contract }),
          `${signature} on ${contract} for ${account}`,
        ).to.be.true;
      }
    });

    it("keeper is trusted and every bStock market is monitored", async () => {
      expect(await sentinel.trustedKeepers(KEEPER)).to.be.true;
      const monitored = await sentinel.getMonitoredMarkets();
      expect(monitored).to.have.lengthOf(26);
      expect(monitored).to.have.members(BSTOCK_MARKETS);
    });

    it("no monitored bStock is paused or blocked", async () => {
      for (const market of BSTOCK_MARKETS) {
        const { isPaused, pauseManager } = await sentinel.checkBStockPause(market);
        expect(isPaused, market).to.be.false;
        expect(pauseManager, market).to.equal(PAUSE_MANAGER);
      }
    });
  });

  describe("Post-VIP functional", () => {
    let snapshot: SnapshotRestorer;
    let keeper: Signer;
    let guardian: Signer;
    let pauseManager: Contract;
    let compliance: Contract;

    before(async () => {
      keeper = await initMainnetUser(KEEPER, parseEther("1"));
      guardian = await initMainnetUser(GUARDIAN, parseEther("1"));

      pauseManager = new Contract(PAUSE_MANAGER, PAUSE_MANAGER_ABI, ethers.provider);
      const pauser = await pauseManager.getRoleMember(await pauseManager.OPS_ROLE(), 0);
      pauseManager = pauseManager.connect(await initMainnetUser(pauser, parseEther("1")));

      compliance = new Contract(COMPLIANCE, COMPLIANCE_ABI, ethers.provider);
      const complianceOps = await compliance.getRoleMember(await compliance.OPS_ROLE(), 0);
      compliance = compliance.connect(await initMainnetUser(complianceOps, parseEther("1")));
    });

    beforeEach(async () => {
      snapshot = await takeSnapshot();
    });

    afterEach(async () => {
      await snapshot.restore();
    });

    it("keeper zeroes a Core market's CF when its bStock is paused, keeping LT", async () => {
      const before = await comptroller.poolMarkets(CORE_POOL_ID, vTSLAB);
      expect(before.collateralFactorMantissa).to.equal(CORE_CF);
      expect(before.liquidationThresholdMantissa).to.equal(CORE_LT);

      await pauseManager.pauseToken(TSLAB);
      await expect(sentinel.connect(keeper).handleBStockPause(vTSLAB))
        .to.emit(sentinel, "BStockPauseHandled")
        .withArgs(vTSLAB, TSLAB, PAUSE_MANAGER)
        .and.to.emit(ebrake, "CollateralFactorDecreased")
        .withArgs(BSTOCK_PAUSE_SENTINEL, vTSLAB, CORE_POOL_ID, 0);

      const after = await comptroller.poolMarkets(CORE_POOL_ID, vTSLAB);
      expect(after.collateralFactorMantissa).to.equal(0);
      expect(after.liquidationThresholdMantissa).to.equal(CORE_LT);
      const [snapshotCF, snapshotLT] = await ebrake.getMarketCFSnapshot(vTSLAB, CORE_POOL_ID);
      expect(snapshotCF).to.equal(CORE_CF);
      expect(snapshotLT).to.equal(CORE_LT);
    });

    it("zeroes all 26 markets when their underlying bStocks pause, preserving LT and snapshots", async () => {
      for (const market of BSTOCK_MARKETS) {
        const vToken = new Contract(
          market,
          ["function comptroller() view returns (address)", "function underlying() view returns (address)"],
          ethers.provider,
        );
        const marketComptroller = await vToken.comptroller();
        const isCore = marketComptroller.toLowerCase() === UNITROLLER.toLowerCase();
        const pool = new Contract(marketComptroller, isCore ? COMPTROLLER_ABI : SPOKE_COMPTROLLER_ABI, ethers.provider);
        const before = isCore ? await pool.poolMarkets(CORE_POOL_ID, market) : await pool.markets(market);
        expect(before.isListed, market).to.be.true;
        expect(before.collateralFactorMantissa, market).to.be.gt(0);
        const underlying = await vToken.underlying();
        if (!(await pauseManager.isTokenPaused(underlying))) await pauseManager.pauseToken(underlying);
        await sentinel.connect(keeper).handleBStockPause(market);
        const after = isCore ? await pool.poolMarkets(CORE_POOL_ID, market) : await pool.markets(market);
        expect(after.collateralFactorMantissa, market).to.equal(0);
        expect(after.liquidationThresholdMantissa, market).to.equal(before.liquidationThresholdMantissa);
        const [cf, lt] = await ebrake.getMarketCFSnapshot(market, 0);
        expect(cf, market).to.equal(before.collateralFactorMantissa);
        expect(lt, market).to.equal(before.liquidationThresholdMantissa);
      }
    });

    it("handles the same paused token in Core and Mainstream independently", async () => {
      const mainstream = new Contract(MAINSTREAM_COMPTROLLER, SPOKE_COMPTROLLER_ABI, ethers.provider);
      await pauseManager.pauseToken(TSLAB);
      await sentinel.connect(keeper).handleBStockPause(vTSLAB);
      expect((await mainstream.markets(VTSLAB_MAINSTREAM)).collateralFactorMantissa).to.be.gt(0);
      await sentinel.connect(keeper).handleBStockPause(VTSLAB_MAINSTREAM);
      expect((await comptroller.markets(vTSLAB)).collateralFactorMantissa).to.equal(0);
      expect((await mainstream.markets(VTSLAB_MAINSTREAM)).collateralFactorMantissa).to.equal(0);
    });

    it("keeper zeroes a Spoke market's CF when the compliance module sanctions its vToken, keeping LT", async () => {
      const before = await spokeComptroller.markets(vQQQB);
      expect(before.collateralFactorMantissa).to.equal(SPOKE_CF);
      expect(before.liquidationThresholdMantissa).to.equal(SPOKE_LT);

      await compliance.addToSanctionsList([vQQQB]);
      expect(await pauseManager.isTokenPaused(QQQB)).to.be.false;
      await expect(sentinel.connect(keeper).handleBStockPause(vQQQB))
        .to.emit(sentinel, "BStockPauseHandled")
        .withArgs(vQQQB, QQQB, PAUSE_MANAGER)
        .and.to.emit(ebrake, "CollateralFactorDecreased")
        .withArgs(BSTOCK_PAUSE_SENTINEL, vQQQB, SPOKE_POOL_ID, 0);

      const after = await spokeComptroller.markets(vQQQB);
      expect(after.collateralFactorMantissa).to.equal(0);
      expect(after.liquidationThresholdMantissa).to.equal(SPOKE_LT);
      const [snapshotCF, snapshotLT] = await ebrake.getMarketCFSnapshot(vQQQB, SPOKE_POOL_ID);
      expect(snapshotCF).to.equal(SPOKE_CF);
      expect(snapshotLT).to.equal(SPOKE_LT);
    });

    it("keeper zeroes only the blocklisted market's CF", async () => {
      await compliance.addToBlocklist(SPYB, [vSPYB]);

      await expect(sentinel.connect(keeper).handleBStockPause(vSPYB))
        .to.emit(sentinel, "BStockPauseHandled")
        .withArgs(vSPYB, SPYB, PAUSE_MANAGER);
      await expect(sentinel.connect(keeper).handleBStockPause(vQQQB)).to.not.emit(sentinel, "BStockPauseHandled");

      expect((await spokeComptroller.markets(vSPYB)).collateralFactorMantissa).to.equal(0);
      expect((await spokeComptroller.markets(vQQQB)).collateralFactorMantissa).to.equal(SPOKE_CF);
    });

    it("repeat call on a zeroed market leaves EBrake's snapshot unchanged", async () => {
      await pauseManager.pauseToken(TSLAB);
      await sentinel.connect(keeper).handleBStockPause(vTSLAB);

      const repeat = await sentinel.connect(keeper).handleBStockPause(vTSLAB);
      await expect(repeat).to.emit(sentinel, "BStockPauseHandled").withArgs(vTSLAB, TSLAB, PAUSE_MANAGER);
      await expect(repeat).to.not.emit(ebrake, "CollateralFactorDecreased");
      const [snapshotCF, snapshotLT] = await ebrake.getMarketCFSnapshot(vTSLAB, CORE_POOL_ID);
      expect(snapshotCF).to.equal(CORE_CF);
      expect(snapshotLT).to.equal(CORE_LT);
    });

    it("keeper does nothing for a bStock that is neither paused nor blocked", async () => {
      const handle = await sentinel.connect(keeper).handleBStockPause(vNVDAB);
      await expect(handle).to.not.emit(sentinel, "BStockPauseHandled");
      await expect(handle).to.not.emit(ebrake, "CollateralFactorDecreased");
      expect((await comptroller.poolMarkets(CORE_POOL_ID, vNVDAB)).collateralFactorMantissa).to.equal(CORE_CF);
    });

    it("keeper cannot handle an unmonitored market", async () => {
      await expect(sentinel.connect(keeper).handleBStockPause(VUSDT))
        .to.be.revertedWithCustomError(sentinel, "MarketNotMonitored")
        .withArgs(VUSDT);
    });

    it("untrusted keeper cannot handle a market", async () => {
      await expect(sentinel.connect(guardian).handleBStockPause(vTSLAB)).to.be.revertedWithCustomError(
        sentinel,
        "UnauthorizedKeeper",
      );
    });

    it("Guardian and Timelocks can set keepers and monitored markets, Critical Guardian cannot", async () => {
      for (const account of SENTINEL_ADMINS) {
        const admin = await initMainnetUser(account, parseEther("1"));
        await expect(sentinel.connect(admin).setTrustedKeeper(GUARDIAN, true))
          .to.emit(sentinel, "TrustedKeeperUpdated")
          .withArgs(GUARDIAN, true);
        await expect(sentinel.connect(admin).setMarketMonitored(VUSDT, true))
          .to.emit(sentinel, "MarketMonitoringUpdated")
          .withArgs(VUSDT, true);
      }

      const criticalGuardian = await initMainnetUser(CRITICAL_GUARDIAN, parseEther("1"));
      await expect(sentinel.connect(criticalGuardian).setTrustedKeeper(GUARDIAN, true))
        .to.be.revertedWithCustomError(sentinel, "Unauthorized")
        .withArgs(CRITICAL_GUARDIAN, BSTOCK_PAUSE_SENTINEL, "setTrustedKeeper(address,bool)");
      await expect(sentinel.connect(criticalGuardian).setMarketMonitored(VUSDT, true))
        .to.be.revertedWithCustomError(sentinel, "Unauthorized")
        .withArgs(CRITICAL_GUARDIAN, BSTOCK_PAUSE_SENTINEL, "setMarketMonitored(address,bool)");
    });

    it("Guardian pauses supply and lowers the supply cap of a Core market through EBrake", async () => {
      expect(await comptroller.actionPaused(vTSLAB, MINT_ACTION)).to.be.false;
      await expect(ebrake.connect(guardian).pauseSupply(vTSLAB))
        .to.emit(ebrake, "ActionPaused")
        .withArgs(GUARDIAN, vTSLAB, MINT_ACTION);
      expect(await comptroller.actionPaused(vTSLAB, MINT_ACTION)).to.be.true;

      const newCap = TSLAB_SUPPLY_CAP.div(2);
      expect(await comptroller.supplyCaps(vTSLAB)).to.equal(TSLAB_SUPPLY_CAP);
      await expect(ebrake.connect(guardian).setMarketSupplyCaps([vTSLAB], [newCap]))
        .to.emit(ebrake, "SupplyCapsDecreased")
        .withArgs(GUARDIAN, [vTSLAB], [newCap]);
      expect(await comptroller.supplyCaps(vTSLAB)).to.equal(newCap);
    });

    it("Guardian pauses supply and lowers the supply cap of a Spoke market through EBrake", async () => {
      expect(await spokeComptroller.actionPaused(vSPYB, MINT_ACTION)).to.be.false;
      await expect(ebrake.connect(guardian).pauseSupply(vSPYB))
        .to.emit(ebrake, "ActionPaused")
        .withArgs(GUARDIAN, vSPYB, MINT_ACTION);
      expect(await spokeComptroller.actionPaused(vSPYB, MINT_ACTION)).to.be.true;

      const newCap = SPYB_SUPPLY_CAP.div(2);
      expect(await spokeComptroller.supplyCaps(vSPYB)).to.equal(SPYB_SUPPLY_CAP);
      await expect(ebrake.connect(guardian).setMarketSupplyCaps([vSPYB], [newCap]))
        .to.emit(ebrake, "SupplyCapsDecreased")
        .withArgs(GUARDIAN, [vSPYB], [newCap]);
      expect(await spokeComptroller.supplyCaps(vSPYB)).to.equal(newCap);
    });

    it("Guardian still pauses a Hub through EBrake", async () => {
      const hub = new Contract(HUB_USDT, HUB_ABI, ethers.provider);
      expect(await hub.hubPaused()).to.be.false;
      await expect(ebrake.connect(guardian).pauseHub(HUB_USDT))
        .to.emit(ebrake, "HubPaused")
        .withArgs(GUARDIAN, HUB_USDT);
      expect(await hub.hubPaused()).to.be.true;
    });
  });
});
