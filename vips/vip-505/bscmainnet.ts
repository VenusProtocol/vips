import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ERC4626_FACTORY_ARBITRUM = "0xC1422B928cb6FC9BA52880892078578a93aa5Cc7";
export const ERC4626_FACTORY_OPTIMISIM = "0xc801B471F00Dc22B9a7d7b839CBE87E46d70946F";
export const ERC4626_FACTORY_BASE = "0x1A430825B31DdA074751D6731Ce7Dca38D012D13";
export const ERC4626_FACTORY_ETHEREUM = "0x39cb747453Be3416E659dAeA169540b6F000c885";
export const ERC4626_FACTORY_UNICHAIN = "0x102fEb723C25c67dbdfDccCa3B1c1a6e1a662D2f";
export const ERC4626_FACTORY_ZKSYNC = "0xDC59Dd76Dd7A64d743C764a9aa8C96Ff2Ea8BAc3";
export const ERC4626_FACTORY_OPBNB = "0x89A5Ce0A6db7e66E53F148B50D879b700dEB81C8";

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
      {
        target: ERC4626_FACTORY_BASE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ERC4626_FACTORY_ETHEREUM,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ERC4626_FACTORY_UNICHAIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ERC4626_FACTORY_ZKSYNC,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ERC4626_FACTORY_OPBNB,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip505;
