import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const vBTC = "0x882c173bc7ff3b7786ca16dfed3dfffb9ee7847b";
const BTC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const BORROWER = "0xef044206db68e40520bfa82d45419d498b4bc7bf";
const repayAmount = parseUnits("90.32999985", 18);

export const vip121 = () => {
  const meta = {
    version: "v2",
    title: "VIP-121 Repay BTC debt on behalf",
    description: `
    * transfer 90329999850000000000 (atoms) BTC (90,32999985 full BTC) from the treasury to the Normal timelock contract
    * repay 90.32999985 BTC debt on behalf of the account 0xef044206db68e40520bfa82d45419d498b4bc7bf from the Normal timelock contract`,
    forDescription: "I agree that Venus Protocol should proceed with the Repay BTC debt on behalf",
    againstDescription: "I do not think that Venus Protocol should proceed with the Repay BTC debt on behalf",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Repay BTC debt on behalf or not",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BTC, repayAmount, NORMAL_TIMELOCK],
      },

      {
        target: BTC,
        signature: "approve(address,uint256)",
        params: [vBTC, repayAmount],
      },

      {
        target: vBTC,
        signature: "repayBorrowBehalf(address,uint256)",
        params: [BORROWER, repayAmount],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
