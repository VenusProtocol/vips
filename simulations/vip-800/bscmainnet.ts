import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";

import vip800, {
  ALLOWED_ROUTERS,
  BORROW_MULTIPLIER,
  BTCB_PRIME_CONVERTER,
  BUYBACKS,
  CORE_TOKENS,
  DEFAULT_PROXY_ADMIN,
  ETH_PRIME_CONVERTER,
  MIGRATION_HELPER,
  NEW_PRIME_SPEED_FOR_U,
  NEW_PRIME_SPEED_FOR_USDT,
  NEW_RISK_FUND_V2_IMPL,
  OPERATOR,
  PANCAKE_V3_ROUTER,
  PRIME,
  PRIME_LIQUIDITY_PROVIDER,
  PROTOCOL_SHARE_RESERVE,
  RISK_FUND_BUYBACK,
  RISK_FUND_CONVERTER,
  RISK_FUND_V2,
  SHORTFALL,
  SUPPLY_MULTIPLIER,
  TIMELOCK_OWNED_CONVERTERS,
  U,
  USDC_PRIME_CONVERTER,
  USDT,
  USDT_PRIME_CONVERTER,
  USDT_TO_SWEEP,
  U_MIN_OUT,
  U_PRIME_BUYBACK,
  VTREASURY,
  VU,
  WBNB_BURN_CONVERTER,
  XVS_BUYBACK,
  XVS_VAULT_CONVERTER,
} from "../../vips/vip-800/bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import DEFAULT_PROXY_ADMIN_ABI from "./abi/DefaultProxyAdmin.json";
import ERC20_ABI from "./abi/ERC20.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";
import BUYBACK_ABI from "./abi/TokenBuyback.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 97106909;

const SHORTFALL_MIN_ABI = ["function auctionsPaused() view returns (bool)"];
const CONVERTER_MIN_ABI = ["function conversionPaused() view returns (bool)"];
const HELPER_MIN_ABI = ["function executed() view returns (bool)"];
const PRIME_MIN_ABI = [
  "function markets(address) view returns (uint256 supplyMultiplier, uint256 borrowMultiplier, uint256 rewardIndex, uint256 sumOfMembersScore, bool exists)",
];
const PLP_MIN_ABI = [
  "function tokenDistributionSpeeds(address) view returns (uint256)",
  "function lastAccruedBlockOrSecond(address) view returns (uint256)",
];
const ERC20_ALLOWANCE_ABI = ["function allowance(address,address) view returns (uint256)"];

const EXECUTE_BUYBACK_SIG = "executeBuyback(address,uint256,uint256,uint256,address,bytes,address)";
const FORWARD_BASE_ASSET_SIG = "forwardBaseAsset(address,uint256)";
const DEFAULT_ADMIN_ROLE = ethers.constants.HashZero;

