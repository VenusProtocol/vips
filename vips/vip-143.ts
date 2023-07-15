import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const VWBETH = "0x6cfdec747f37daf3b87a35a1d9c8ad3063a1a8a0";
const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";

export const vip143 = () => {
  const meta = {
    version: "v2",
    title: "VIP-143 Risk Parameters Update",
    description: `

  Changes to do
  WBETH
    Raise borrow cap to 1,100 from 550
    Raise supply cap to 8,000 from 4,000`,

    forDescription: "I agree that Venus Protocol should proceed with the Risk Parameters Update",
    againstDescription: "I do not think that Venus Protocol should proceed with the Risk Parameters Update",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Risk Parameters Update or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[VWBETH], [parseUnits("1100", 18)]],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VWBETH], [parseUnits("8000", 18)]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
