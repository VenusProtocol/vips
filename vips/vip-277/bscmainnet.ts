import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import { accounts3, accounts4, accounts5, accounts6 } from "./users";

export const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

export const vip277 = () => {
  const meta = {
    version: "v2",
    title: "VIP-SeizeVenus",
    description: `This VIP executes seizeVenus`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "seizeVenus(address[],address)",
        params: [accounts3, UNITROLLER],
      },
      {
        target: UNITROLLER,
        signature: "seizeVenus(address[],address)",
        params: [accounts4, UNITROLLER],
      },
      {
        target: UNITROLLER,
        signature: "seizeVenus(address[],address)",
        params: [accounts5, UNITROLLER],
      },
      {
        target: UNITROLLER,
        signature: "seizeVenus(address[],address)",
        params: [accounts6, UNITROLLER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip277;
