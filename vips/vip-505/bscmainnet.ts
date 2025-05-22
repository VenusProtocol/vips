import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ERC4626_FACTORY_ARBITRUM = "0xC1422B928cb6FC9BA52880892078578a93aa5Cc7";
export const ERC4626_FACTORY_OPTIMISIM = "0xc801B471F00Dc22B9a7d7b839CBE87E46d70946F";

export const vip505 = () => {
  const meta = {
    version: "v2",
    title: "VIP-505",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with the Vault Upgrades",
    againstDescription: "I do not think that Venus Protocol should proceed with the Vault Upgrades",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Vault Upgrades or not",
  };

  return makeProposal(
    [
      {
        target: ERC4626_FACTORY_ARBITRUM,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ERC4626_FACTORY_OPTIMISIM,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip505;
