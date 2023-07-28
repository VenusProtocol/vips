import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const ACCESS_CONTROL_MANAGER = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const REWARD_DISTRIBUTOR = "0x14d9A428D0f35f81A30ca8D8b2F3974D3CccB98B";
const vankrBNB_DeFi = "0x53728FD51060a85ac41974C6C3Eb1DaE42776723";

const REWARDS_START_BLOCK = 30336476;
const REWARDS_END_BLOCK_30_DAYS = REWARDS_START_BLOCK + 864000;

export const vip146 = () => {
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
