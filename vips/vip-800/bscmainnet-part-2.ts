import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { BUYBACKS, MIGRATION_HELPER_V2, TIMELOCK_OWNED_CONVERTERS } from "./bscmainnet-part-1";

export { BUYBACKS, MIGRATION_HELPER_V2, TIMELOCK_OWNED_CONVERTERS };

const HELPER_EXECUTE2_SIG = "execute2()";

export const VIP_NUMBER = "vip-800-part-2";

export const vip800Part2 = () => {
  const meta = {
    version: "v2",
    title: "VIP-800 [BNB Chain] TokenBuyback Migration Part 2 (router allowlist + drain + handback)",
    description: `#### Summary

Final step of the VIP-800 TokenBuyback migration. Allowlists 9 swap routers on every buyback, drains every non-zero ERC20 balance from the 6 timelock-owned legacy converters into the corresponding new buyback proxies, and returns ownership of all 16 contracts (10 buybacks + 6 converters) to NormalTimelock.

This VIP must be queued and executed **after** vip-800-part-1, which:
- Granted the V2 helper DEFAULT_ADMIN_ROLE on the ACM (renounced at end of execute1) and converter ownership.
- Accepted ownership of the 10 buyback proxies (deployed with pendingOwner = V2 helper) and the 6 timelock-owned converters.
- Paused every timelock-owned converter (no inbound conversion since pause) and Shortfall auctions.
- Repointed PSR distributions away from legacy converters (no inbound revenue since rewire).
- Ran the May 2026 Prime allocation (Prime.addMarket(vU), PLP.initializeTokens/setMax/setSpeed, helper.executeSwap()).
- Upgraded RiskFundV2 to the new implementation.

Between part 1 and part 2 the converters are paused and PSR no longer routes to them, so balances are frozen and there is no economic surface from them. The drain in this VIP simply moves the frozen balances into the new buybacks.

#### Proposed Changes

1. **helper.execute2()** — three steps:
    - Allowlists 9 swap routers on every buyback (PancakeSwap V2 / V3 / Smart / Universal, Uniswap V2 SwapRouter02 / V3 SwapRouter02 / V4 / Universal, 1inch v5).
    - Drains every non-zero core-pool ERC20 balance off each timelock-owned converter into its replacement buyback:
        - RiskFundConverter        → RISK_FUND_BUYBACK
        - USDT_PRIME_CONVERTER     → U_PRIME_BUYBACK
        - USDC_PRIME_CONVERTER     → U_PRIME_BUYBACK
        - BTCB_PRIME_CONVERTER     → U_PRIME_BUYBACK
        - ETH_PRIME_CONVERTER      → U_PRIME_BUYBACK
        - XVS_VAULT_CONVERTER      → XVS_BUYBACK
    - Transfers ownership of all 16 contracts (10 buybacks + 6 converters) back to NormalTimelock.
2. **Accept ownership** of the 10 buybacks and 6 converters returned by the helper.

After this VIP executes, the V2 helper holds no privileges, no balances, and no ownership over any contract. All three entrypoints (execute1, executeSwap, execute2) revert AlreadyExecuted on any subsequent call.

#### Why split

BSC's Osaka hardfork enforces a hard per-tx gas cap of 2^24 = 16,777,216. The original VIP-618 helper.execute() requires ~17.5M gas (driven primarily by _drainAllConverters iterating 6 converters x 47 core-pool tokens and _allowlistRoutersOnAllBuybacks iterating 10 buybacks x 9 routers). Splitting the drain + router allowlist into execute2() drops both halves comfortably under the cap.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. helper.execute2() — router allowlist on 10 buybacks, drain 6
      //    converters, hand back ownership of all 16 contracts to NormalTimelock.
      {
        target: MIGRATION_HELPER_V2,
        signature: HELPER_EXECUTE2_SIG,
        params: [],
      },

      // 2. Accept ownership of the 10 buybacks and 6 converters handed back by
      //    the helper. Order matches the helper's hand-back order (buybacks
      //    first, then converters) for legibility.
      ...[...BUYBACKS, ...TIMELOCK_OWNED_CONVERTERS].map(a => ({
        target: a,
        signature: "acceptOwnership()",
        params: [],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip800Part2;
