import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ERC4626_FACTORY_SEPOLIA = "0xbf76e9429BA565220d77831A9eC3606434e2106e";
export const ERC4626_FACTORY_OPBNB = "0x3dEDBD90EFC6E2257887FF36842337dF0739B8A1";
export const ERC4626_FACTORY_BASE = "0xD13c5527d1a2a8c2cC9c9eb260AC4D9D811a02a4";
export const ERC4626_FACTORY_ARBITRUM = "0xC6C8249a0B44973673f3Af673e530B85038a0480";
export const ERC4626_FACTORY_OPTIMISIM = "0xc66c4058A8524253C22a9461Df6769CE09F7d61e";
export const ERC4626_FACTORY_UNICHAIN = "0x1365820B9ba3B1b5601208437a5A24192a12C1fB";
export const ERC4626_FACTORY_ZKSYNC = "0xa30dcc21B8393A4031cD6364829CDfE2b6D7B283";

export const vip500 = () => {
  const meta = {
    version: "v2",
    title: "VIP-500",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with the Vault Upgrades",
    againstDescription: "I do not think that Venus Protocol should proceed with the Vault Upgrades",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Vault Upgrades or not",
  };

  return makeProposal(
    [
      {
        target: ERC4626_FACTORY_SEPOLIA,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ERC4626_FACTORY_UNICHAIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: ERC4626_FACTORY_ARBITRUM,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ERC4626_FACTORY_OPTIMISIM,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: ERC4626_FACTORY_OPBNB,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: ERC4626_FACTORY_BASE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: ERC4626_FACTORY_ZKSYNC,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncsepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip500;
