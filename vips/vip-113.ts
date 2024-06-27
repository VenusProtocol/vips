import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const XVS_VAULT_PROXY = "0x051100480289e704d20e9DB4804837068f3f9204";
const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";

export const vip113 = () => {
  const meta = {
    version: "v2",
    title: "VIP-113 Set XVS Vault Reward Amount",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal or not",
  };

  return makeProposal(
    [
      {
        target: XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
      },
      {
        target: XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlock(address,uint256)",
        params: [XVS, "38194444444444445"],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
