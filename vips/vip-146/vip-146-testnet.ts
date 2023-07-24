import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const ACCESS_CONTROL_MANAGER = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const REWARD_DISTRIBUTOR = "0x4be90041D1e082EfE3613099aA3b987D9045d718";
const vankrBNB_DeFi = "0xe507B30C41E9e375BCe05197c1e09fc9ee40c0f6";

const REWARDS_START_BLOCK = 31841401;
const REWARDS_END_BLOCK_30_DAYS = REWARDS_START_BLOCK + 864000;

export const vip146Testnet = () => {
  const meta = {
    version: "v2",
    title: "ankrBNB-DeFi, last rewarding block",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with setting last rewarding block",
    againstDescription: "I do not think that Venus Protocol should proceed with setting last rewarding block",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with setting last rewarding block",
  };
  return makeProposal(
    [
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [REWARD_DISTRIBUTOR, "setLastRewardingBlock(address[],uint32[],uint32[])", NORMAL_TIMELOCK],
      },

      {
        target: REWARD_DISTRIBUTOR,
        signature: "setLastRewardingBlocks(address[],uint32[],uint32[])",
        params: [[vankrBNB_DeFi], [REWARDS_END_BLOCK_30_DAYS], [REWARDS_END_BLOCK_30_DAYS]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
