import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const Comptroller = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const vFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
const NewCollateralFactor = parseUnits("0.78", 18);

export const vip235 = () => {
  const meta = {
    version: "v2",
    title: "VIP-235 Update Risk Parameters of core pool",
    description: `
        VIP
        Risk parameters for core pool suggested by Chaos lab:
        - Increase CF of BNB to 78%
        - Update Supply cap and borrow cap of FDUSD to 10,000,000 and 80,00,000
       `,
    forDescription: "I agree that Venus Protocol should proceed with these parameter updation suggested by chaos lab",
    againstDescription:
      "I do not think that Venus Protocol should proceed with these parameter updation suggested by chaos lab",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with these parameter updation suggested by chaos lab or not",
  };
  return makeProposal(
    [
      {
        target: Comptroller,
        signature: "_setCollateralFactor(address,uint256)",
        params: [vBNB, NewCollateralFactor],
      },

      {
        target: Comptroller,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vFDUSD], [parseUnits("10000000", 18)]],
      },
      {
        target: Comptroller,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[vFDUSD], [parseUnits("8000000", 18)]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
