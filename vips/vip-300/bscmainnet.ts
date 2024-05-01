import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const vFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
export const vFIL = "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343";
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

export const vip300 = () => {
  const meta = {
    version: "v2",
    title: "VIP-300 Update supply and borrow caps",
    description: `#### Summary
      This VIP will update supply and borrow caps of following markets
      FDUSD(Core) : 
        supply cap to  40,000,000, 
        borrow cap to 34,000,000
      FIL(Core) : 
        supply cap to 1,200,000
 `,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [
          [vFDUSD, vFIL],
          [parseUnits("40000000", 18), parseUnits("1200000", 18)],
        ],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[vFDUSD], [parseUnits("34000000", 18)]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip300;
