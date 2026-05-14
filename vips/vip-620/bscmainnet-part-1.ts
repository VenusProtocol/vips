import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// vip-618 is on-chain (proposed, execution failed) and its constants are
// frozen. VIP-620 imports only the values that survived the redeploy unchanged
// and redefines the buyback addresses and swap-budget constants locally below.
import {
  BORROW_MULTIPLIER,
  CORE_COMPTROLLER,
  CORE_TOKENS,
  DEFAULT_PROXY_ADMIN,
  NEW_PRIME_SPEED_FOR_U,
  NEW_PRIME_SPEED_FOR_USDT,
  NEW_RISK_FUND_V2_IMPL,
  PRIME,
  PRIME_LIQUIDITY_PROVIDER,
  PROTOCOL_SHARE_RESERVE,
  RISK_FUND_V2,
  SHORTFALL,
  SUPPLY_MULTIPLIER,
  TIMELOCK_OWNED_CONVERTERS,
  U,
  USDC,
  USDT,
  U_MAX_DISTRIBUTION_SPEED,
  VU,
} from "../vip-618/bscmainnet";

const { bscmainnet } = NETWORK_ADDRESSES;

// ===== New TokenBuyback proxies (PR #162 redeploy — supersedes vip-618) =====
// vip-618 hard-codes the original proxy addresses; the redeploy from
// protocol-reserve PR #162 changed every one of them, so VIP-620 carries its
// own canonical list. Order is preserved (same index → same buyback role) so
// PSR-row indices in the sim line up across both VIPs.
export const RISK_FUND_BUYBACK = "0x0c71EFabD00329E839745ef23aB946d3ed24A805";
export const USDT_PRIME_BUYBACK = "0xD721932C7CA41Eb5305867287010587a266346a8";
export const U_PRIME_BUYBACK = "0xBC9fFBfb799B2d189669D3816E2B7273c69041bd";
export const XVS_BUYBACK = "0x637E6246BBb0F9aBae9d764F5e1bB6347f028C12";
export const U_TREASURY_BUYBACK = "0xec63411423D03327De19135446dDdA3055D2feA8";
export const BTCB_TREASURY_BUYBACK = "0x1F306a0d929a7098a0A0b12248Ba97600AB79026";
export const ETH_TREASURY_BUYBACK = "0x41954F0bf26959dF2e1B8302DEBf736B5b154B64";
export const USDT_TREASURY_BUYBACK = "0xB3dDf13E8B6b8dE10F5826087C202b80F1D1b490";
export const USDC_TREASURY_BUYBACK = "0xd7aC40f9bd9A1beb8E2d121b4446CF90417cf169";
export const XVS_TREASURY_BUYBACK = "0x6D2d239c16453062cF145A7a5128A6a60710d236";

export const BUYBACKS: string[] = [
  RISK_FUND_BUYBACK,
  USDT_PRIME_BUYBACK,
  U_PRIME_BUYBACK,
  XVS_BUYBACK,
  U_TREASURY_BUYBACK,
  BTCB_TREASURY_BUYBACK,
  ETH_TREASURY_BUYBACK,
  USDT_TREASURY_BUYBACK,
  USDC_TREASURY_BUYBACK,
  XVS_TREASURY_BUYBACK,
];

// ===== May 2026 swap-budget constants (retuned for single multihop) =====
// PLP holds ~14.9k USDC at the snapshot block; ~4k is reserved for unclaimed
// user rewards so the VIP sweeps 10k into the V2 helper. PLP already holds
// ~25k USDT, so the helper runs a single USDC -> USDT -> U multihop instead
// of two legs — vip-618's 14,986 USDC / 7,418 U_MIN_OUT were sized for the
// dropped two-leg path.
export const USDC_TO_SWEEP = parseUnits("10000", 18);
// 1% slippage floor under the 9,996.60 U QuoterV2 read (2026-05-13).
export const U_MIN_OUT = parseUnits("9900", 18);

// Re-export the address universe so simulations and downstream tooling have a
// single import surface for both halves of the migration.
export {
  CORE_TOKENS,
  DEFAULT_PROXY_ADMIN,
  NEW_RISK_FUND_V2_IMPL,
  PRIME_LIQUIDITY_PROVIDER,
  PROTOCOL_SHARE_RESERVE,
  RISK_FUND_V2,
  SHORTFALL,
  TIMELOCK_OWNED_CONVERTERS,
  U,
  USDC,
  USDT,
};

// Latest TokenBuybackMigrationHelper redeploy (protocol-reserve PR #164,
// branch feat/VPD-1167, commit 746fe99 — rebuilt after 3beaa3e dropped the
// USDC -> USDT swap leg). The helper exposes three one-shot entrypoints —
// execute1(), executeSwap() and execute2() — each gated to NormalTimelock.
// Deployment: protocol-reserve/deployments/bscmainnet/TokenBuybackMigrationHelper.json
export const MIGRATION_HELPER_V2 = "0x296a3E00c07E306FB26976FdCa201b14933AffAD";

