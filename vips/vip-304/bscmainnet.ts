import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const REWARDS_DISTRIBUTOR = "0xC1044437AbfD8592150d612185581c5600851d44";
export const VBABYDOGE = "0x52eD99Cd0a56d60451dD4314058854bc0845bbB5";

// VIP Execution Txn: https://bscscan.com/tx/0xd8c521d72dbead374c68032b2628c6f1b8f7ae78039a5c83bcd635143f1e2588
export const REWARDS_START_BLOCK = 38895533;
export const REWARDS_END_BLOCK_90_DAYS = REWARDS_START_BLOCK + (90 * 24 * 60 * 60) / 3;

export const vip304 = () => {
  const meta = {
    version: "v2",
    title: "VIP-304 Pause BabyDoge Rewards",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with setting last rewarding block",
    againstDescription: "I do not think that Venus Protocol should proceed with setting last rewarding block",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with setting last rewarding block",
  };

  return makeProposal(
    [
      {
        target: REWARDS_DISTRIBUTOR,
        signature: "setLastRewardingBlocks(address[],uint32[],uint32[])",
        params: [[VBABYDOGE], [REWARDS_END_BLOCK_90_DAYS], [REWARDS_END_BLOCK_90_DAYS]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
