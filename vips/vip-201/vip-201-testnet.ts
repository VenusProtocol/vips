import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const VPLANET_DEFI = "0xe237aA131E7B004aC88CB808Fa56AF3dc4C408f1";
const REWARD_DISTRIBUTOR = "0x9372F0d88988B2cC0a2bf8700a5B3f04B0b81b8C";

const REWARDS_START_BLOCK = 34772656;
const REWARDS_END_BLOCK_30_DAYS = REWARDS_START_BLOCK + 806400;

export const vip201Testnet = () => {
  const meta = {
    version: "v2",
    title: "PLANET_DeFi, last rewarding block",
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
