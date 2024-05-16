import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const VAI_CONTROLLER_PROXY = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
const VAI_CONTROLLER_IMPL = "0x8A1e5Db8f622B97f4bCceC4684697199C1B1D11b";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const VAI_CONTROLLER_IMPL_TEMP = "0xDe94DB16db2DD3b9c6aed563701c96BFcF750c57";

export const vip110 = () => {
  const meta = {
    version: "v2",
    title: "VIP-110 Change Admin in VAI",
    description: `
        Replace the implementation of the VAIController with a temporary implementation that will include a function to:
            add the Normal Timelock as an admin in the VAI contract: VAI.rely(normalTimelockAddress)
        Execute the new function in the VAIController
        Restore the original VAIController
          `,
    forDescription: "I agree that Venus Protocol should proceed with the Change Admin in VAI",
    againstDescription: "I do not think that Venus Protocol should proceed with the Change Admin in VAI",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Change Admin in VAI or not",
  };

  return makeProposal(
    [
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "_setPendingImplementation(address)",
        params: [VAI_CONTROLLER_IMPL_TEMP],
      },

      {
        target: VAI_CONTROLLER_IMPL_TEMP,
        signature: "_become(address)",
        params: [VAI_CONTROLLER_PROXY],
      },

      {
        target: VAI_CONTROLLER_PROXY,
        signature: "setUpVAIAdmins(address)",
        params: [NORMAL_TIMELOCK],
      },

      {
        target: VAI_CONTROLLER_PROXY,
        signature: "_setPendingImplementation(address)",
        params: [VAI_CONTROLLER_IMPL],
      },

      {
        target: VAI_CONTROLLER_IMPL,
        signature: "_become(address)",
        params: [VAI_CONTROLLER_PROXY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
