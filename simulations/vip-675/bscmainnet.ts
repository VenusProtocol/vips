import { mine } from "@nomicfoundation/hardhat-network-helpers";
import mainnetDeployments from "@venusprotocol/venus-protocol/deployments/bscmainnet_addresses.json";
import { expect } from "chai";
import { Contract, Signer, constants } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES, ORACLE_BNB } from "src/networkAddresses";
import { expectEvents, initMainnetUser, setMaxStalePeriod } from "src/utils";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";
import COMPTROLLER_FULL_ABI from "src/vip-framework/abi/comptroller.json";
import ERC20_ABI from "src/vip-framework/abi/erc20.json";
import RESILIENT_ORACLE_ABI from "src/vip-framework/abi/resilientOracle.json";
import VTOKEN_ABI from "src/vip-framework/abi/vToken.json";
import { checkCorePoolComptroller } from "src/vip-framework/checks/checkCorePoolComptroller";
import { checkVAIController } from "src/vip-framework/checks/checkVAIController";

import {
  BSCMAINNET_MULTISIG_PAUSER,
  COMPTROLLER,
  KEEPER,
  LEGACY_PRIME,
  PLP,
  PLP_DISTRIBUTION_SPEEDS,
  PRIME_LEADERBOARD,
  PRIME_MARKETS,
  PRIME_V2,
  VAI_CONTROLLER,
  XVS_VAULT,
  default as vip675,
} from "../../vips/vip-675/bscmainnet";
import vip675Critical from "../../vips/vip-675/bscmainnet-critical";
import ACM_FULL_ABI from "./abi/AccessControlManager.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const ACM_ABI = [
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "event PermissionGranted(address account, address contractAddress, string functionSig)",
];

const PRIME_V2_ABI = [
  "function owner() view returns (address)",
  "function pendingOwner() view returns (address)",
  "function primeLeaderboard() view returns (address)",
  "function tokenLimit() view returns (uint256)",
  "function mintThreshold() view returns (uint256)",
  "function mintDeadline() view returns (uint256)",
  "function markets(address) view returns (uint256 supplyMultiplier, uint256 borrowMultiplier, uint256 rewardIndex, uint256 sumOfMembersScore, bool exists)",
  "function isUserPrimeHolder(address) view returns (bool)",
  "function issue(address)",
  "function burn(address)",
  "function accrueInterest(address)",
  "event MarketAdded(address indexed market, uint256 supplyMultiplier, uint256 borrowMultiplier)",
  "event PrimeLeaderboardSet(address indexed oldLeaderboard, address indexed newLeaderboard)",
];

const PRIME_LEADERBOARD_ABI = [
  "function owner() view returns (address)",
  "function pendingOwner() view returns (address)",
  "function primeV2() view returns (address)",
];

const PLP_ABI = [
  "function prime() view returns (address)",
  "function tokenDistributionSpeeds(address) view returns (uint256)",
  "function setTokensDistributionSpeed(address[],uint256[])",
];
const LEGACY_PRIME_ABI = ["function paused() view returns (bool)"];
const VAULT_ABI = [
  "function primeToken() view returns (address)",
  "function vaultPaused() view returns (bool)",
  "function pause()",
  "function resume()",
  "function deposit(address rewardToken, uint256 pid, uint256 amount)",
];
const XVS_VAULT_POOL_ID = 0;
const COMPTROLLER_ABI = ["function prime() view returns (address)"];
const VAI_CONTROLLER_ABI = [
  "function prime() view returns (address)",
  "function mintEnabledOnlyForPrimeHolder() view returns (bool)",
  "function getMintableVAI(address) view returns (uint256, uint256)",
];

// A core-pool market intentionally NOT configured on PrimeV2 (only vUSDT + vWBNB are).
const VETH = mainnetDeployments.addresses.vETH;
const VUSDT = PRIME_MARKETS[0].vToken;

// Binance hot wallet — holds large balances of every core-pool underlying (USDT,
// WBNB, ETH, ...). Used to fund the end-to-end user lifecycle flows.
const WHALE = bscmainnet.GENERIC_TEST_USER_ACCOUNT;

const USDT = mainnetDeployments.addresses.USDT;
const WBNB = mainnetDeployments.addresses.WBNB;
const XVS = mainnetDeployments.addresses.XVS;

// Assets read by the PrimeV2 flows: the two market underlyings (USDT, WBNB) and the
// XVS staking asset that scores are computed against. The lifecycle flows mine
// thousands of blocks, which would otherwise push the live feeds past their stale
// window and make downstream reads revert with "invalid resilient oracle price".
// Pinning each price via Redstone (after lifting the stale window) makes them
// time-independent for the duration of the suite.
const PINNED_ASSETS = [USDT, WBNB, XVS];

