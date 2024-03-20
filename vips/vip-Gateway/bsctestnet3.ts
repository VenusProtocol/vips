import { ZERO_ADDRESS } from "../../src/networkAddresses";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
export const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";

export const vipCallPermission = () => {
  const meta = {
    version: "v2",
    title: "VIP-Gateway Gives call permission to timelock for setLastRewardingBlocks function of RewardsDistributor",
    description: `
    This VIP gives call permission to timelock for setLastRewardingBlocks function of RewardsDistributor
  `,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setLastRewardingBlocks(address[],uint32[],uint32[])", NORMAL_TIMELOCK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vipCallPermission;
