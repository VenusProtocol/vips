import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const VAI_UNITROLLER = "0xf70C3C6b749BbAb89C081737334E74C9aFD4BE16";
export const NEW_VAI_CONTROLLER_IMPL = "0x181936d73641c0B002649B7dD08b51ab935d58C2";

const vip299 = () => {
  const meta = {
    version: "v2",
    title: "VAIController upgrade",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VAI_UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [NEW_VAI_CONTROLLER_IMPL],
      },
      {
        target: NEW_VAI_CONTROLLER_IMPL,
        signature: "_become(address)",
        params: [VAI_UNITROLLER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip299;
