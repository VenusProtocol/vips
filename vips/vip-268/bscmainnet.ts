import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
export const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

export const WBNB_WITHDRAW_AMOUNT = parseUnits("2431.068422494325838291", 18);
export const EXCHANGE_RATE_AFTER_MINT = parseUnits("239107672.531201493662817556", 18);

/**
 * Exchange rate after minting is 239107672.531201498829432328
 * exchangeRate * vBNBAmount = ~wBNBAmount
 * */
export const VTOKEN_AMOUNT = parseUnits("0.000010167253926898", 18);

export const vip268 = () => {
  const meta = {
    version: "v2",
    title: "VIP-268 BNB Treasury Management Proposal",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [WBNB, WBNB_WITHDRAW_AMOUNT, NORMAL_TIMELOCK],
      },
      {
        target: WBNB,
        signature: "withdraw(uint256)",
        params: [WBNB_WITHDRAW_AMOUNT],
      },
      {
        target: vBNB,
        signature: "mint(uint256)",
        params: [WBNB_WITHDRAW_AMOUNT],
        value: WBNB_WITHDRAW_AMOUNT.toString(),
      },
      {
        target: vBNB,
        signature: "transfer(address,uint256)",
        params: [TREASURY, VTOKEN_AMOUNT],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip268;
