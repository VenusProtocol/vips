import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  BORROW_MULTIPLIER,
  BTCB_PRIME_CONVERTER,
  ETH_PRIME_CONVERTER,
  NEW_PRIME_SPEED_FOR_U,
  NEW_PRIME_SPEED_FOR_USDT,
  PRIME,
  RISK_FUND_CONVERTER,
  SUPPLY_MULTIPLIER,
  USDC_PRIME_CONVERTER,
  USDT_PRIME_CONVERTER,
  U_MAX_DISTRIBUTION_SPEED,
  VTREASURY,
  VU,
  WBNB_BURN_CONVERTER,
  XVS_VAULT_CONVERTER,
} from "../../vips/vip-618/bscmainnet";
import vip620, {
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
  USDC_TO_SWEEP,
  USDT,
  U_MIN_OUT,
  U_PRIME_BUYBACK,
  XVS_BUYBACK,
} from "../../vips/vip-620/bscmainnet-part-1";
import ACM_ABI from "../vip-618/abi/AccessControlManager.json";
import DEFAULT_PROXY_ADMIN_ABI from "../vip-618/abi/DefaultProxyAdmin.json";
import ERC20_ABI from "../vip-618/abi/ERC20.json";
import PSR_ABI from "../vip-618/abi/ProtocolShareReserve.json";
import BUYBACK_ABI from "../vip-618/abi/TokenBuyback.json";
import TOKEN_BUYBACK_MIGRATION_HELPER_ABI from "./abi/TokenBuybackMigrationHelper.json";

const { bscmainnet } = NETWORK_ADDRESSES;

// Fork block must be past the latest TokenBuybackMigrationHelper redeploy
// (protocol-reserve PR #164, commit 746fe99 — rebuilt after the USDT-leg
// drop) at BSC block 98038965, and past every PR #162 buyback redeploy
// (97999686 – 98000650).
const FORK_BLOCK = 98045598;

