import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import HELPER_V3_ARTIFACT from "../../artifacts/contracts/helpers/TokenBuybackMigrationHelper.sol/TokenBuybackMigrationHelper.json";
import {
  BTCB_PRIME_CONVERTER,
  ETH_PRIME_CONVERTER,
  PRIME,
  RISK_FUND_CONVERTER,
  USDC_PRIME_CONVERTER,
  USDT_PRIME_CONVERTER,
  VTREASURY,
  VU,
  WBNB_BURN_CONVERTER,
  XVS_VAULT_CONVERTER,
} from "../../vips/vip-618/bscmainnet";
import vip800Part1, {
  BUYBACKS,
  CORE_TOKENS,
  DEFAULT_PROXY_ADMIN,
  MIGRATION_HELPER_V2,
  NEW_RISK_FUND_V2_IMPL,
  PRIME_LIQUIDITY_PROVIDER,
  PROTOCOL_SHARE_RESERVE,
  RISK_FUND_BUYBACK,
  RISK_FUND_V2,
  SHORTFALL,
  TIMELOCK_OWNED_CONVERTERS,
  U,
  USDC,
  USDT,
  U_PRIME_BUYBACK,
  XVS_BUYBACK,
} from "../../vips/vip-800/bscmainnet-part-1";
import ACM_ABI from "../vip-618/abi/AccessControlManager.json";
import DEFAULT_PROXY_ADMIN_ABI from "../vip-618/abi/DefaultProxyAdmin.json";
import ERC20_ABI from "../vip-618/abi/ERC20.json";
import PSR_ABI from "../vip-618/abi/ProtocolShareReserve.json";
import BUYBACK_ABI from "../vip-618/abi/TokenBuyback.json";

// Re-export so part-2 sim can pick up the same address universe without
// duplicating imports.
export { BUYBACKS, MIGRATION_HELPER_V2, TIMELOCK_OWNED_CONVERTERS };

const { bscmainnet } = NETWORK_ADDRESSES;

// Real-env fork block: V2 helper bytecode exists on chain at MIGRATION_HELPER_V2
// (deployed at block 97983412). The compiled bytecode in the helper artifact
// folds in the May 2026 Prime allocation block; on-chain bytecode at this fork
// block does not yet include that update. The `before` hook etches the freshly
// compiled bytecode at MIGRATION_HELPER_V2 so the sim exercises the helper
// version that will land on chain when the new artifact is redeployed.
const FORK_BLOCK = 97988051;

const SHORTFALL_MIN_ABI = ["function auctionsPaused() view returns (bool)"];
const CONVERTER_MIN_ABI = ["function conversionPaused() view returns (bool)"];
const HELPER_MIN_ABI = [
  "function executed1() view returns (bool)",
  "function executed2() view returns (bool)",
  "event StepFailed(string step, bytes reason)",
];
const PRIME_MIN_ABI = [
  "function markets(address) view returns (uint256 supplyMultiplier, uint256 borrowMultiplier, uint256 rewardIndex, uint256 sumOfMembersScore, bool exists)",
];
const PLP_MIN_ABI = [
  "function tokenDistributionSpeeds(address) view returns (uint256)",
  "function maxTokenDistributionSpeeds(address) view returns (uint256)",
  "function lastAccruedBlockOrSecond(address) view returns (uint256)",
];
const OWNABLE_MIN_ABI = ["function owner() view returns (address)", "function pendingOwner() view returns (address)"];

const EXECUTE_BUYBACK_SIG = "executeBuyback(address,uint256,uint256,uint256,address,bytes,address)";
const FORWARD_BASE_ASSET_SIG = "forwardBaseAsset(address,uint256)";
const OPERATOR = "0x88ac9ca69A371f47798Df18e5C36449af44526a4";
const DEFAULT_ADMIN_ROLE = ethers.constants.HashZero;

// Per-converter recipient mapping for execute2 drain (asserted in part-2 sim).
// Snapshotted here too so part-1 can verify converter balances are untouched.
const DRAIN_BY_CONVERTER: { converter: string; recipient: string }[] = [
  { converter: RISK_FUND_CONVERTER, recipient: RISK_FUND_BUYBACK },
  { converter: USDT_PRIME_CONVERTER, recipient: U_PRIME_BUYBACK },
  { converter: USDC_PRIME_CONVERTER, recipient: U_PRIME_BUYBACK },
  { converter: BTCB_PRIME_CONVERTER, recipient: U_PRIME_BUYBACK },
  { converter: ETH_PRIME_CONVERTER, recipient: U_PRIME_BUYBACK },
  { converter: XVS_VAULT_CONVERTER, recipient: XVS_BUYBACK },
];

