import { makeProposal } from "../../../src/utils";

const VTREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
const BBTC = "0x9BE89D2a4cd102D8Fecc6BF9dA793be995C22541";

const BBTC_AMOUNT = "30000000";

export const vip002 = () => {
  return makeProposal([
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [BBTC, BBTC_AMOUNT, COMMUNITY_WALLET],
    },
  ]);
};
