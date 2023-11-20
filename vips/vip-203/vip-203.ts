import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import staked from "./staked-users";

export const vip203 = () => {
  const meta = {
    version: "v2",
    title: "VIP-203 Venus Prime: deployment stage 3/5",
    description: `#### Description

If passed, this VIP will set a batch of timestamps when users staked more than 1,000 XVS on the XVSVault. The qualified users will be able to claim their Prime tokens.

This VIP is the third one to enable Venus Prime. The first VIP was [VIP-201](https://app.venus.io/#/governance/proposal/201).

Check [VIP-201](https://app.venus.io/#/governance/proposal/201) for more details (Security and additional considerations, Audit reports, Deployed contracts on mainnet and References)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal([staked], meta, ProposalType.REGULAR);
};