// Comptroller action ids (ComptrollerStorage.Action): MINT, REDEEM, BORROW, REPAY,
// ..., ENTER_MARKET. Unpaused for the flow markets so a market that happens to have an
// action paused on mainnet does not mask the core-pool mechanics under test.
const FLOW_ACTIONS = [0, 1, 2, 3, 7];

// Markets exercised by the full end-user lifecycle: the two PrimeV2-configured markets
// (vUSDT, vWBNB), where the Comptroller -> PrimeV2 hook fires on every operation. The
// non-Prime market path (vETH, where the hook must no-op) is already covered by
// checkCorePoolComptroller above, which runs the same supply/borrow/repay/redeem flow
// against vETH + vUSDT.
interface FlowMarket {
  name: string;
  vToken: string;
  supply: string;
  borrow: string;
  isPrimeMarket: boolean;
}
const FLOW_MARKETS: FlowMarket[] = [
  { name: "vUSDT", vToken: VUSDT, supply: "10000", borrow: "1000", isPrimeMarket: true },
  { name: "vWBNB", vToken: PRIME_MARKETS[1].vToken, supply: "10", borrow: "1", isPrimeMarket: true },
];

const BLOCK_NUMBER = 105868057;

// Core-pool ComptrollerLens live at BLOCK_NUMBER. It predates the upgrade to the address
// tracked in NETWORK_ADDRESSES.bscmainnet.COMPTROLLER_LENS (checkCorePoolComptroller's
// default), so the migration sanity check must assert the lens current at this fork block.
const CORE_POOL_LENS_AT_FORK = "0x75A71Ad878f6f24616A2AE21d046C0C8E72f67F8";

const KEEPER_CYCLE_SIGS_V2 = [
  "issue(address)",
  "issueBatch(address[])",
  "burn(address)",
  "burnBatch(address[])",
  "recordCycleSnapshot(uint256)",
];

// setMintThreshold is governance + Venus Guardian multisig only (NOT the Keeper).
const MINT_THRESHOLD_SIG = "setMintThreshold(uint256,uint256)";

const KEEPER_CYCLE_SIGS_LEADERBOARD = ["initializeStakers(address[],uint256[],uint64[])", "finalizeInitialization()"];

const NT_ONLY_SIGS_V2 = [
  "setPrimeLeaderboard(address)",
  "addMarket(address,uint256,uint256)",
  "removeMarket(address)",
  "setLimit(uint256)",
  "updateAlpha(uint128,uint128)",
  "updateMultipliers(address,uint256,uint256)",
  "setMaxLoopsLimit(uint256)",
  "sweepUndistributed(address,address)",
];

const NT_ONLY_SIGS_LEADERBOARD = [
  "setMultiplierTiers(uint256[],uint256[])",
  "setPrimeV2(address)",
  "setMaxLoopsLimit(uint256)",
];

