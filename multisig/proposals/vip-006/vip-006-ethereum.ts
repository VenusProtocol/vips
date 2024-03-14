import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../src/utils";

export const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
export const ETHEREUM_TREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
export const XVS_REWARD_AMOUNT = parseUnits("22500", 18);
export const XVS_STORE = "0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B";
const XVS_VAULT_PROXY = "0xA0882C2D5DF29233A092d2887A258C2b90e9b994";

export const vip006 = () => {
  return makeProposal([
    {
      target: ETHEREUM_TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, XVS_REWARD_AMOUNT, XVS_STORE],
    },
    {
      target: XVS_VAULT_PROXY,
      signature: "setRewardAmountPerBlock(address,uint256)",
      params: [XVS, "34722222222222222"],
    },
  ]);
};
