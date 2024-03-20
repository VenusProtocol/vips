import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../src/utils";

export const TREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
export const COMMUNITY_WALLET = "0xc444949e0054a23c44fc45789738bdf64aed2391";
export const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
export const XVS_AMOUNT = parseUnits("8000", 18).toString();

export const vip015 = () => {
  return makeProposal([
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, XVS_AMOUNT, COMMUNITY_WALLET],
    },
  ]);
};
