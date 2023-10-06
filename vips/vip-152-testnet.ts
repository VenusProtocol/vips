import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const vBNB_ADDRESS = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";
const VBNBAdmin_ADDRESS = "0x7575D142AAb97229e5928f94c03da39b34Bb0E96";

export const vip152Testnet = () => {
  const meta = {
    version: "v2",
    title: "Change vBNB admin to vBNBAdmin",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with setting the vBNB admin",
    againstDescription: "I do not think that Venus Protocol should proceed with setting the vBNB admin",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with setting the vBNB admin",
  };

  return makeProposal(
    [
      // this step is only required for testnet because vBNB admin in testnet is an EOA instead of normal timelock
      {
        target: vBNB_ADDRESS,
        signature: "_acceptAdmin()",
        params: [],
      },
      // this step is to make timelock the admin of vBNBAdmin contract. For this step to work, we must make sure we have
      // invoked vBNBAdmin.transferOwnership(timelockAddress) after deploying the vBNBAdmin contract
      {
        target: VBNBAdmin_ADDRESS,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: vBNB_ADDRESS,
        signature: "_setPendingAdmin(address)",
        params: [VBNBAdmin_ADDRESS],
      },
      {
        target: VBNBAdmin_ADDRESS,
        signature: "_acceptAdmin()",
        params: [],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
