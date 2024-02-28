import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const SINGLE_TOKEN_CONVERTER_BEACON = "0x4c9D57b05B245c40235D720A5f3A592f3DfF11ca";
export const NEW_SINGLE_TOKEN_CONVERTER_IMP = "0x40ed28180Df01FdeB957224E4A5415704B9D5990";
export const NEW_RISK_FUND_CONVERTER_IMP = "0xd420Bf9C31F6b4a98875B6e561b13aCB19210647";
export const RISK_FUND_CONVERTER_PROXY = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";
export const PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";

export const PROXY_ADMIN_LIQUIDATOR = "0x2b40B43AC5F7949905b0d2Ed9D6154a8ce06084a";
export const LIQUIDATOR_CONTRACT = "0x0870793286aaDA55D39CE7f82fb2766e8004cF43";

export const OLD_IMPL = "0xE26cE9b5FDd602225cCcC4cef7FAE596Dcf2A965";
export const TEMP_IMPL = "0x3aD4b5677AdC2a6930B2A08f443b9B3c6c605CD8";
export const PSR = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";

export const vipConverter = (data?: string) => {
  const meta = {
    version: "v2",
    title:
      "VIP-Converter upgrades the implementation of token converter and sets the PSR address in liquidator contract.",
    description: `
            1. This VIP upgrades the implementation of RiskFundConverter, SingleTokenConverter.
            2. This VIP sets the address of the PSR in the Liquidator contract.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: PROXY_ADMIN_LIQUIDATOR,
        signature: "upgradeAndCall(address,address,bytes)",
        params: [LIQUIDATOR_CONTRACT, TEMP_IMPL, data],
      },
      {
        target: PROXY_ADMIN_LIQUIDATOR,
        signature: "upgrade(address,address)",
        params: [LIQUIDATOR_CONTRACT, OLD_IMPL],
      },
      {
        target: LIQUIDATOR_CONTRACT,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: LIQUIDATOR_CONTRACT,
        signature: "setProtocolShareReserve(address)",
        params: [PSR],
      },
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

export default vipConverter;
