import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const BINANCE_WALLET = "0x6657911F7411765979Da0794840D671Be55bA273";

export const vip260 = () => {
  const meta = {
    version: "v2",
    title: "VIP-260 Shortfall Repayment Preparation",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with these payments",
    againstDescription: "I do not think that Venus Protocol should proceed with these payments",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with these payments",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, parseUnits("105000", 18), BINANCE_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip260;
