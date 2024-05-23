import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const BNB_TREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

export const BTC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

export const BTC_AMOUNT = parseUnits("0.3", 18);
export const ETH_AMOUNT = parseUnits("14", 18);
export const USDT_AMOUNT = parseUnits("40000", 18);

export const vip234 = () => {
  const meta = {
    version: "v2",
    title: "VIP to transfer XVS to ethereum chain",
    description: ``,

    forDescription: "I agree that Venus Protocol should proceed with this transfer for XVS",
    againstDescription: "I do not think that Venus Protocol should proceed with this transfer for XVS",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this transfer for XVS",
  };

  return makeProposal(
    [
      {
        target: BNB_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BTC, BTC_AMOUNT, COMMUNITY_WALLET],
      },
      {
        target: BNB_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, ETH_AMOUNT, COMMUNITY_WALLET],
      },
      {
        target: BNB_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_AMOUNT, COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