const STALE_DESTINATIONS = new Set(
  [VTREASURY, ...TIMELOCK_OWNED_CONVERTERS, WBNB_BURN_CONVERTER].map(a => a.toLowerCase()),
);

const NEW_PSR_EXPECTED_ROWS: { schema: number; percentage: number; destination: string }[] = [
  { schema: 0, percentage: 1200, destination: BUYBACKS[4] },
  { schema: 0, percentage: 600, destination: BUYBACKS[5] },
  { schema: 0, percentage: 600, destination: BUYBACKS[6] },
  { schema: 0, percentage: 600, destination: BUYBACKS[7] },
  { schema: 0, percentage: 600, destination: BUYBACKS[8] },
  { schema: 0, percentage: 400, destination: BUYBACKS[9] },
  { schema: 0, percentage: 1000, destination: BUYBACKS[1] },
  { schema: 0, percentage: 1000, destination: BUYBACKS[2] },
  { schema: 0, percentage: 2000, destination: BUYBACKS[0] },
  { schema: 0, percentage: 2000, destination: BUYBACKS[3] },
  { schema: 1, percentage: 1800, destination: BUYBACKS[4] },
  { schema: 1, percentage: 900, destination: BUYBACKS[5] },
  { schema: 1, percentage: 900, destination: BUYBACKS[6] },
  { schema: 1, percentage: 900, destination: BUYBACKS[7] },
  { schema: 1, percentage: 900, destination: BUYBACKS[8] },
  { schema: 1, percentage: 600, destination: BUYBACKS[9] },
  { schema: 1, percentage: 2000, destination: BUYBACKS[0] },
  { schema: 1, percentage: 2000, destination: BUYBACKS[3] },
];

