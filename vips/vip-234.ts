import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const XVS_VAULT_PROXY = "0x051100480289e704d20e9DB4804837068f3f9204";
const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";

export const vip234 = () => {
  const meta = {
    version: "v2",
    title: "VIP-234 Update XVS Distributions APR based on Q4'2023 Buyback results",
    description: `#### Summary

This VIP will perform the following actions:

- Set the new XVS Vault distribution speed to 1,630 XVS/day

#### Description

Our latest [buyback](https://app.venus.io/#/governance/proposal/231) earlier this month for the amount of approximately USD $642,516 resulted in the buyback of 53,408.06 XVS. These XVS were [already sent](https://bscscan.com/tx/0x7df77052207e0ce68a24fbfccbdaf409d32a3b65858a94b67ee9f12a05b66944) to the XVS Vault rewards distribution wallet.

The new distribution speed will be 1,630 XVS per day for a period of 91 days, resulting in an estimated APR of 8.83%.`,
    forDescription: "I agree, Venus Protocol should immediately proceed with these adjustments.",
    againstDescription: "I do not think that Venus Protocol should proceed with these adjustments",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with these adjustments or not",
  };

  return makeProposal(
    [
      {
        target: XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlock(address,uint256)",
        params: [XVS, "56597222222222222"],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};