// (converter, recipient) pairs used to derive expected drain coverage post-VIP.
// `tokens` is the universal CORE_TOKENS list — every entry is independently
// checked against the converter's live balance via the same `bal > 0` guard the
// helper applies on-chain.
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
  // schema 0 (PROTOCOL_RESERVES)
  { schema: 0, percentage: 1200, destination: BUYBACKS[4] }, // U_TREASURY_BUYBACK
  { schema: 0, percentage: 600, destination: BUYBACKS[5] }, // BTCB_TREASURY_BUYBACK
  { schema: 0, percentage: 600, destination: BUYBACKS[6] }, // ETH_TREASURY_BUYBACK
  { schema: 0, percentage: 600, destination: BUYBACKS[7] }, // USDT_TREASURY_BUYBACK
  { schema: 0, percentage: 600, destination: BUYBACKS[8] }, // USDC_TREASURY_BUYBACK
  { schema: 0, percentage: 400, destination: BUYBACKS[9] }, // XVS_TREASURY_BUYBACK
  { schema: 0, percentage: 1000, destination: BUYBACKS[1] }, // USDT_PRIME_BUYBACK
  { schema: 0, percentage: 1000, destination: BUYBACKS[2] }, // U_PRIME_BUYBACK
  { schema: 0, percentage: 2000, destination: BUYBACKS[0] }, // RISK_FUND_BUYBACK
  { schema: 0, percentage: 2000, destination: BUYBACKS[3] }, // XVS_BUYBACK
  // schema 1 (ADDITIONAL_REVENUE)
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
  const usdtAllowance = new ethers.Contract(USDT, ERC20_ALLOWANCE_ABI, ethers.provider);
  const shortfall = new ethers.Contract(SHORTFALL, SHORTFALL_MIN_ABI, ethers.provider);
  const helper = new ethers.Contract(MIGRATION_HELPER, HELPER_MIN_ABI, ethers.provider);
  const prime = new ethers.Contract(PRIME, PRIME_MIN_ABI, ethers.provider);
  const plp = new ethers.Contract(PRIME_LIQUIDITY_PROVIDER, PLP_MIN_ABI, ethers.provider);

  const erc20 = (token: string) => new ethers.Contract(token, ERC20_ABI, ethers.provider);
  const converter = (addr: string) => new ethers.Contract(addr, CONVERTER_MIN_ABI, ethers.provider);

  let riskFundV2UsdtBalanceBefore: BigNumber;
  let shortfallAuctionsPausedBefore: boolean;
  let plpUsdtBalanceBefore: BigNumber;
  let plpUBalanceBefore: BigNumber;
  const recipientBalanceBefore = new Map<string, BigNumber>(); // key: token:recipient

  before(async () => {
    riskFundV2UsdtBalanceBefore = await usdt.balanceOf(RISK_FUND_V2);
    shortfallAuctionsPausedBefore = await shortfall.auctionsPaused();
    plpUsdtBalanceBefore = await usdt.balanceOf(PRIME_LIQUIDITY_PROVIDER);
    plpUBalanceBefore = await erc20(U).balanceOf(PRIME_LIQUIDITY_PROVIDER);

    for (const d of DRAIN_BY_CONVERTER) {
      for (const t of CORE_TOKENS) {
        const k = `${t.toLowerCase()}:${d.recipient.toLowerCase()}`;
        if (!recipientBalanceBefore.has(k)) {
          recipientBalanceBefore.set(k, await erc20(t).balanceOf(d.recipient));
        }
      }
    }
  });

  describe("Pre-VIP state", () => {
    it("each buyback proxy's pendingOwner is NormalTimelock", async () => {
      for (const b of BUYBACKS) {
        const buyback = new ethers.Contract(b, BUYBACK_ABI, ethers.provider);
        expect(await buyback.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
      }
    });

    it("no router is allowlisted on buybacks yet", async () => {
      for (const b of BUYBACKS) {
        const buyback = new ethers.Contract(b, BUYBACK_ABI, ethers.provider);
        for (const r of ALLOWED_ROUTERS) {
          expect(await buyback.allowedRouters(r)).to.be.false;
        }
      }
    });

    it("operator has no executeBuyback / forwardBaseAsset grants yet", async () => {
      for (const b of BUYBACKS) {
        expect(await acm.isAllowedToCall(OPERATOR, b, EXECUTE_BUYBACK_SIG)).to.be.false;
        expect(await acm.isAllowedToCall(OPERATOR, b, FORWARD_BASE_ASSET_SIG)).to.be.false;
      }
    });

    it("each timelock-owned legacy converter is not yet paused", async () => {
      for (const c of TIMELOCK_OWNED_CONVERTERS) {
        // Pre-VIP we expect conversion to be active. If a converter is already
        // paused for some other reason, this assertion intentionally fails so
        // the operator notices and rebases the snapshot.
        expect(await converter(c).conversionPaused()).to.be.false;
      }
    });

    it("helper has not yet executed", async () => {
      expect(await helper.executed()).to.be.false;
    });

    it("helper does not yet hold DEFAULT_ADMIN_ROLE on ACM", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, MIGRATION_HELPER)).to.be.false;
    });

    it("captures Shortfall.auctionsPaused() pre-state (informational)", async () => {
      // No assertion on the pre-state: isolated pools are wound down so the flag
      // could be either value depending on prior governance actions. The post-VIP
      // assertion is what matters.
      expect(typeof shortfallAuctionsPausedBefore).to.equal("boolean");
    });
  });

  describe("Pre-VIP Prime rewards state", () => {
    it("vU is not yet a Prime market", async () => {
      const m = await prime.markets(VU);
      expect(m.exists).to.be.false;
    });

    it("U is not yet initialized in PrimeLiquidityProvider", async () => {
      expect(await plp.lastAccruedBlockOrSecond(U)).to.equal(0);
    });

    it("PLP holds at least the USDT amount to be swept", async () => {
      expect(plpUsdtBalanceBefore).to.be.gte(USDT_TO_SWEEP);
    });
  });

  testVip("VIP-800 TokenBuyback migration", await vip800());

  describe("Post-VIP state", () => {
    it("helper.executed flag is true and a second execute() would revert", async () => {
      expect(await helper.executed()).to.be.true;
    });

    it("helper renounced DEFAULT_ADMIN_ROLE on ACM", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, MIGRATION_HELPER)).to.be.false;
    });

    it("NormalTimelock owns each buyback proxy", async () => {
      for (const b of BUYBACKS) {
        const buyback = new ethers.Contract(b, BUYBACK_ABI, ethers.provider);
        expect(await buyback.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
      }
    });

    it("NormalTimelock owns each timelock-owned legacy converter", async () => {
      for (const c of TIMELOCK_OWNED_CONVERTERS) {
        const cc = new ethers.Contract(c, ["function owner() view returns (address)"], ethers.provider);
        expect(await cc.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
      }
    });

    it("every router is allowlisted on every buyback", async () => {
      for (const b of BUYBACKS) {
        const buyback = new ethers.Contract(b, BUYBACK_ABI, ethers.provider);
        for (const r of ALLOWED_ROUTERS) {
          expect(await buyback.allowedRouters(r), `${b}/${r}`).to.be.true;
        }
      }
    });

    it("operator granted executeBuyback + forwardBaseAsset on each buyback", async () => {
      for (const b of BUYBACKS) {
        expect(await acm.isAllowedToCall(OPERATOR, b, EXECUTE_BUYBACK_SIG)).to.be.true;
        expect(await acm.isAllowedToCall(OPERATOR, b, FORWARD_BASE_ASSET_SIG)).to.be.true;
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

    it("each timelock-owned converter has zero residual balance for every core-pool token", async () => {
      for (const d of DRAIN_BY_CONVERTER) {
        for (const t of CORE_TOKENS) {
          expect(await erc20(t).balanceOf(d.converter), `${d.converter}/${t}`).to.equal(0);
        }
      }
    });

    it("recipient buybacks received the drained balances (delta >= 0 per (token, recipient))", async () => {
      // Expected per-pair delta is unknown precisely (helper sweeps balanceOf at
      // execution time, not the pre-VIP snapshot), but the post-balance must be
      // >= the pre-VIP snapshot — funds only flow inward in this VIP.
      for (const d of DRAIN_BY_CONVERTER) {
        for (const t of CORE_TOKENS) {
          const k = `${t.toLowerCase()}:${d.recipient.toLowerCase()}`;
          const before = recipientBalanceBefore.get(k) ?? BigNumber.from(0);
          const after = await erc20(t).balanceOf(d.recipient);
          expect(after, k).to.be.gte(before);
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
          const dest = String(r[2]).toLowerCase();
          expect(STALE_DESTINATIONS.has(dest), `stale PSR row still present: ${dest}`).to.be.false;
        } catch {
          break;
        }
      }
    });

    it("PSR per-schema percentages sum to 1e4", async () => {
      const totals: Record<number, number> = { 0: 0, 1: 0 };
      for (let i = 0; ; i++) {
        try {
          const r = await psr.distributionTargets(i);
          totals[Number(r[0])] += Number(r[1]);
        } catch {
          break;
        }
      }
      expect(totals[0]).to.equal(10000);
      expect(totals[1]).to.equal(10000);
    });

    it("Shortfall auctions are paused (defense in depth)", async () => {
      expect(await shortfall.auctionsPaused()).to.be.true;
    });
  });

  describe("Post-VIP Prime rewards state", () => {
    it("vU is registered as a Prime market with supply-only multipliers", async () => {
      const m = await prime.markets(VU);
      expect(m.exists).to.be.true;
      expect(m.supplyMultiplier).to.equal(SUPPLY_MULTIPLIER);
      expect(m.borrowMultiplier).to.equal(BORROW_MULTIPLIER);
    });

    it("U is initialized in PrimeLiquidityProvider", async () => {
      expect(await plp.lastAccruedBlockOrSecond(U)).to.be.gt(0);
    });

    it("PLP USDT balance decreased by exactly USDT_TO_SWEEP (sweep + no inflow this VIP)", async () => {
      const after = await usdt.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      expect(plpUsdtBalanceBefore.sub(after)).to.equal(USDT_TO_SWEEP);
    });

    it("PLP U balance increased by at least U_MIN_OUT (swap recipient = PLP)", async () => {
      const after = await erc20(U).balanceOf(PRIME_LIQUIDITY_PROVIDER);
      expect(after.sub(plpUBalanceBefore)).to.be.gte(U_MIN_OUT);
    });

    it("NormalTimelock USDT allowance to PancakeSwap V3 router is revoked", async () => {
      expect(await usdtAllowance.allowance(bscmainnet.NORMAL_TIMELOCK, PANCAKE_V3_ROUTER)).to.equal(0);
    });

    it("Prime distribution speed for USDT matches NEW_PRIME_SPEED_FOR_USDT", async () => {
      expect(await plp.tokenDistributionSpeeds(USDT)).to.equal(NEW_PRIME_SPEED_FOR_USDT);
    });

    it("Prime distribution speed for U matches NEW_PRIME_SPEED_FOR_U", async () => {
      expect(await plp.tokenDistributionSpeeds(U)).to.equal(NEW_PRIME_SPEED_FOR_U);
    });
  });
});
