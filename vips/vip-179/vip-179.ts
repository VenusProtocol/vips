import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const BLOCKS_56_DAYS = 1_440_000;
export const BLOCKS_7_DAYS = 201_600;

export const RewardsDistributor_HAY_LiquidStakedBNB = {
  address: "0x888E317606b4c590BBAD88653863e8B345702633",
  vToken: "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A", // vSNBNB
  rewardStartBlock: 32228156,
};

export const RewardsDistributor_ANGLE_Stablecoin = {
  address: "0x177ED4625F57cEa2804EA3A396c8Ff78f314F1CA",
  vToken: "0x795DE779Be00Ea46eA97a28BDD38d9ED570BCF0F", // vagEUR
  rewardStartBlock: 32290292, // TODO: when VIP is executed on mainnet adjust the rewardStartBlock
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

export const vip179 = () => {
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
