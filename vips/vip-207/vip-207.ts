import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import command from "./command";

export const vip207 = () => {
  const meta = {
    version: "v2",
    title: "VIP-207 Venus Prime: fix timestamps",
    description: `#### Summary

If passed, this VIP will set a batch of timestamps when users staked more than 1,000 XVS on the XVSVault. The qualified users will be able to claim their Prime tokens.

#### Description

This VIP is a follow up of the VIPs [VIP-202](https://app.venus.io/#/governance/proposal/202) and [VIP-203](https://app.venus.io/#/governance/proposal/203), and it covers the following cases:

- New wallets and timestamps:
    - Wallets that staked more than 1,000 XVS while the Prime VIP’s were “in flight” (from their proposal until their execution). 8 instances
    - Wallets not included in VIP-202 or VIP-203, due to a rounding error processing the timestamps off-chain. 5 instances
- Timestamps to be reset:
    - Wallets that requested withdrawal of XVS from the XVS vault while the Prime VIP’s were “in flight”, keeping staked less than 1,000 XVS. 18 instances
    - Timestamps wrongly added in VIP-202 or VIP-203, because the executions of the withdrawal were considered, instead of the requests of the withdrawals. 25 instances

This is an extraordinary VIP in the deployment plan for Prime. One more VIP will be proposed to complete the deployment. Check [VIP-201](https://app.venus.io/#/governance/proposal/201) for more details (Security and additional considerations, Audit reports, Deployed contracts on mainnet and References).`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal([command], meta, ProposalType.FAST_TRACK);
};
