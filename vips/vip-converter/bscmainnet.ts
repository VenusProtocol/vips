import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const SINGLE_TOKEN_CONVERTER_BEACON = "0x4c9D57b05B245c40235D720A5f3A592f3DfF11ca";
export const NEW_SINGLE_TOKEN_CONVERTER_IMP = "";
export const NEW_RISK_FUND_CONVERTER_IMP = "";
export const RISK_FUND_CONVERTER_PROXY = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";
export const PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
export const LIQUIDATOR = "0x0870793286aaDA55D39CE7f82fb2766e8004cF43";
export const PSR = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";

export const vipConverter = () => {
  const meta = {
    version: "v2",
    title: "VIP-Converter upgrades the implementation of token converter",
    description: `
            This VIP upgrades the implementation of RiskFundConverter and SingleTokenConverter`,
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
      {
        target: LIQUIDATOR,
        signature: "setProtocolShareReserve(address)",
        params: [PSR],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vipConverter;
