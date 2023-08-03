import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const COMPTROLLER_ADDRESS = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const vBNB_ADDRESS = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";
const WBNB_ADDRESS = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const VTOKEN_TREASURY_ADDRESS = "0x8b293600C50D6fbdc6Ed4251cc75ECe29880276f";
const ACM = "0x45f8a08f534f34a97187626e05d4b6648eeaa9aa";
const VBNBAdmin_IMPLEMENTATION = "0x81d8560bb3686f6578e99f93387CCb9b61F4ddB6";
const VBNBAdmin_ADDRESS = "0x0CbA1b840cAdBec6cAe82a1c66E5F7C2973767fB"

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
