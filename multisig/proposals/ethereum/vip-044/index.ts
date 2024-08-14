import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

export const PRIME_LIQUIDITY_PROVIDER = "0x8ba6affd0e7bcd0028d1639225c84ddcf53d8872";
export const COMMUNITY_WALLET = "0xc444949e0054a23c44fc45789738bdf64aed2391";
export const BBTC = "0x9be89d2a4cd102d8fecc6bf9da793be995c22541";
export const TRANSFER_AMOUNT = parseUnits("0.23168", 8);

export const vip044 = () => {
  return makeProposal([
    {
      target: PRIME_LIQUIDITY_PROVIDER,
      signature: "sweepToken(address,address,uint256)",
      params: [BBTC, COMMUNITY_WALLET, TRANSFER_AMOUNT.toString()],
      value: "0",
    },
  ]);
};

export default vip044;
