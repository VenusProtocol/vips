import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const VPLANET_DEFI = "0xFf1112ba7f88a53D4D23ED4e14A117A2aE17C6be";
const REWARD_DISTRIBUTOR = "0xD86FCff6CCF5C4E277E49e1dC01Ed4bcAb8260ba";

const REWARDS_START_BLOCK = 33343823;
const REWARDS_END_BLOCK_30_DAYS = REWARDS_START_BLOCK + 806400;

export const vip201 = () => {
  const meta = {
    version: "v2",
    title: "PLANET-DeFi, last rewarding block",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with setting last rewarding block",
    againstDescription: "I do not think that Venus Protocol should proceed with setting last rewarding block",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with setting last rewarding block",
  };

  return makeProposal(
    [
      {
        target: REWARD_DISTRIBUTOR,
        signature: "setLastRewardingBlocks(address[],uint32[],uint32[])",
        params: [[VPLANET_DEFI], [REWARDS_END_BLOCK_30_DAYS], [REWARDS_END_BLOCK_30_DAYS]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
