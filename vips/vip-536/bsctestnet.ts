import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const SINGLE_TOKEN_CONVERTER_BEACON_BSC = "0xD2410D8B581D37c5B474CD9Ee0C15F02138AC028";
export const NEW_SINGLE_TOKEN_CONVERTER_IMP_BSC = "0x892A70c9D9f946c0CB2b148f40B95Ba0024e8968";
export const SINGLE_TOKEN_CONVERTER_BEACON_ETHEREUM = "0xb86e532a5333d413A1c35d86cCdF1484B40219eF";
export const NEW_SINGLE_TOKEN_CONVERTER_IMP_ETHEREUM = "0x04444eAc8811140A3B22814a2203F6908d0708ad";
export const SINGLE_TOKEN_CONVERTER_BEACON_ARBITRUM = "0xC77D0F75f1e4e3720DA1D2F5D809F439125a2Fd4";
export const NEW_SINGLE_TOKEN_CONVERTER_IMP_ARBITRUM = "0xcf78eB1806660F0D001F786C66f294DADb9F95b0";

export const vip536 = () => {
  const meta = {
    version: "v2",
    title: "VIP-3328 upgrades the implementation of token converters",
    description: `
        This VIP upgrades the implementation of SingleTokenConverter on bsc, ethereum and arbitrum.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: SINGLE_TOKEN_CONVERTER_BEACON_BSC,
        signature: "upgradeTo(address)",
        params: [NEW_SINGLE_TOKEN_CONVERTER_IMP_BSC],
      },
      {
        target: SINGLE_TOKEN_CONVERTER_BEACON_ETHEREUM,
        signature: "upgradeTo(address)",
        params: [NEW_SINGLE_TOKEN_CONVERTER_IMP_ETHEREUM],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SINGLE_TOKEN_CONVERTER_BEACON_ARBITRUM,
        signature: "upgradeTo(address)",
        params: [NEW_SINGLE_TOKEN_CONVERTER_IMP_ARBITRUM],
        dstChainId: LzChainId.arbitrumsepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip536;
