import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const BLOCKS_56_DAYS = 1_440_000;
export const BLOCKS_7_DAYS = 201_600;

export const RewardsDistributor_HAY_LiquidStakedBNB = {
  address: "0xc1Ea6292C49D6B6E952baAC6673dE64701bB88cB",
  vToken: "0xeffE7874C345aE877c1D893cd5160DDD359b24dA", // vSNBNB
  rewardStartBlock: 33709004,
};

export const RewardsDistributor_ANGLE_Stablecoin = {
  address: "0x78d32FC46e5025c29e3BA03Fcf2840323351F26a",
  vToken: "0x4E1D35166776825402d50AfE4286c500027211D1", // vagEUR
  rewardStartBlock: 33764104,
};

const commands = [
  {
    target: RewardsDistributor_HAY_LiquidStakedBNB.address,
    signature: "setLastRewardingBlocks(address[],uint32[],uint32[])",
    params: [
      [RewardsDistributor_HAY_LiquidStakedBNB.vToken],
      [RewardsDistributor_HAY_LiquidStakedBNB.rewardStartBlock + BLOCKS_56_DAYS],
      [RewardsDistributor_HAY_LiquidStakedBNB.rewardStartBlock + BLOCKS_56_DAYS],
    ],
  },
  {
    target: RewardsDistributor_ANGLE_Stablecoin.address,
    signature: "setLastRewardingBlocks(address[],uint32[],uint32[])",
    params: [
      [RewardsDistributor_ANGLE_Stablecoin.vToken],
      [RewardsDistributor_ANGLE_Stablecoin.rewardStartBlock + BLOCKS_7_DAYS],
      [RewardsDistributor_ANGLE_Stablecoin.rewardStartBlock + BLOCKS_7_DAYS],
    ],
  },
];

export const vip179Testnet = () => {
  const meta = {
    version: "v2",
    title: "IL Rewards, last rewarding block for snBNB and agEUR markets",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with setting last rewarding block",
    againstDescription: "I do not think that Venus Protocol should proceed with setting last rewarding block",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with setting last rewarding block",
  };

  return makeProposal(commands, meta, ProposalType.REGULAR);
};
