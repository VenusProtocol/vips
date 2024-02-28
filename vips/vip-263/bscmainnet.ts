import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const CERTIK_RECEIVER = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
export const QUANTSTAMP_RECEIVER = "0xd88139f832126b465a0d7A76be887912dc367016";
export const COMMUNITY_RECEIVER = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
export const XVS_RECEIVER = "0xf31acE72428501B9e8C1AF7b9FB1C6E754d65C33";
export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";

export const CERTIK_USDT_AMOUNT = parseUnits("19000", 18);
export const QUANTSTAMP_USDC_AMOUNT = parseUnits("32500", 18);
export const COMMUNITY_BNB_AMOUNT = parseUnits("1", 18);
export const COMMUNITY_USDT_AMOUNT = parseUnits("44500", 18);
export const XVS_AMOUNT = parseUnits("620", 18);

export const vip263 = () => {
  const meta = {
    version: "v2",
    title: "VIP-263: Audit and Other Expenses Payments",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, CERTIK_USDT_AMOUNT, CERTIK_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, QUANTSTAMP_USDC_AMOUNT, QUANTSTAMP_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [COMMUNITY_BNB_AMOUNT, COMMUNITY_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, COMMUNITY_USDT_AMOUNT, COMMUNITY_RECEIVER],
      },
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [XVS_RECEIVER, XVS_AMOUNT],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip263;
