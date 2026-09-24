import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vU = "0x3d5E269787d562b74aCC55F18Bd26C5D09Fa245E";

export const vip581Addendum2 = () => {
  const meta = {
    version: "v2",
    title: "VIP-581-addendum2 Enable flash loans on vU market in the Core pool",
    description: `This proposal enables flash loans on the vU market in the Core pool, as per VIP-581.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: vU,
        signature: "setFlashLoanEnabled(bool)",
        params: [true],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip581Addendum2;
