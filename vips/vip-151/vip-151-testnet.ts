import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const REWARD_DISTRIBUTOR = "0x4be90041D1e082EfE3613099aA3b987D9045d718";
const vankrBNB_DeFi = "0xe507B30C41E9e375BCe05197c1e09fc9ee40c0f6";

const REWARDS_START_BLOCK = 31839459;
const REWARDS_END_BLOCK_30_DAYS = REWARDS_START_BLOCK + 864000;

export const vip151Testnet = () => {
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
        target: REWARD_DISTRIBUTOR,
        signature: "setLastRewardingBlocks(address[],uint32[],uint32[])",
        params: [[vankrBNB_DeFi], [REWARDS_END_BLOCK_30_DAYS], [REWARDS_END_BLOCK_30_DAYS]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
