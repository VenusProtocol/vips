import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const VAI_CONTROLLER_PROXY = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
const VAI_CONTROLLER_IMPL = "0x8A1e5Db8f622B97f4bCceC4684697199C1B1D11b";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const VENUS_DEPLOYER = "0x1ca3Ac3686071be692be7f1FBeCd668641476D7e";
const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";
const VAI_CONTROLLER_IMPL_TEMP = "0x1380031b367511627162135F2Befc97E7C3A3E49";

export const vip109 = () => {
  const meta = {
    version: "v2",
    title: "VIP-109 Change Admin in VAI",
    description: `
        Replace the implementation of the VAIController with a temporary implementation that will include a function to:
            add the Normal Timelock as an admin in the VAI contract: VAI.rely(normalTimelockAddress)
            remove the legacy Venus Deployer address as an admin: VAI.deny(0x1ca3ac3686071be692be7f1fbecd668641476d7e)
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
        signature: "addAdmin(address)",
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

      {
        target: VAI,
        signature: "deny(address)",
        params: [VENUS_DEPLOYER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
