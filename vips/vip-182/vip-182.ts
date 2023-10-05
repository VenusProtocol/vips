import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const BLOCKS_56_DAYS = 1_612_800;
export const BLOCKS_7_DAYS = 201_600;

export const RewardsDistributor_HAY_LiquidStakedBNB = {
  address: "0x888E317606b4c590BBAD88653863e8B345702633",
  vToken: "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A", // vSNBNB
  rewardStartBlock: 32228156,
};

export const RewardsDistributor_ANGLE_Stablecoin = {
  address: "0x177ED4625F57cEa2804EA3A396c8Ff78f314F1CA",
  vToken: "0x795DE779Be00Ea46eA97a28BDD38d9ED570BCF0F", // vagEUR
  rewardStartBlock: 32338350,
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

export const vip182 = () => {
  const meta = {
    version: "v2",
    title: "VIP-182 Isolated Lending Pools: Configure Liquidity Mining (SnBNB and agEUR)",
    description: `#### Summary

If passed, this VIP will set the last block with rewards for the SnBNB market in the Liquid Staked BNB pool, and the agEUR market in the Stablecoins pool.

#### Description

This VIP sets the last block with rewards for the SnBNB market in the Liquid Staked BNB pool, and the agEUR market in the Stablecoins pool.

In [vSnBNB_LiquidStakedBNB](https://app.venus.io/#/isolated-pools/pool/0xd933909A4a2b7A4638903028f44D1d38ce27c352/market/0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A), the last block with rewards will be 33840956. That means around 56 days (1,612,800 blocks) after [being enabled](https://app.venus.io/#/governance/proposal/177).

In [vagEUR_Stablecoins](https://app.venus.io/#/isolated-pools/pool/0x94c1495cD4c557f1560Cbd68EAB0d197e6291571/market/0x795DE779Be00Ea46eA97a28BDD38d9ED570BCF0F), the last block with rewards will be 32539950. That means around 7 days (201,600 blocks) after [being enabled](https://app.venus.io/#/governance/proposal/178).

Simulation of the VIP: https://github.com/VenusProtocol/vips/pull/82`,
    forDescription: "Process to configure Liquidity Mining",
    againstDescription: "Defer configuration of Liquidity Mining",
    abstainDescription: "No opinion on the matter",
  };

  return makeProposal(commands, meta, ProposalType.REGULAR);
};