// AccessControl `DEFAULT_ADMIN_ROLE` (OZ AccessControl) — the admin role on the
// AccessControlManager. Granting it to the helper lets execute1() self-grant
// the transient ACM permissions it needs (PSR rewire, pauseConversion per
// converter, Shortfall.pauseAuctions) and renounce them at the end of the call.
const DEFAULT_ADMIN_ROLE = ethers.constants.HashZero;

const HELPER_EXECUTE1_SIG = "execute1()";
const HELPER_EXECUTE_SWAP_SIG = "executeSwap()";

export const VIP_NUMBER = "vip-620";

export const vip620 = () => {
  const meta = {
    version: "v2",
    title: "VIP-620 [BNB Chain] TokenBuyback Migration Part 1 & May Prime Allocation",
    description: `#### Summary

Replaces VIP-618 (unexecutable on-chain because its single helper.execute() exceeds BSC's Osaka per-tx gas cap of 16,777,216). The migration is split into two proposals — VIP-620 (this VIP) and VIP-621:

- **Part 1 (VIP-620, this VIP)**: every migration step except draining the 6 timelock-owned converters and allowlisting swap routers on the 10 buyback proxies. The May 2026 Prime Rewards Allocation is driven by the VIP itself: Prime.addMarket(vU), PLP.initializeTokens/setMax/setSpeed and PLP.sweepToken are called directly from NormalTimelock; the helper only wraps a single soft-failing USDC → USDT → U multihop in executeSwap() so a thin-pool revert can't unwind the rest of the migration. PLP already holds ~25k USDT for the May 2026 distribution, so only U is bought.
- **Part 2 (VIP-621)**: allowlisting 9 swap routers on every buyback, the converter drain, and the final return of all 16 (10 buybacks + 6 converters) ownership to NormalTimelock.

Between part 1 and part 2 the 6 legacy converters are paused (no inbound conversion can occur), PSR is already repointed away from them, and Shortfall auctions are paused. Balances are frozen and there is no economic surface from them. The helper retains ownership of all 16 contracts across the gap but holds no ACM privileges (DEFAULT_ADMIN_ROLE is renounced at the end of execute1()) and has no external entrypoints beyond the one-shot execute1 / executeSwap / execute2.

#### Proposed Changes

1. **Grant DEFAULT_ADMIN_ROLE** on the AccessControlManager to the V2 helper, so execute1() can self-grant the transient ACM permissions it needs (pauseConversion per converter, Shortfall.pauseAuctions, PSR addOrUpdateDistributionConfigs / removeDistributionConfig). The role is renounced at the end of execute1().
2. **Transfer ownership** of the 6 timelock-owned legacy converters to the V2 helper. The 10 buyback proxies are deployed with pendingOwner = V2 helper, so execute1() accepts them without an intermediate NormalTimelock claim.
3. **helper.execute1()** — non-drain, non-allowlist phase:
    - Accepts ownership of all 16 contracts (10 buybacks + 6 converters).
    - Pauses every timelock-owned converter (no inbound conversion) and Shortfall auctions (RiskFundV2 is downstream).
    - Repoints ProtocolShareReserve distributions: 18 new buyback rows added and 12 stale rows zeroed in a sequence that respects PSR.maxLoopsLimit (20) at every checkpoint and preserves the per-schema percentage invariant (1e4 or 0) at the end of every addOrUpdate call.
    - Grants the cron operator persistent executeBuyback and forwardBaseAsset ACM permissions on every buyback.
    - Renounces DEFAULT_ADMIN_ROLE on the AccessControlManager so the helper retains no residual ACM privilege between the two VIPs.
    - Helper retains ownership of all 16 contracts until execute2().
4. **May 2026 Prime Rewards Allocation** (driven directly from NormalTimelock; helper only wraps the swap):
    - Prime.addMarket(coreComptroller, vU, supplyMultiplier=2e18, borrowMultiplier=0).
    - PLP.initializeTokens([U]).
    - PLP.setMaxTokensDistributionSpeed([U], [1e18]).
    - PLP.sweepToken(USDC, V2 helper, 10,000e18). Of PLP's ~14.9k USDC, ~4k is reserved for unclaimed user rewards, so only 10k is swept.
    - helper.executeSwap() — approves 10k USDC to PancakeSwap V3 router, runs a single USDC → USDT → U multihop (the direct USDC/U V3 pool is too thin; the deep USDT/U pool is required). Wrapped in try/catch with StepFailed-on-revert so a slippage hit can't take down the rest of the VIP. Min-out = 9,900e18 U (~1% buffer under the 9,996.60 U QuoterV2 read at 2026-05-13). USDT leg is intentionally omitted — PLP already holds enough USDT for the May 2026 distribution. Output lands directly in PLP; any leftover USDC is forwarded back to NormalTimelock.
    - PLP.setTokensDistributionSpeed([USDT, U], [...]) — USDT speed runs against PLP's existing balance; U speed runs against the swap output.
5. **Upgrade RiskFundV2 implementation**. The new implementation removes updatePoolState, sweepTokenFromPool, and the poolAssetsFunds mapping. The upgrade is safe because RiskFundConverter is paused inside execute1() above, so no in-flight convertExactTokens callback can hit the removed updatePoolState selector — even though the converter still holds balance until part 2.

Helper source: contracts/helpers/TokenBuybackMigrationHelper.sol in protocol-reserve PR [#164](https://github.com/VenusProtocol/protocol-reserve/pull/164) (deployed to bscmainnet at the address above). New RiskFundV2 implementation: protocol-reserve PR [#158](https://github.com/VenusProtocol/protocol-reserve/pull/158). Buyback proxies (10): protocol-reserve PR [#162](https://github.com/VenusProtocol/protocol-reserve/pull/162) redeploy.

#### Why split

BSC's Osaka hardfork enforces a hard per-tx gas cap of 2^24 = 16,777,216. The original VIP-618 helper.execute() requires ~17.5M gas (driven primarily by _drainAllConverters iterating 6 converters x 47 core-pool tokens and _allowlistRoutersOnAllBuybacks iterating 10 buybacks x 9 routers). Splitting drain + router allowlist into execute2() drops both entrypoints comfortably under the cap; vip-framework asserts the cap inside testVip so future violations fail in CI rather than at execute time on chain.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. Grant DEFAULT_ADMIN_ROLE on the ACM to the V2 helper.
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, MIGRATION_HELPER_V2],
      },

      // 2. Transfer ownership of the 6 timelock-owned legacy converters to the V2 helper.
      //    The 10 buyback proxies were deployed with pendingOwner = V2 helper directly,
      //    so execute1() accepts them without an intermediate NormalTimelock claim.
      ...TIMELOCK_OWNED_CONVERTERS.map(c => ({
        target: c,
        signature: "transferOwnership(address)",
        params: [MIGRATION_HELPER_V2],
      })),

      // 3. helper.execute1() — accept 16 ownerships, pause converters + Shortfall,
      //    PSR rewire, grant operator perms, renounce ACM admin. No handback yet.
      {
        target: MIGRATION_HELPER_V2,
        signature: HELPER_EXECUTE1_SIG,
        params: [],
      },

      // 4. May 2026 Prime Rewards Allocation — driven by the VIP (PLP/Prime setters
      //    are onlyOwner-gated on NormalTimelock or simple ACM-gated calls; the
      //    helper only wraps the swap leg).

      // 4a. Add vU as a Prime market (supply-only, matching USDT/USDC).
      {
        target: PRIME,
        signature: "addMarket(address,address,uint256,uint256)",
        params: [CORE_COMPTROLLER, VU, SUPPLY_MULTIPLIER, BORROW_MULTIPLIER],
      },

      // 4b. Initialize U in PrimeLiquidityProvider so distribution accounting tracks it.
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "initializeTokens(address[])",
        params: [[U]],
      },

      // 4c. Set U's max distribution speed to 1e18, matching every other Prime
      //     token across BSC and Ethereum.
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setMaxTokensDistributionSpeed(address[],uint256[])",
        params: [[U], [U_MAX_DISTRIBUTION_SPEED]],
      },

      // 4d. Sweep 10k USDC out of PLP into the V2 helper (not NormalTimelock)
      //     so helper.executeSwap() has the exact USDC_TO_SWAP it needs.
      //     ~4k of PLP's ~14.9k USDC is reserved for unclaimed user rewards.
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "sweepToken(address,address,uint256)",
        params: [USDC, MIGRATION_HELPER_V2, USDC_TO_SWEEP],
      },

      // 4e. helper.executeSwap() — single soft-failing USDC -> USDT -> U
      //     multihop on PancakeSwap V3 (direct USDC/U pool is too thin; the
      //     deep USDT/U pool is required). Output to PLP; leftover USDC
      //     forwarded back to NormalTimelock. USDT leg is omitted — PLP
      //     already holds enough USDT for the May 2026 distribution.
      {
        target: MIGRATION_HELPER_V2,
        signature: HELPER_EXECUTE_SWAP_SIG,
        params: [],
      },

      // 4f. Set Prime distribution speeds for USDT and U at the $12,250/month
      //     per-market target. USDT speed runs against PLP's existing balance
      //     (~25k); U speed runs against the swap output. Safe to call even if
      //     the soft-failing swap above didn't land — the speed is just a rate.
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [USDT, U],
          [NEW_PRIME_SPEED_FOR_USDT, NEW_PRIME_SPEED_FOR_U],
        ],
      },

      // 5. Upgrade RiskFundV2 implementation. Safe because RiskFundConverter was
      //    paused inside execute1() above; no convertExactTokens callback can
      //    reach the removed updatePoolState selector.
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RISK_FUND_V2, NEW_RISK_FUND_V2_IMPL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip620;
