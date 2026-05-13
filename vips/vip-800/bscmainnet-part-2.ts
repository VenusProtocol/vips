import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { TIMELOCK_OWNED_CONVERTERS } from "../vip-618/bscmainnet";
import { MIGRATION_HELPER_V2 } from "./bscmainnet-part-1";

export { MIGRATION_HELPER_V2, TIMELOCK_OWNED_CONVERTERS };

const HELPER_EXECUTE2_SIG = "execute2()";

export const VIP_NUMBER = "vip-800-part-2";

export const vip800Part2 = () => {
  const meta = {
    version: "v2",
    title: "VIP-800 [BNB Chain] TokenBuyback Migration Part 2 (drain + converter handback)",
    description: `#### Summary

Final step of the VIP-800 TokenBuyback migration. Drains every non-zero ERC20 balance from the 6 timelock-owned legacy converters into the corresponding new buyback proxies and returns converter ownership to NormalTimelock.

This VIP must be queued and executed **after** vip-800-part-1, which:
- Granted the V2 helper DEFAULT_ADMIN_ROLE on the ACM (renounced at end of execute1) and converter ownership.
- Paused every timelock-owned converter (no inbound conversion since pause).
- Repointed PSR distributions away from legacy converters (no inbound revenue since rewire).
- Returned ownership of the 10 buyback proxies to NormalTimelock.

Between part 1 and part 2 the converters are paused and PSR no longer routes to them, so balances are frozen and there is no economic surface from them. The drain in this VIP simply moves the frozen balances into the new buybacks.

#### Proposed Changes

1. **helper.execute2()** — drains the 6 timelock-owned converters and transfers ownership of each back to NormalTimelock:
    - RiskFundConverter        → RISK_FUND_BUYBACK
    - USDT_PRIME_CONVERTER     → U_PRIME_BUYBACK
    - USDC_PRIME_CONVERTER     → U_PRIME_BUYBACK
    - BTCB_PRIME_CONVERTER     → U_PRIME_BUYBACK
    - ETH_PRIME_CONVERTER      → U_PRIME_BUYBACK
    - XVS_VAULT_CONVERTER      → XVS_BUYBACK
2. **Accept ownership** of the 6 converters returned by the helper.

After this VIP executes, the V2 helper holds no privileges, no balances, and no ownership over any contract. Both execute1() and execute2() revert AlreadyExecuted on any subsequent call.

#### Why split

BSC's Osaka hardfork enforces a hard per-tx gas cap of 2^24 = 16,777,216. The original VIP-618 helper.execute() requires ~17.5M gas (driven primarily by _drainAllConverters iterating 6 converters x 47 core-pool tokens). Splitting drain into execute2() drops part 1 below the cap; this part 2 contains only the drain plus 6 acceptOwnership() calls and is small enough on its own.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. helper.execute2() — drain + converter handback.
      {
        target: MIGRATION_HELPER_V2,
        signature: HELPER_EXECUTE2_SIG,
        params: [],
      },

      // 2. Accept ownership of the 6 converters returned by the helper.
      ...TIMELOCK_OWNED_CONVERTERS.map(c => ({
        target: c,
        signature: "acceptOwnership()",
        params: [],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip800Part2;
