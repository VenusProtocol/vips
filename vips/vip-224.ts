import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const VUNI = "0x27FF564707786720C71A2e5c1490A63266683612";
const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

export const vip224 = () => {
  const meta = {
    version: "v2",
    title: "VIP-224 Update UNI Market Supply and Borrow Caps",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VUNI], [parseUnits("200000", 18).toString()]],
      },
      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[VUNI], [parseUnits("100000", 18).toString()]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