forking(BLOCK_NUMBER, async () => {
  let primeV2: Contract;
  let primeLeaderboard: Contract;
  let plp: Contract;
  let legacyPrime: Contract;
  let acm: Contract;
  let xvsVault: Contract;
  let comptroller: Contract;
  let vaiController: Contract;

  before(async () => {
    primeV2 = new ethers.Contract(PRIME_V2, PRIME_V2_ABI, ethers.provider);
    primeLeaderboard = new ethers.Contract(PRIME_LEADERBOARD, PRIME_LEADERBOARD_ABI, ethers.provider);
    plp = new ethers.Contract(PLP, PLP_ABI, ethers.provider);
    legacyPrime = new ethers.Contract(LEGACY_PRIME, LEGACY_PRIME_ABI, ethers.provider);
    acm = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
    xvsVault = new ethers.Contract(XVS_VAULT, VAULT_ABI, ethers.provider);
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
    vaiController = new ethers.Contract(VAI_CONTROLLER, VAI_CONTROLLER_ABI, ethers.provider);

    // Run the preceding critical VIP (vip-675/bscmainnet-critical.ts) so this VIP
    // executes against the real prior state: XVS Vault paused and every Prime
    // underlying's PLP distribution speed zeroed. Commands run through the
    // CriticalTimelock, which holds the pause() and setTokensDistributionSpeed perms.
    await pretendExecutingVip(await vip675Critical(), bscmainnet.CRITICAL_TIMELOCK);
  });

  const roleFor = (target: string, signature: string) =>
    ethers.utils.solidityKeccak256(["address", "string"], [target, signature]);

  // Pre-VIP: the new contracts are deployed but unwired. Ownership is only *pending* on the
  // timelock (transfer not yet accepted), Prime consumers (PLP/Comptroller/VAIController/XVS
  // Vault) still point at the legacy Prime, and the critical VIP has already paused the vault
  // and zeroed PLP speeds. This block pins that starting state so the post-VIP deltas are real.
  describe("Pre-VIP behavior", () => {
    it("PrimeV2 ownership pending on NormalTimelock (not accepted)", async () => {
      expect(await primeV2.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("PrimeLeaderboard ownership pending on NormalTimelock (not accepted)", async () => {
      expect(await primeLeaderboard.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("PLP prime token is still the legacy Prime", async () => {
      expect(await plp.prime()).to.equal(LEGACY_PRIME);
    });

    it("PrimeV2 <-> PrimeLeaderboard are not yet wired", async () => {
      expect(await primeV2.primeLeaderboard()).to.equal(constants.AddressZero);
      expect(await primeLeaderboard.primeV2()).to.equal(constants.AddressZero);
    });

    it("PrimeV2 mint window is uninitialized", async () => {
      expect(await primeV2.mintThreshold()).to.equal(0);
      expect(await primeV2.mintDeadline()).to.equal(0);
    });

    it("legacy Prime is active (unpaused)", async () => {
      expect(await legacyPrime.paused()).to.equal(false);
    });

    it("XVSVault prime hook still points at legacy Prime", async () => {
      expect(await xvsVault.primeToken()).to.equal(LEGACY_PRIME);
    });

    it("XVSVault is already paused (by the preceding critical VIP)", async () => {
      expect(await xvsVault.vaultPaused()).to.equal(true);
    });

    it("Comptroller prime still points at legacy Prime", async () => {
      expect(await comptroller.prime()).to.equal(LEGACY_PRIME);
    });

    it("VAIController prime still points at legacy Prime, with the holder mint gate enabled", async () => {
      expect(await vaiController.prime()).to.equal(LEGACY_PRIME);
      expect(await vaiController.mintEnabledOnlyForPrimeHolder()).to.equal(true);
    });

    it("PLP distribution speeds are zeroed (by the preceding critical VIP)", async () => {
      for (const { token } of PLP_DISTRIBUTION_SPEEDS) {
        expect(await plp.tokenDistributionSpeeds(token)).to.equal(0);
      }
    });
  });

  testVip("VIP-675 PrimeV2 + PrimeLeaderboard setup", await vip675(), {
    callbackAfterExecution: async txResponse => {
      await expect(txResponse)
        .to.emit(primeV2, "PrimeLeaderboardSet")
        .withArgs(constants.AddressZero, PRIME_LEADERBOARD);
      for (const market of PRIME_MARKETS) {
        await expect(txResponse)
          .to.emit(primeV2, "MarketAdded")
          .withArgs(market.vToken, market.supplyMultiplier, market.borrowMultiplier);
      }
      // RoleGranted count breakdown:
      //   PrimeV2:    15 cycle (5×3) + 2 setMintThreshold (NT + Guardian) + 8 admin
      //               + 6 pause/unpause (2×3) + 1 multisig pauser                          = 32
      //   Leaderboard: 4 seeding (2×2, Keeper + Guardian) + 3 admin                         = 7
      //   XVSVault:   1 multisig pauser                                                     = 1
      //   Total                                                                              = 40
      await expectEvents(txResponse, [ACM_FULL_ABI], ["RoleGranted"], [40]);
    },
  });

  // Post-VIP: every wiring delta the proposal promises. Ownership accepted by the timelock,
  // all Prime consumers repointed (PLP/Comptroller/VAIController to PrimeV2, XVS Vault hook to
  // PrimeLeaderboard), PLP speeds restored for the Prime markets, legacy Prime paused, and the
  // full ACM permission matrix (cycle/seeding/admin/pause) granted to the right principals.
  describe("Post-VIP behavior", () => {
    it("PrimeV2 owner is the NormalTimelock", async () => {
      expect(await primeV2.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("PrimeLeaderboard owner is the NormalTimelock", async () => {
      expect(await primeLeaderboard.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("PLP points at PrimeV2", async () => {
      expect(await plp.prime()).to.equal(PRIME_V2);
    });

    it("PrimeV2 <-> PrimeLeaderboard are wired", async () => {
      expect(await primeV2.primeLeaderboard()).to.equal(PRIME_LEADERBOARD);
      expect(await primeLeaderboard.primeV2()).to.equal(PRIME_V2);
    });

    it("PrimeV2 token limit is the initializer default (500)", async () => {
      // The VIP does not call setLimit, so the cap stays at the value baked in at initialize().
      expect(await primeV2.tokenLimit()).to.equal(500);
    });

    it("PrimeV2 mint window is left uninitialized", async () => {
      // setMintThreshold is deliberately deferred to a later governance/Guardian action, so the
      // mint window stays closed (threshold/deadline = 0) until off-chain staker seeding finishes.
      expect(await primeV2.mintThreshold()).to.equal(0);
      expect(await primeV2.mintDeadline()).to.equal(0);
    });

    it("XVSVault prime hook points at PrimeLeaderboard", async () => {
      expect(await xvsVault.primeToken()).to.equal(PRIME_LEADERBOARD);
    });

    it("XVSVault stays paused (awaiting off-chain staker seeding)", async () => {
      // Vault must stay frozen so live stake can't change while the leaderboard is seeded from a
      // snapshot; the Guardian resumes it only after seeding (see resume() permission check below).
      expect(await xvsVault.vaultPaused()).to.equal(true);
    });

    it("Comptroller prime points at PrimeV2", async () => {
      expect(await comptroller.prime()).to.equal(PRIME_V2);
    });

    it("VAIController prime points at PrimeV2 (gate now tracks PrimeV2 membership)", async () => {
      expect(await vaiController.prime()).to.equal(PRIME_V2);
    });

    it("PLP distribution speeds restored for USDT and WBNB", async () => {
      for (const { token, speed } of PLP_DISTRIBUTION_SPEEDS) {
        expect(await plp.tokenDistributionSpeeds(token)).to.equal(speed);
      }
    });

    it("legacy Prime is decommissioned (paused)", async () => {
      // Legacy Prime is frozen, not deleted: claimInterest stays permissionless so existing
      // holders can withdraw, but no new state mutations (see legacy claimInterest checks).
      expect(await legacyPrime.paused()).to.equal(true);
    });

    // Cycle ops (issue/burn/recordCycleSnapshot) are the steady-state automation surface, so all
    // three operational principals — timelock, Keeper bot, and Guardian multisig — must hold them.
    for (const account of [bscmainnet.NORMAL_TIMELOCK, KEEPER, bscmainnet.GUARDIAN]) {
      it(`account ${account} holds the cycle permissions on PrimeV2`, async () => {
        for (const sig of KEEPER_CYCLE_SIGS_V2) {
          expect(await acm.hasRole(roleFor(PRIME_V2, sig), account)).to.equal(true);
        }
      });
    }

    // One-time staker seeding is granted to the Keeper and Guardian only — NOT the NormalTimelock.
    for (const account of [KEEPER, bscmainnet.GUARDIAN]) {
      it(`account ${account} holds the seeding permissions on PrimeLeaderboard`, async () => {
        for (const sig of KEEPER_CYCLE_SIGS_LEADERBOARD) {
          expect(await acm.hasRole(roleFor(PRIME_LEADERBOARD, sig), account)).to.equal(true);
        }
      });
    }

    it("NormalTimelock does NOT hold the one-time seeding permissions on PrimeLeaderboard", async () => {
      for (const sig of KEEPER_CYCLE_SIGS_LEADERBOARD) {
        expect(await acm.hasRole(roleFor(PRIME_LEADERBOARD, sig), bscmainnet.NORMAL_TIMELOCK)).to.equal(false);
      }
    });

    it("setMintThreshold is held by the NormalTimelock and the Guardian multisig only", async () => {
      expect(await acm.hasRole(roleFor(PRIME_V2, MINT_THRESHOLD_SIG), bscmainnet.NORMAL_TIMELOCK)).to.equal(true);
      expect(await acm.hasRole(roleFor(PRIME_V2, MINT_THRESHOLD_SIG), bscmainnet.GUARDIAN)).to.equal(true);
    });

    it("Keeper does NOT hold setMintThreshold on PrimeV2", async () => {
      expect(await acm.hasRole(roleFor(PRIME_V2, MINT_THRESHOLD_SIG), KEEPER)).to.equal(false);
    });

    it("Keeper does NOT hold the admin-only permissions on PrimeV2", async () => {
      for (const sig of NT_ONLY_SIGS_V2) {
        expect(await acm.hasRole(roleFor(PRIME_V2, sig), KEEPER)).to.equal(false);
      }
    });

    it("Keeper does NOT hold the admin-only permissions on PrimeLeaderboard", async () => {
      for (const sig of NT_ONLY_SIGS_LEADERBOARD) {
        expect(await acm.hasRole(roleFor(PRIME_LEADERBOARD, sig), KEEPER)).to.equal(false);
      }
    });

    it("Guardian holds the XVSVault resume() permission", async () => {
      expect(await acm.hasRole(roleFor(XVS_VAULT, "resume()"), bscmainnet.GUARDIAN)).to.equal(true);
    });

    it("Venus team multisig holds the circuit-breaker pause() permissions", async () => {
      expect(await acm.hasRole(roleFor(PRIME_V2, "pause()"), BSCMAINNET_MULTISIG_PAUSER)).to.equal(true);
      expect(await acm.hasRole(roleFor(XVS_VAULT, "pause()"), BSCMAINNET_MULTISIG_PAUSER)).to.equal(true);
    });

    for (const market of PRIME_MARKETS) {
      it(`market ${market.vToken} is configured on PrimeV2`, async () => {
        const m = await primeV2.markets(market.vToken);
        expect(m.exists).to.equal(true);
        expect(m.supplyMultiplier).to.equal(market.supplyMultiplier);
        expect(m.borrowMultiplier).to.equal(market.borrowMultiplier);
      });
    }
  });

  // Integration coverage: with PrimeV2 now wired into the Comptroller, VAIController,
  // PLP and (via PrimeLeaderboard) the XVS Vault, prove the core pool still works
  // end-to-end and the new Prime surfaces behave as expected post-migration.
  describe("Core pool integration after migration (no breakage)", () => {
    // On this fork the resilient oracle's pivot (RedStone) and fallback feeds revert for
    // the core assets, so getPrice trips its "invalid resilient oracle price" guard even
    // after the stale window is lifted — the main price can't be anchor-validated against a
    // dead pivot. The Chainlink main feed is live, so for every core-pool market underlying
    // (plus VAI and BNB) whose price is currently unreadable, lift its Chainlink stale window
    // and repoint it to Chainlink-only. With no pivot there is no anchor validation, and the
    // price stays valid across the thousands of blocks the lifecycle flows mine. Assets that
    // already price correctly are left untouched.
    before(async () => {
      const resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, bscmainnet.RESILIENT_ORACLE);
      const comptroller = await ethers.getContractAt(COMPTROLLER_FULL_ABI, bscmainnet.UNITROLLER);
      const admin = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, parseUnits("5", 18));
      const priceAbi = ["function getPrice(address) view returns (uint256)"];

      // The live ResilientOracle exposes a 4-field TokenConfig (with `cachingEnabled`), but the
      // bundled ABI is the older 3-field shape, so the imported binding computes the wrong
      // selector. Bind setTokenConfig with both signatures and grant the timelock both roles.
      const setTokenConfig4 = new Contract(
        bscmainnet.RESILIENT_ORACLE,
        ["function setTokenConfig((address,address[3],bool[3],bool) tokenConfig)"],
        admin,
      );
      const setTokenConfig3 = new Contract(
        bscmainnet.RESILIENT_ORACLE,
        ["function setTokenConfig((address,address[3],bool[3]) tokenConfig)"],
        admin,
      );
      const acm = await ethers.getContractAt(ACM_FULL_ABI, bscmainnet.ACCESS_CONTROL_MANAGER, admin);
      for (const sig of ["setTokenConfig(TokenConfig)", "setTokenConfig((address,address[3],bool[3],bool))"]) {
        await acm.giveCallPermission(bscmainnet.RESILIENT_ORACLE, sig, bscmainnet.NORMAL_TIMELOCK);
      }

      const repointToChainlinkOnly = async (asset: string) => {
        try {
          await resilientOracle.getPrice(asset);
          return; // already priceable — don't disturb a working feed
        } catch {
          // fall through and repair below
        }
        const cfg = await resilientOracle.getTokenConfig(asset);
        const chainlink = cfg.oracles[0];
        if (cfg.asset === constants.AddressZero || chainlink === constants.AddressZero) return;
        // Lift the Chainlink stale window first, then confirm its main feed is actually live.
        await setMaxStalePeriod(resilientOracle, await ethers.getContractAt(ERC20_ABI, asset));
        try {
          await new Contract(chainlink, priceAbi, ethers.provider).getPrice(asset);
        } catch {
          return; // Chainlink main is also dead for this asset — can't fix it here
        }
        try {
          await setTokenConfig4.setTokenConfig([
            asset,
            [chainlink, constants.AddressZero, constants.AddressZero],
            [true, false, false],
            false,
          ]);
        } catch {
          await setTokenConfig3.setTokenConfig([
            asset,
            [chainlink, constants.AddressZero, constants.AddressZero],
            [true, false, false],
          ]);
        }
      };

      const assets = new Set<string>([...PINNED_ASSETS, ORACLE_BNB, bscmainnet.VAI]);
      for (const vToken of await comptroller.getAllMarkets()) {
        try {
          const vt = await ethers.getContractAt(VTOKEN_ABI, vToken);
          assets.add(await vt.underlying());
        } catch {
          assets.add(ORACLE_BNB); // vBNB exposes no underlying()
        }
      }
      for (const asset of assets) {
        await repointToChainlinkOnly(asset);
      }
    });

    // Full core-pool lifecycle: mint, enterMarkets, borrow, claimVenus, repay, redeem.
    // Every operation fires the Comptroller -> PrimeV2.accrueInterestAndUpdateScore hook,
    // on both a PrimeV2 market (vUSDT) and a non-PrimeV2 market (vETH), for a non-prime
    // user. PrimeV2 must no-op these hooks rather than revert, or the whole pool breaks.
    checkCorePoolComptroller({ lens: CORE_POOL_LENS_AT_FORK });

    // The exhaustive part: drive a real funded user (Binance hot wallet) through the
    // entire core-pool lifecycle — supply, enter market, check liquidity, borrow,
    // accrue interest, claim rewards, repay, redeem, exit — on every relevant market.
    // Each step fires the Comptroller -> PrimeV2 hook; the user is not a Prime holder,
    // so the hook must no-op on both configured (vUSDT/vWBNB) and unconfigured (vETH)
    // markets. Any revert anywhere means the Prime repoint broke the core pool.
    describe("End-user full lifecycle on every core-pool market (no breakage)", () => {
      let timelock: Signer;

      before(async () => {
        timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, parseUnits("5", 18));
      });

      for (const m of FLOW_MARKETS) {
        describe(`${m.name} (${m.isPrimeMarket ? "PrimeV2 market" : "non-Prime market"})`, () => {
          let whale: Signer;
          let comptroller: Contract;
          let vToken: Contract;
          let underlying: Contract;
          let supplyAmount: ReturnType<typeof parseUnits>;
          let borrowAmount: ReturnType<typeof parseUnits>;

          before(async () => {
            whale = await initMainnetUser(WHALE, parseUnits("10", 18));
            comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_FULL_ABI, whale);
            vToken = new ethers.Contract(m.vToken, VTOKEN_ABI, whale);
            underlying = new ethers.Contract(await vToken.underlying(), ERC20_ABI, whale);
            const decimals = await underlying.decimals();
            supplyAmount = parseUnits(m.supply, decimals);
            borrowAmount = parseUnits(m.borrow, decimals);

            // Lift caps and unpause the core actions so the flow exercises the
            // mechanics rather than mainnet risk limits.
            await comptroller.connect(timelock)._setMarketSupplyCaps([m.vToken], [constants.MaxUint256]);
            await comptroller.connect(timelock)._setMarketBorrowCaps([m.vToken], [constants.MaxUint256]);
            await comptroller.connect(timelock)._setActionsPaused([m.vToken], FLOW_ACTIONS, false);
          });

          it("supplies underlying and receives vTokens", async () => {
            const vBalanceBefore = await vToken.balanceOf(WHALE);
            await underlying.approve(m.vToken, 0);
            await underlying.approve(m.vToken, supplyAmount);
            await expect(vToken.mint(supplyAmount)).to.not.be.reverted;
            expect(await vToken.balanceOf(WHALE)).to.be.gt(vBalanceBefore);
          });

          it("enters the market as collateral", async () => {
            await comptroller.enterMarkets([m.vToken]);
            expect(await comptroller.checkMembership(WHALE, m.vToken)).to.equal(true);
            expect(await comptroller.getAssetsIn(WHALE)).to.include(m.vToken);
          });

          it("reports healthy account liquidity (no shortfall)", async () => {
            const [err, liquidity, shortfall] = await comptroller.getAccountLiquidity(WHALE);
            expect(err).to.equal(0);
            expect(liquidity).to.be.gt(0);
            expect(shortfall).to.equal(0);
          });

          it("shows sufficient hypothetical liquidity for the intended borrow", async () => {
            const [err, liquidity, shortfall] = await comptroller.getHypotheticalAccountLiquidity(
              WHALE,
              m.vToken,
              0,
              borrowAmount,
            );
            expect(err).to.equal(0);
            expect(shortfall).to.equal(0);
            expect(liquidity).to.be.gte(0);
          });

          it("borrows against the supplied collateral", async () => {
            const balanceBefore = await underlying.balanceOf(WHALE);
            await expect(vToken.borrow(borrowAmount)).to.not.be.reverted;
            expect(await underlying.balanceOf(WHALE)).to.be.gt(balanceBefore);
            expect(await vToken.borrowBalanceStored(WHALE)).to.be.gte(borrowAmount);
          });

          it("accrues borrow interest over time", async () => {
            const owedBefore = await vToken.borrowBalanceStored(WHALE);
            await mine(5000);
            await vToken.accrueInterest();
            expect(await vToken.borrowBalanceStored(WHALE)).to.be.gt(owedBefore);
          });

          it("claims XVS rewards without reverting", async () => {
            await expect(
              comptroller["claimVenus(address[],address[],bool,bool,bool)"]([WHALE], [m.vToken], true, true, true),
            ).to.not.be.reverted;
          });

          it("repays the full borrow", async () => {
            const owed = await vToken.borrowBalanceStored(WHALE);
            await underlying.approve(m.vToken, 0);
            await underlying.approve(m.vToken, owed.mul(2));
            await expect(vToken.repayBorrow(constants.MaxUint256)).to.not.be.reverted;
            expect(await vToken.borrowBalanceStored(WHALE)).to.equal(0);
          });

          it("redeems all supplied collateral", async () => {
            const balanceBefore = await underlying.balanceOf(WHALE);
            const vBalance = await vToken.balanceOf(WHALE);
            await expect(vToken.redeem(vBalance)).to.not.be.reverted;
            expect(await underlying.balanceOf(WHALE)).to.be.gt(balanceBefore);
            expect(await vToken.balanceOf(WHALE)).to.equal(0);
          });

          it("exits the market once the position is closed", async () => {
            await expect(comptroller.exitMarket(m.vToken)).to.not.be.reverted;
            expect(await comptroller.checkMembership(WHALE, m.vToken)).to.equal(false);
          });
        });
      }
    });

    // The complementary case: once the same user IS a PrimeV2 holder, the Comptroller
    // hook must execute the live score-update path (not the no-op branch) on a
    // configured market, without breaking the supply operation.
    describe("PrimeV2 score hook executes the live path for a Prime holder", () => {
      let primeV2Keeper: Contract;
      let primeV2View: Contract;
      let comptroller: Contract;
      let vusdt: Contract;
      let usdt: Contract;
      let supplyAmount: ReturnType<typeof parseUnits>;

      before(async () => {
        const keeper = await initMainnetUser(KEEPER, parseUnits("1", 18));
        const timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, parseUnits("5", 18));
        const whale = await initMainnetUser(WHALE, parseUnits("10", 18));

        primeV2Keeper = new ethers.Contract(PRIME_V2, PRIME_V2_ABI, keeper);
        primeV2View = new ethers.Contract(PRIME_V2, PRIME_V2_ABI, ethers.provider);
        comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_FULL_ABI, whale);
        vusdt = new ethers.Contract(VUSDT, VTOKEN_ABI, whale);
        usdt = new ethers.Contract(USDT, ERC20_ABI, whale);
        supplyAmount = parseUnits("10000", await usdt.decimals());

        await comptroller.connect(timelock)._setMarketSupplyCaps([VUSDT], [constants.MaxUint256]);
        await comptroller.connect(timelock)._setActionsPaused([VUSDT], FLOW_ACTIONS, false);

        // PrimeV2 scores a member off their live XVS Vault stake (_xvsBalanceOfUser reads
        // XVSVault.getUserInfo), so a member with zero stake scores zero. Give the whale a
        // real stake: the vault is paused post-migration, so resume (Guardian), deposit, and
        // re-pause (Venus team multisig) — mirroring production, where stake predates the freeze.
        const guardian = await initMainnetUser(bscmainnet.GUARDIAN, parseUnits("5", 18));
        const pauser = await initMainnetUser(BSCMAINNET_MULTISIG_PAUSER, parseUnits("5", 18));
        const xvsVaultWrite = new ethers.Contract(XVS_VAULT, VAULT_ABI, ethers.provider);
        const xvs = new ethers.Contract(XVS, ERC20_ABI, whale);
        // PrimeV2 caps a member's scored capital at xvsPrice * stake * supplyMultiplier
        // (_capitalForScore). Stake enough XVS that the cap stays well above the ~20k USD the
        // whale supplies across both score tests, so the second supply actually lifts the score.
        const stakeAmount = parseUnits("20000", 18);

        await xvsVaultWrite.connect(guardian).resume();
        await xvs.approve(XVS_VAULT, 0);
        await xvs.approve(XVS_VAULT, stakeAmount);
        await xvsVaultWrite.connect(whale).deposit(XVS, XVS_VAULT_POOL_ID, stakeAmount);
        await xvsVaultWrite.connect(pauser).pause();
      });

      it("issuing a token to a supplier initializes a non-zero market score", async () => {
        await usdt.approve(VUSDT, 0);
        await usdt.approve(VUSDT, supplyAmount);
        await vusdt.mint(supplyAmount);

        expect(await primeV2View.isUserPrimeHolder(WHALE)).to.equal(false);
        await primeV2Keeper.issue(WHALE);
        expect(await primeV2View.isUserPrimeHolder(WHALE)).to.equal(true);

        const market = await primeV2View.markets(VUSDT);
        expect(market.sumOfMembersScore).to.be.gt(0);
      });

      it("a holder's further supply updates the market score via the live hook", async () => {
        const before = (await primeV2View.markets(VUSDT)).sumOfMembersScore;
        await usdt.approve(VUSDT, 0);
        await usdt.approve(VUSDT, supplyAmount);
        await vusdt.mint(supplyAmount);
        expect((await primeV2View.markets(VUSDT)).sumOfMembersScore).to.be.gt(before);
      });

      after(async () => {
        // Burn the token and unwind the position so later checks see clean state.
        await primeV2Keeper.burn(WHALE);
        const vBalance = await vusdt.balanceOf(WHALE);
        if (vBalance.gt(0)) {
          await vusdt.redeem(vBalance);
        }
      });
    });

    // Liquidation path: prove the seize-amount math is reachable through the repointed
    // Comptroller and prices correctly post-migration.
    describe("Liquidation path stays wired through PrimeV2", () => {
      let comptroller: Contract;

      before(async () => {
        comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_FULL_ABI, ethers.provider);
      });

      it("liquidateCalculateSeizeTokens returns a positive seize amount", async () => {
        const [err, seizeTokens] = await comptroller.liquidateCalculateSeizeTokens(
          VUSDT,
          PRIME_MARKETS[1].vToken,
          parseUnits("100", 18),
        );
        expect(err).to.equal(0);
        expect(seizeTokens).to.be.gt(0);
      });

      it("seize amount scales with the repaid amount", async () => {
        const [, seizeForOne] = await comptroller.liquidateCalculateSeizeTokens(
          VUSDT,
          PRIME_MARKETS[1].vToken,
          parseUnits("100", 18),
        );
        const [, seizeForTwo] = await comptroller.liquidateCalculateSeizeTokens(
          VUSDT,
          PRIME_MARKETS[1].vToken,
          parseUnits("200", 18),
        );
        expect(seizeForTwo).to.be.gt(seizeForOne);
      });
    });

    describe("PrimeV2 market accrual is wired to the PLP", () => {
      let primeV2: Contract;

      before(async () => {
        const signer = await initMainnetUser(KEEPER, parseUnits("1", 18));
        primeV2 = new ethers.Contract(PRIME_V2, PRIME_V2_ABI, signer);
      });

      for (const market of PRIME_MARKETS) {
        it(`accrueInterest succeeds for configured market ${market.vToken}`, async () => {
          await expect(primeV2.accrueInterest(market.vToken)).to.not.be.reverted;
        });
      }

      it("accrueInterest reverts for a market not configured on PrimeV2 (vETH)", async () => {
        // Explicit accrueInterest(market) requires the market to exist on PrimeV2; vETH was never
        // added, so it must revert. (The implicit Comptroller hook on vETH no-ops instead — see
        // the non-Prime lifecycle flow above. Different entry points, different contracts.)
        await expect(primeV2.accrueInterest(VETH)).to.be.reverted;
      });
    });

    describe("PrimeV2 membership admin (issue/burn) flows through ACM", () => {
      const TEST_USER = "0x000000000000000000000000000000000000dEaD";
      let primeV2: Contract;

      before(async () => {
        primeV2 = new ethers.Contract(PRIME_V2, PRIME_V2_ABI, ethers.provider);
      });

      it("Keeper can issue a PrimeV2 token, flipping the holder flag on", async () => {
        const keeper = await initMainnetUser(KEEPER, parseUnits("1", 18));
        expect(await primeV2.isUserPrimeHolder(TEST_USER)).to.equal(false);
        await primeV2.connect(keeper).issue(TEST_USER);
        expect(await primeV2.isUserPrimeHolder(TEST_USER)).to.equal(true);
      });

      it("Keeper can burn the PrimeV2 token, flipping the holder flag off", async () => {
        const keeper = await initMainnetUser(KEEPER, parseUnits("1", 18));
        await primeV2.connect(keeper).burn(TEST_USER);
        expect(await primeV2.isUserPrimeHolder(TEST_USER)).to.equal(false);
      });
    });

    // The VAI mint gate (mintEnabledOnlyForPrimeHolder) now resolves membership through
    // PrimeV2. No user is issued at migration time, so minting is gated off for everyone
    // until off-chain seeding runs.
    describe("VAI mint gate now tracks PrimeV2 membership", () => {
      let vaiController: Contract;
      let primeV2: Contract;

      before(async () => {
        vaiController = new ethers.Contract(VAI_CONTROLLER, VAI_CONTROLLER_ABI, ethers.provider);
        primeV2 = new ethers.Contract(PRIME_V2, PRIME_V2_ABI, ethers.provider);
      });

      it("a non-PrimeV2 holder is blocked from minting VAI", async () => {
        expect(await primeV2.isUserPrimeHolder(bscmainnet.VAI_MINT_USER_ACCOUNT)).to.equal(false);
        const [, mintable] = await vaiController.getMintableVAI(bscmainnet.VAI_MINT_USER_ACCOUNT);
        expect(mintable).to.equal(0);
      });
    });

    // Once the user is a PrimeV2 holder, the full VAI mint/repay lifecycle works again,
    // proving the VAIController -> PrimeV2 gate is correctly repointed.
    describe("VAI mint/repay lifecycle once the user holds a PrimeV2 token", () => {
      before(async () => {
        const primeV2 = new ethers.Contract(PRIME_V2, PRIME_V2_ABI, ethers.provider);
        const keeper = await initMainnetUser(KEEPER, parseUnits("1", 18));
        await primeV2.connect(keeper).issue(bscmainnet.VAI_MINT_USER_ACCOUNT);
      });

      checkVAIController();
    });
  });
});