const SHORTFALL_MIN_ABI = ["function auctionsPaused() view returns (bool)"];
const CONVERTER_MIN_ABI = ["function conversionPaused() view returns (bool)"];
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
  const helper = new ethers.Contract(MIGRATION_HELPER_V2, TOKEN_BUYBACK_MIGRATION_HELPER_ABI, ethers.provider);
  const prime = new ethers.Contract(PRIME, PRIME_MIN_ABI, ethers.provider);
  const plp = new ethers.Contract(PRIME_LIQUIDITY_PROVIDER, PLP_MIN_ABI, ethers.provider);

  const erc20 = (token: string) => new ethers.Contract(token, ERC20_ABI, ethers.provider);
  const ownable = (a: string) => new ethers.Contract(a, OWNABLE_MIN_ABI, ethers.provider);
  const converter = (addr: string) => new ethers.Contract(addr, CONVERTER_MIN_ABI, ethers.provider);

  let riskFundV2UsdtBalanceBefore: BigNumber;
  let plpUsdcBalanceBefore: BigNumber;
  let plpUsdtBalanceBefore: BigNumber;
  let plpUBalanceBefore: BigNumber;
  let timelockUsdcBalanceBefore: BigNumber;
  const converterBalanceBefore = new Map<string, BigNumber>();

  before(async () => {
    // Production pre-condition (enforced — no fork-only impersonation patch):
    // every buyback proxy's pendingOwner must already point at
    // MIGRATION_HELPER_V2 so helper.execute1() can accept ownership. The
    // protocol-reserve PR #162 deploy script is responsible for calling
    // transferOwnership(MIGRATION_HELPER_V2) on each proxy before this VIP is
    // queued. The buybacks' current owner is the deployer EOA — NormalTimelock
    // cannot transfer it from within the VIP — so this is an off-chain step.
    //
    // If this fails, fix the deploy script (preferred) or run an EOA tx that
    // sets pendingOwner on each proxy. The "Pre-VIP state > pendingOwner" test
    // below also asserts the same invariant; both surfaces exist on purpose.
    for (const b of BUYBACKS) {
      const buybackOwnable = new ethers.Contract(b, OWNABLE_MIN_ABI, ethers.provider);
      const pending: string = await buybackOwnable.pendingOwner();
      if (pending.toLowerCase() !== MIGRATION_HELPER_V2.toLowerCase()) {
        throw new Error(
          `pre-condition unmet: buyback ${b} pendingOwner=${pending}, expected ${MIGRATION_HELPER_V2}. ` +
            `The buyback deploy script (protocol-reserve PR #162) must call ` +
            `transferOwnership(${MIGRATION_HELPER_V2}) on every proxy before VIP-620 is queued.`,
        );
      }
    }

    riskFundV2UsdtBalanceBefore = await usdt.balanceOf(RISK_FUND_V2);
    plpUsdcBalanceBefore = await usdc.balanceOf(PRIME_LIQUIDITY_PROVIDER);
    plpUsdtBalanceBefore = await usdt.balanceOf(PRIME_LIQUIDITY_PROVIDER);
    plpUBalanceBefore = await erc20(U).balanceOf(PRIME_LIQUIDITY_PROVIDER);
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
        expect((await buyback.pendingOwner()).toLowerCase(), b).to.equal(MIGRATION_HELPER_V2.toLowerCase());
      }
    });

    it("each timelock-owned converter is owned by NormalTimelock (pre-transfer)", async () => {
      for (const c of TIMELOCK_OWNED_CONVERTERS) {
        expect((await ownable(c).owner()).toLowerCase(), c).to.equal(bscmainnet.NORMAL_TIMELOCK.toLowerCase());
      }
    });

    it("each timelock-owned legacy converter is not yet paused", async () => {
      for (const c of TIMELOCK_OWNED_CONVERTERS) {
        expect(await converter(c).conversionPaused(), c).to.be.false;
      }
    });

    it("helper has not yet executed phase 1, swap, or phase 2", async () => {
      expect(await helper.executed1()).to.be.false;
      expect(await helper.executedSwap()).to.be.false;
      expect(await helper.executed2()).to.be.false;
    });

    it("helper does not yet hold DEFAULT_ADMIN_ROLE on ACM", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, MIGRATION_HELPER_V2)).to.be.false;
    });

    it("helper holds zero USDC and zero native BNB pre-VIP", async () => {
      expect(await usdc.balanceOf(MIGRATION_HELPER_V2)).to.equal(0);
      expect(await ethers.provider.getBalance(MIGRATION_HELPER_V2)).to.equal(0);
    });

    it("vU is not yet a Prime market", async () => {
      const m = await prime.markets(VU);
      expect(m.exists).to.be.false;
    });

    it("U is not yet initialized in PrimeLiquidityProvider", async () => {
      expect(await plp.lastAccruedBlockOrSecond(U)).to.equal(0);
    });

    it("Shortfall auctions are not yet paused (set inside execute1)", async () => {
      expect(await shortfall.auctionsPaused()).to.be.false;
    });
  });

  testVip("VIP-620 — non-drain migration & May Prime allocation", await vip620());

  describe("Post-VIP state (part 1)", () => {
    it("helper.executed1 and helper.executedSwap are true; executed2 still false", async () => {
      expect(await helper.executed1()).to.be.true;
      expect(await helper.executedSwap()).to.be.true;
      expect(await helper.executed2()).to.be.false;
    });

    it("helper renounced DEFAULT_ADMIN_ROLE on ACM at end of execute1", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, MIGRATION_HELPER_V2)).to.be.false;
    });

    it("helper still owns each buyback (handback deferred to part 2)", async () => {
      for (const b of BUYBACKS) {
        expect((await ownable(b).owner()).toLowerCase(), b).to.equal(MIGRATION_HELPER_V2.toLowerCase());
      }
    });

    it("helper still owns each timelock-owned legacy converter (handback deferred to part 2)", async () => {
      for (const c of TIMELOCK_OWNED_CONVERTERS) {
        expect((await ownable(c).owner()).toLowerCase(), c).to.equal(MIGRATION_HELPER_V2.toLowerCase());
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
      expect((await proxyAdmin.getProxyImplementation(RISK_FUND_V2)).toLowerCase()).to.equal(
        NEW_RISK_FUND_V2_IMPL.toLowerCase(),
      );
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

  describe("Post-VIP Prime allocation", () => {
    it("vU is registered as a Prime market with the expected multipliers", async () => {
      const m = await prime.markets(VU);
      expect(m.exists, "exists").to.be.true;
      expect(m.supplyMultiplier, "supplyMultiplier").to.equal(SUPPLY_MULTIPLIER);
      expect(m.borrowMultiplier, "borrowMultiplier").to.equal(BORROW_MULTIPLIER);
    });

    it("U is initialized in PrimeLiquidityProvider", async () => {
      expect(await plp.lastAccruedBlockOrSecond(U)).to.be.gt(0);
    });

    it("PLP max distribution speed for U is set", async () => {
      expect(await plp.maxTokenDistributionSpeeds(U)).to.equal(U_MAX_DISTRIBUTION_SPEED);
    });

    it("PLP distribution speeds set for USDT and U", async () => {
      expect(await plp.tokenDistributionSpeeds(USDT), "USDT speed").to.equal(NEW_PRIME_SPEED_FOR_USDT);
      expect(await plp.tokenDistributionSpeeds(U), "U speed").to.equal(NEW_PRIME_SPEED_FOR_U);
    });

    it("PLP USDC balance decreased by exactly USDC_TO_SWEEP", async () => {
      const after = await usdc.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      expect(plpUsdcBalanceBefore.sub(after)).to.equal(USDC_TO_SWEEP);
    });

    it("PLP USDT balance is unchanged (V3 multihop routes USDT through, doesn't deposit it)", async () => {
      const after = await usdt.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      expect(after).to.equal(plpUsdtBalanceBefore);
    });

    it("PLP U balance increased by at least U_MIN_OUT (strict — soft-fail of executeSwap would surface here)", async () => {
      const after = await erc20(U).balanceOf(PRIME_LIQUIDITY_PROVIDER);
      expect(after.sub(plpUBalanceBefore)).to.be.gte(U_MIN_OUT);
    });

    it("Helper holds zero USDC after executeSwap", async () => {
      expect(await usdc.balanceOf(MIGRATION_HELPER_V2)).to.equal(0);
    });

    it("NormalTimelock USDC balance is unchanged (swap succeeded — no leftover forwarded)", async () => {
      // On soft-fail of executeSwap, helper forwards USDC_TO_SWEEP back to
      // NormalTimelock. The strict U-min-out assertion above rules that out,
      // so Timelock USDC delta should be exactly zero.
      const after = await usdc.balanceOf(bscmainnet.NORMAL_TIMELOCK);
      expect(after).to.equal(timelockUsdcBalanceBefore);
    });
  });

  describe("Post-VIP helper invariants (part 1)", () => {
    it("helper IS owner of every buyback (handback deferred to part 2)", async () => {
      for (const b of BUYBACKS) {
        expect((await ownable(b).owner()).toLowerCase(), `${b} owner`).to.equal(MIGRATION_HELPER_V2.toLowerCase());
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

    it("calling helper.executeSwap() a second time reverts", async () => {
      const helperWithExecuteSwap = new ethers.Contract(
        MIGRATION_HELPER_V2,
        ["function executeSwap()"],
        ethers.provider,
      );
      const timelockSigner = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      await expect(helperWithExecuteSwap.connect(timelockSigner).executeSwap()).to.be.reverted;
    });
  });
});