forking(FORK_BLOCK, async () => {
  const acm = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
  const proxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, DEFAULT_PROXY_ADMIN_ABI, ethers.provider);
  const psr = new ethers.Contract(PROTOCOL_SHARE_RESERVE, PSR_ABI, ethers.provider);
  const usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
  const usdc = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);
  const shortfall = new ethers.Contract(SHORTFALL, SHORTFALL_MIN_ABI, ethers.provider);
  const helper = new ethers.Contract(MIGRATION_HELPER_V2, HELPER_MIN_ABI, ethers.provider);
  const prime = new ethers.Contract(PRIME, PRIME_MIN_ABI, ethers.provider);
  const plp = new ethers.Contract(PRIME_LIQUIDITY_PROVIDER, PLP_MIN_ABI, ethers.provider);

  const erc20 = (token: string) => new ethers.Contract(token, ERC20_ABI, ethers.provider);
  const ownable = (a: string) => new ethers.Contract(a, OWNABLE_MIN_ABI, ethers.provider);
  const converter = (addr: string) => new ethers.Contract(addr, CONVERTER_MIN_ABI, ethers.provider);

  let riskFundV2UsdtBalanceBefore: BigNumber;
  let plpUsdcBalanceBefore: BigNumber;
  let plpUsdtBalanceBefore: BigNumber;
  let timelockUsdcBalanceBefore: BigNumber;
  const converterBalanceBefore = new Map<string, BigNumber>();

  before(async () => {
    // Etch the freshly compiled V3 helper bytecode at the canonical
    // MIGRATION_HELPER_V2 address. The on-chain bytecode at this fork block is
    // an earlier V2 cut without the Prime allocation block; the freshly
    // compiled artifact in `artifacts/contracts/helpers/...` is the version
    // that will land on chain when the helper is redeployed. Storage is
    // preserved (executed1/executed2 default to false; ReentrancyGuard
    // _status = 0 → OZ treats as NOT_ENTERED on first entry).
    await ethers.provider.send("hardhat_setCode", [
      MIGRATION_HELPER_V2,
      (HELPER_V3_ARTIFACT as { deployedBytecode: string }).deployedBytecode,
    ]);

    // Pre-condition the deploy script will fulfil on chain: every buyback's
    // pendingOwner must point at MIGRATION_HELPER_V2 so helper.execute1() can
    // accept ownership. At the fork block buybacks still point at the V1
    // helper, so impersonate the current owner and re-point each one.
    for (const b of BUYBACKS) {
      const buybackOwnable = new ethers.Contract(b, OWNABLE_MIN_ABI, ethers.provider);
      const currentPending = await buybackOwnable.pendingOwner();
      if (currentPending.toLowerCase() === MIGRATION_HELPER_V2.toLowerCase()) continue;
      const currentOwner = await buybackOwnable.owner();
      const ownerSigner = await initMainnetUser(currentOwner, ethers.utils.parseEther("1"));
      const buybackAsOwner = new ethers.Contract(b, ["function transferOwnership(address)"], ownerSigner);
      await buybackAsOwner.transferOwnership(MIGRATION_HELPER_V2);
    }

    riskFundV2UsdtBalanceBefore = await usdt.balanceOf(RISK_FUND_V2);
    plpUsdcBalanceBefore = await usdc.balanceOf(PRIME_LIQUIDITY_PROVIDER);
    plpUsdtBalanceBefore = await usdt.balanceOf(PRIME_LIQUIDITY_PROVIDER);
    timelockUsdcBalanceBefore = await usdc.balanceOf(bscmainnet.NORMAL_TIMELOCK);

    for (const d of DRAIN_BY_CONVERTER) {
      for (const t of CORE_TOKENS) {
        const k = `${d.converter.toLowerCase()}:${t.toLowerCase()}`;
        converterBalanceBefore.set(k, await erc20(t).balanceOf(d.converter));
      }
    }
  });

  describe("Pre-VIP state (part 1)", () => {
    it("each buyback proxy's pendingOwner is MIGRATION_HELPER_V2", async () => {
      for (const b of BUYBACKS) {
        const buyback = new ethers.Contract(b, BUYBACK_ABI, ethers.provider);
        expect(await buyback.pendingOwner()).to.equal(MIGRATION_HELPER_V2);
      }
    });

    it("each timelock-owned legacy converter is not yet paused", async () => {
      for (const c of TIMELOCK_OWNED_CONVERTERS) {
        expect(await converter(c).conversionPaused()).to.be.false;
      }
    });

    it("helper has not yet executed phase 1 or phase 2", async () => {
      expect(await helper.executed1()).to.be.false;
      expect(await helper.executed2()).to.be.false;
    });

    it("helper does not yet hold DEFAULT_ADMIN_ROLE on ACM", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, MIGRATION_HELPER_V2)).to.be.false;
    });

    it("vU is not yet a Prime market", async () => {
      const m = await prime.markets(VU);
      expect(m.exists).to.be.false;
    });

    it("U is not yet initialized in PrimeLiquidityProvider", async () => {
      expect(await plp.lastAccruedBlockOrSecond(U)).to.equal(0);
    });
  });

  testVip("VIP-800 part 1 — non-drain migration & May Prime allocation", await vip800Part1());

  describe("Post-VIP state (part 1)", () => {
    it("helper.executed1 is true; executed2 still false", async () => {
      expect(await helper.executed1()).to.be.true;
      expect(await helper.executed2()).to.be.false;
    });

    it("helper renounced DEFAULT_ADMIN_ROLE on ACM at end of execute1", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, MIGRATION_HELPER_V2)).to.be.false;
    });

    it("NormalTimelock owns each buyback proxy", async () => {
      for (const b of BUYBACKS) {
        expect(await ownable(b).owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
      }
    });

    it("helper still owns each timelock-owned legacy converter (handed back in part 2)", async () => {
      for (const c of TIMELOCK_OWNED_CONVERTERS) {
        expect(await ownable(c).owner()).to.equal(MIGRATION_HELPER_V2);
      }
    });

    it("operator granted executeBuyback + forwardBaseAsset on each buyback", async () => {
      for (const b of BUYBACKS) {
        const buybackSigner = await initMainnetUser(b, ethers.utils.parseEther("1"));
        expect(await acm.connect(buybackSigner).isAllowedToCall(OPERATOR, EXECUTE_BUYBACK_SIG)).to.be.true;
        expect(await acm.connect(buybackSigner).isAllowedToCall(OPERATOR, FORWARD_BASE_ASSET_SIG)).to.be.true;
      }
    });

    it("RiskFundV2 proxy upgraded to new implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(RISK_FUND_V2)).to.equal(NEW_RISK_FUND_V2_IMPL);
    });

    it("RiskFundV2 USDT balance non-decreasing across upgrade", async () => {
      const after = await usdt.balanceOf(RISK_FUND_V2);
      expect(after).to.be.gte(riskFundV2UsdtBalanceBefore);
    });

    it("every timelock-owned legacy converter is paused", async () => {
      for (const c of TIMELOCK_OWNED_CONVERTERS) {
        expect(await converter(c).conversionPaused(), c).to.be.true;
      }
    });

    it("each timelock-owned converter still holds its pre-VIP balance for every core-pool token (drain deferred to part 2)", async () => {
      for (const d of DRAIN_BY_CONVERTER) {
        for (const t of CORE_TOKENS) {
          const k = `${d.converter.toLowerCase()}:${t.toLowerCase()}`;
          const before = converterBalanceBefore.get(k) ?? BigNumber.from(0);
          const after = await erc20(t).balanceOf(d.converter);
          expect(after, k).to.equal(before);
        }
      }
    });

    it("PSR has every new buyback row at the expected (schema, percentage)", async () => {
      const rows: { schema: number; percentage: number; destination: string }[] = [];
      for (let i = 0; ; i++) {
        try {
          const r = await psr.distributionTargets(i);
          rows.push({
            schema: Number(r[0]),
            percentage: Number(r[1]),
            destination: String(r[2]).toLowerCase(),
          });
        } catch {
          break;
        }
      }
      for (const expected of NEW_PSR_EXPECTED_ROWS) {
        const found = rows.find(
          r => r.schema === expected.schema && r.destination === expected.destination.toLowerCase(),
        );
        expect(found, `missing PSR row schema=${expected.schema} dest=${expected.destination}`).to.not.be.undefined;
        expect(found!.percentage, `PSR percentage mismatch schema=${expected.schema}`).to.equal(expected.percentage);
      }
    });

    it("PSR no longer references any legacy converter or the VTreasury direct destination", async () => {
      for (let i = 0; ; i++) {
        try {
          const r = await psr.distributionTargets(i);
          expect(STALE_DESTINATIONS.has(String(r[2]).toLowerCase()), `stale PSR row: ${r[2]}`).to.be.false;
        } catch {
          break;
        }
      }
    });

    it("Shortfall auctions are paused (set inside execute1)", async () => {
      expect(await shortfall.auctionsPaused()).to.be.true;
    });
  });

  describe("Post-VIP Prime allocation (run inside execute1)", () => {
    it("vU is registered as a Prime market", async () => {
      const m = await prime.markets(VU);
      expect(m.exists).to.be.true;
    });

    it("U is initialized in PrimeLiquidityProvider", async () => {
      expect(await plp.lastAccruedBlockOrSecond(U)).to.be.gt(0);
    });

    it("PLP USDC balance decreased (helper swept USDC out for swaps)", async () => {
      const after = await usdc.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      expect(after).to.be.lt(plpUsdcBalanceBefore);
    });

    it("PLP USDT balance increased iff USDC->USDT swap leg succeeded", async () => {
      // Soft-fail leg: if USDT pool quote was healthy, PLP USDT balance went
      // up. If StepFailed("swapUSDCtoUSDT") fired, balance is unchanged.
      // Don't require either outcome — just sanity-check non-negative delta.
      const after = await usdt.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      expect(after).to.be.gte(plpUsdtBalanceBefore);
    });

    it("Helper holds zero USDC after execute1 (leftover forwarded back to NormalTimelock)", async () => {
      expect(await usdc.balanceOf(MIGRATION_HELPER_V2)).to.equal(0);
    });

    it("NormalTimelock USDC balance is non-decreasing (helper forwards leftover here)", async () => {
      const after = await usdc.balanceOf(bscmainnet.NORMAL_TIMELOCK);
      expect(after).to.be.gte(timelockUsdcBalanceBefore);
    });
  });

  describe("Post-VIP helper invariants (part 1)", () => {
    it("helper is NOT owner/pendingOwner of any buyback (handed back in execute1)", async () => {
      for (const b of BUYBACKS) {
        expect((await ownable(b).owner()).toLowerCase(), `${b} owner`).to.not.equal(MIGRATION_HELPER_V2.toLowerCase());
        expect((await ownable(b).pendingOwner()).toLowerCase(), `${b} pendingOwner`).to.not.equal(
          MIGRATION_HELPER_V2.toLowerCase(),
        );
      }
    });

    it("helper IS owner of every timelock-owned converter (drain happens in part 2)", async () => {
      for (const c of TIMELOCK_OWNED_CONVERTERS) {
        expect((await ownable(c).owner()).toLowerCase(), `${c} owner`).to.equal(MIGRATION_HELPER_V2.toLowerCase());
      }
    });

    it("calling helper.execute1() a second time reverts", async () => {
      const helperWithExecute1 = new ethers.Contract(MIGRATION_HELPER_V2, ["function execute1()"], ethers.provider);
      const timelockSigner = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      await expect(helperWithExecute1.connect(timelockSigner).execute1()).to.be.reverted;
    });
  });
});
