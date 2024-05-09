import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const BNB_TREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

export const ETH_AMOUNT = parseUnits("1.2342", 18);
export const USDT_AMOUNT = parseUnits("10518.73", 18);
export const BNB_AMOUNT = parseUnits("3", 18);

export const vip303 = () => {
  const meta = {
    version: "v2",
    title: "VIP-303 VIP to refund the Community Wallet",
    description: `#### Summary

If passed, this VIP will transfer from the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) to the [Community wallet](https://bscscan.com/address/0xc444949e0054A23c44Fc45789738bdF64aed2391) these tokens:

- 1.2342 ETH
- 3 BNB
- 10,518.73 USDT`,

    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
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
      {
        target: BNB_TREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [BNB_AMOUNT, COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
