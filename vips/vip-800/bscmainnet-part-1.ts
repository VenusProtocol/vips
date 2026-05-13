import { ethers } from "ethers";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  BUYBACKS,
  CORE_TOKENS,
  DEFAULT_PROXY_ADMIN,
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
} from "../vip-618/bscmainnet";

const { bscmainnet } = NETWORK_ADDRESSES;

// Re-export the address universe so simulations and downstream tooling have a
// single import surface for both halves of the migration.
export {
  BUYBACKS,
  CORE_TOKENS,
  DEFAULT_PROXY_ADMIN,
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
};

// ===== TokenBuyback migration helper V2 (execute1 / execute2 split) =====
// V1 helper at 0x352d2188A5C838854B8565dCD88cD3c9c996e83A is unexecutable: its
// single execute() needs ~17.5M gas, exceeding BSC's Osaka per-tx cap of
// 16,777,216 (2^24). V2 splits the migration into:
//   execute1()  — every step except draining the 6 timelock-owned converters.
//                 Includes the May 2026 Prime rewards allocation (Shortfall
//                 pause, vU addMarket, PLP init/sweep/swap/speeds) folded in
//                 after the PSR rewire. Swap legs and the final
//                 setTokensDistributionSpeed are soft-fail (try/catch), so a
//                 thin-pool revert can't unwind the migration core. Any
//                 leftover USDC is forwarded back to NormalTimelock.
//   execute2()  — only the converter drain + handBack of the 6 timelock-owned
//                 converters (called by vip-800 part 2).
// The 10 buyback proxies' pendingOwner must be re-pointed to this V2 address
// by the deployer (off-chain transferOwnership from the current owner) before
// this VIP executes. The 6 timelock-owned converters keep this helper as their
// owner across both VIPs; ownership returns to NormalTimelock at the end of
// part 2.
// Deployment: protocol-reserve/deployments/bscmainnet/TokenBuybackMigrationHelper.json
export const MIGRATION_HELPER_V2 = "0xa30fcE7A72aD101f6afd4D8b89D1AD8687f51cb0";

// AccessControl `DEFAULT_ADMIN_ROLE` (OZ AccessControl) — the admin role on the
// AccessControlManager. Granting it to the helper lets `execute1()` self-grant
// transient ACM permissions and renounce them at the end of the call.
const DEFAULT_ADMIN_ROLE = ethers.constants.HashZero;

// Helper.execute1() — non-drain phase of the migration. Includes the May 2026
// Prime rewards allocation block (soft-fail on swap legs and final
// setTokensDistributionSpeed). Drain happens in execute2() (vip-800 part 2).
const HELPER_EXECUTE1_SIG = "execute1()";

export const VIP_NUMBER = "vip-800-part-1";

