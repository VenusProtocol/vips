import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const SINGLE_TOKEN_CONVERTER_BEACON = "0xD2410D8B581D37c5B474CD9Ee0C15F02138AC028";
export const NEW_SINGLE_TOKEN_CONVERTER_IMP = "0x42Ec3Eb6F23460dFDfa3aE5688f3415CDfE0C6AD";
export const NEW_RISK_FUND_CONVERTER_IMP = "0x857ebb8CAcb97DE5ab719320c9FB3aa16076bFe3";
export const RISK_FUND_CONVERTER_PROXY = "0x32Fbf7bBbd79355B86741E3181ef8c1D9bD309Bb";
export const PROXY_ADMIN = "0x7877fFd62649b6A1557B55D4c20fcBaB17344C91";

export const vipConverter2 = () => {
  const meta = {
    version: "v2",
    title: "VIP-Converter2 upgrades the implementation of token converters",
    description: `
        This VIP upgrades the implementation of RiskFundConverter and SingleTokenConverter.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RISK_FUND_CONVERTER_PROXY, NEW_RISK_FUND_CONVERTER_IMP],
      },
      {
        target: SINGLE_TOKEN_CONVERTER_BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_SINGLE_TOKEN_CONVERTER_IMP],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vipConverter2;
