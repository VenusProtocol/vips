import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const FAST_TRACK_TIMELOCK = "0x8764F50616B62a99A997876C2DEAaa04554C5B2E";

const vip304 = () => {
  const meta = {
    version: "v2",
    title: "VIP-304",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: FAST_TRACK_TIMELOCK,
        signature: "",
        params: [],
        value: "1",
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip304;
