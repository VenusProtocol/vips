import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
export const RISK_FUND_V2_PROXY = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
export const RISK_FUND_V2_NEW_IMPLEMENTATION = "0x60e322C3418EcAEA5E6859551c299c968adc9816";

export const vip583 = () => {
  const meta = {
    version: "v2",
    title: "Week VIP 2026 - Week 54 | Risk Fund Sweep Function Fix Proposal",
    description: `
    ## 1. Context

An edge case in the Risk Fund V2 contract related to the token sweeping mechanism was identified. Specifically, when the contract holds tokens that are not associated with any pool, the "preSweepToken" function may calculate pool-level token shares incorrectly. 

This can cause the sweep operation to revert, creating a denial-of-service scenario for governance-initiated token sweeps. While no user funds are directly at risk, this issue affects the reliability of protocol maintenance actions.

## 2. Action Required

A targeted fix is proposed to update the per-pool calculation logic so that it uses the actual amount required from pooled funds rather than the total requested sweep amount. This adjustment prevents arithmetic underflow when untracked tokens are present. 

The change is limited to a single line in the "RiskFundV2.sol" contract and does not modify external interfaces or user-facing behavior. If approved, this update would be executed via a VIP.

## 3. Summary

- An edge case in the Risk Fund sweep logic can cause governance sweep actions to revert
- The issue arises when untracked tokens exist in the contract balance
- The fix improves robustness without impacting users or fund safety
- Execution is subject to approval through a VIP

We welcome community feedback on this proposal ahead of formal governance submission.
    `,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RISK_FUND_V2_PROXY, RISK_FUND_V2_NEW_IMPLEMENTATION],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip583;