export const vip800Part1 = () => {
  const meta = {
    version: "v2",
    title: "VIP-800 [BNB Chain] TokenBuyback Migration Part 1 & May Prime Allocation",
    description: `#### Summary

Replaces VIP-618 (unexecutable on-chain because its single helper.execute() exceeds BSC's Osaka per-tx gas cap of 16,777,216). VIP-800 splits the migration into two proposals:

- **Part 1 (this VIP)**: every migration step except draining the 6 timelock-owned converters. The May 2026 Prime Rewards Allocation is folded inside helper.execute1(); swap legs and the final setTokensDistributionSpeed are soft-fail to insulate the migration core from thin-pool reverts.
- **Part 2 (vip-800-part-2)**: the converter drain and the final return of converter ownership to NormalTimelock.

Between part 1 and part 2 the 6 legacy converters are paused (no inbound conversion can occur) and PSR is already repointed away from them, so balances are frozen and there is no economic surface from them.

#### Proposed Changes

1. **Grant DEFAULT_ADMIN_ROLE** on the AccessControlManager to the V2 helper, so it can self-grant the transient ACM permissions it needs (pauseConversion per converter, addOrUpdateDistributionConfigs, removeDistributionConfig, Shortfall.pauseAuctions, Prime.addMarket, PLP initialize/setMaxSpeed/setSpeed/sweepToken).
2. **Transfer ownership** of the 6 timelock-owned legacy converters to the V2 helper. The 10 buyback proxies are deployed with pendingOwner = V2 helper, so the helper accepts them inside execute1() without an intermediate NormalTimelock claim.
3. **helper.execute1()** — runs every non-drain step:
    - Accepts ownership of all 16 contracts (10 buybacks + 6 converters).
    - Allowlists 9 swap routers on every buyback (PancakeSwap V2 / V3 / Smart / Universal, Uniswap V2 SwapRouter02 / V3 SwapRouter02 / V4 / Universal, 1inch v5).
    - Grants executeBuyback and forwardBaseAsset ACM permissions to the cron operator on every buyback.
    - Calls pauseConversion() on every timelock-owned converter.
    - Repoints ProtocolShareReserve distributions: 18 new buyback rows added and 12 stale rows zeroed in a sequence that preserves the per-schema percentage invariant (1e4 or 0) at every checkpoint.
    - Runs the May 2026 Prime allocation: Shortfall.pauseAuctions, Prime.addMarket(vU), PLP.initializeTokens([U]), PLP.setMaxTokensDistributionSpeed([U],[1e18]), PLP.sweepToken(USDC, helper, 14986e18), router approve, swap USDC -> USDT and USDC -> U via PancakeSwap V3 (both wrapped in try/catch — failure emits StepFailed and the migration continues), reset router allowance, forward leftover USDC back to NormalTimelock, PLP.setTokensDistributionSpeed([USDT, U], [...]) (also try/catch).
    - Transfers ownership of the **10 buybacks** back to NormalTimelock (the 6 converters stay helper-owned until part 2).
    - Renounces DEFAULT_ADMIN_ROLE on the AccessControlManager so the helper retains no residual ACM privilege between the two VIPs.
4. **Accept ownership** of the 10 buybacks returned by the helper.
5. **Upgrade RiskFundV2 implementation**. The new implementation removes updatePoolState, sweepTokenFromPool, and the poolAssetsFunds mapping. The upgrade is safe because RiskFundConverter is paused inside execute1() above, so no in-flight convertExactTokens callback can hit the removed updatePoolState selector — even though the converter still holds balance until part 2.

Helper source: contracts/helpers/TokenBuybackMigrationHelper.sol in this repository (deployed to bscmainnet at the address above). Implementation of the new RiskFundV2: [VenusProtocol/protocol-reserve PR #158](https://github.com/VenusProtocol/protocol-reserve/pull/158).

#### Why split

BSC's Osaka hardfork enforces a hard per-tx gas cap of 2^24 = 16,777,216. The original VIP-618 helper.execute() requires ~17.5M gas (driven primarily by _drainAllConverters iterating 6 converters x 47 core-pool tokens). Splitting drain into execute2() drops part 1 below the cap; part 2 is small enough on its own. vip-framework asserts the cap inside testVip so future violations fail in CI rather than at execute time on chain.`,
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
      ...TIMELOCK_OWNED_CONVERTERS.map(c => ({
        target: c,
        signature: "transferOwnership(address)",
        params: [MIGRATION_HELPER_V2],
      })),

      // 3. helper.execute1() — non-drain phase + Prime allocation.
      {
        target: MIGRATION_HELPER_V2,
        signature: HELPER_EXECUTE1_SIG,
        params: [],
      },

      // 4. Accept ownership of the 10 buybacks handed back by the helper.
      //    The 6 converters stay helper-owned until vip-800-part-2 runs execute2().
      ...BUYBACKS.map(a => ({
        target: a,
        signature: "acceptOwnership()",
        params: [],
      })),

      // 5. Upgrade RiskFundV2 implementation. Safe because RiskFundConverter
      //    was paused inside execute1() above; no convertExactTokens callback
      //    can reach the removed updatePoolState selector.
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

export default vip800Part1;
