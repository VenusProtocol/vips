import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const VTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
export const NEW_SUPPLY_CAP = parseUnits("1500000", 18);
export const NEW_BORROW_CAP = parseUnits("1200000", 18);

export const vip158 = () => {
  const meta = {
    version: "v2",
    title: "VIP-158 Risk Parameters Update",
    description: `
    TUSD (Core pool):
      New Supply cap: 1,500,000
      New Borrow cap: 1,200,000
      `,
    forDescription: "I agree that Venus Protocol should proceed with the Risk Parameters Update's",
    againstDescription: "I do not think that Venus Protocol should proceed with the Risk Parameters Update's",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Risk Parameters Update's or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VTUSD], [NEW_SUPPLY_CAP]],
      },
      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[VTUSD], [NEW_BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
