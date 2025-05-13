import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ERC4626_FACTORY_BNB = "";
export const ERC4626_FACTORY_SEPOLIA = "0xa2f3ac3745E6C813f5bBd3D5c8b29b894E952F04";
export const ERC4626_FACTORY_OPBNB = "";
export const ERC4626_FACTORY_BASE = "";
export const ERC4626_FACTORY_ARBITRUM = "";
export const ERC4626_FACTORY_OPTIMISIM = "";
export const ERC4626_FACTORY_ZKSYNC = "";
export const ERC4626_FACTORY_UNICHAIN = "";

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
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip500;
