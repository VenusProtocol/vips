import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const ANY_TARGET_CONTRACT = "0x0000000000000000000000000000000000000000";
const ACCESS_CONTROL_MANAGER = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const REWARDS_START_BLOCK = 29964632;
const REWARDS_END_BLOCK_30_DAYS = REWARDS_START_BLOCK + 864000;
const REWARDS_END_BLOCK_28_DAYS = REWARDS_START_BLOCK + 806400;

const rewardsDistributors30Days = {
  RewardsDistributor_BSW_DeFi: {
    address: "0x7524116CEC937ef17B5998436F16d1306c4F7EF8",
    vToken: "0x8f657dFD3a1354DEB4545765fE6840cc54AFd379",
  },
  RewardsDistributor_FLOKI_GameFi: {
    address: "0x501a91b995Bd41177503A1A4144F3D25BFF869e1",
    vToken: "0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb",
  },
  RewardsDistributor_RACA_GameFi: {
    address: "0x2517A3bEe42EA8f628926849B04870260164b555",
    vToken: "0xE5FE5527A5b76C75eedE77FdFA6B80D52444A465",
  },
  RewardsDistributor_BTT_Tron: {
    address: "0x804F3893d3c1C3EFFDf778eDDa7C199129235882",
    vToken: "0x49c26e12959345472E2Fd95E5f79F8381058d3Ee",
  },
  RewardsDistributor_TRX_Tron: {
    address: "0x22af8a65639a351a9D5d77d5a25ea5e1Cf5e9E6b",
    vToken: "0x836beb2cB723C498136e1119248436A645845F4E",
  },
  RewardsDistributor_USDD_Tron: {
    address: "0x08e4AFd80A5849FDBa4bBeea86ed470D697e4C54",
    vToken: "0xf1da185CCe5BeD1BeBbb3007Ef738Ea4224025F7",
  },
  RewardsDistributor_WIN_Tron: {
    address: "0x6536123503DF76BDfF8207e4Fb0C594Bc5eFD00A",
    vToken: "0xb114cfA615c828D88021a41bFc524B800E64a9D5",
  },
  RewardsDistributor_ankrBNB_LiquidStakedBNB: {
    address: "0x63aFCe42086c8302659CA0E21F4Eade27Ad85ded",
    vToken: "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f",
  },
  RewardsDistributor_stkBNB_LiquidStakedBNB: {
    address: "0x79397BAc982718347406Ebb7A6a8845896fdD8dE",
    vToken: "0xcc5D9e502574cda17215E70bC0B4546663785227",
  },
  RewardsDistributor_ST_LiquidStakedBNB: {
    address: "0x6a7b50EccC721f0Fa9FD7879A7dF082cdA60Db78",
    vToken: "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791", // vBNBx
  },
};

const rewardsDistributors28Days = {
  RewardsDistributor_HAY_Stablecoins: {
    address: "0xBA711976CdF8CF3288bF721f758fB764503Eb1f6",
    vToken: "0xCa2D81AA7C09A1a025De797600A7081146dceEd9",
  },
};

const setLastRewardingBlock = (lastRewardingBlock: number) => {
  return ({ address, vToken }: { address: string; vToken: string }) => ({
    target: address,
    signature: "setLastRewardingBlocks(address[],uint32[],uint32[])",
    params: [[vToken], [lastRewardingBlock], [lastRewardingBlock]],
  });
};

const commands = [
  {
    target: ACCESS_CONTROL_MANAGER,
    signature: "giveCallPermission(address,string,address)",
    // "setLastRewardingBlock" (without "s") is how the access control check is coded in the contract
    params: [ANY_TARGET_CONTRACT, "setLastRewardingBlock(address[],uint32[],uint32[])", NORMAL_TIMELOCK],
  },
  ...Object.values(rewardsDistributors30Days).map(setLastRewardingBlock(REWARDS_END_BLOCK_30_DAYS)),
  ...Object.values(rewardsDistributors28Days).map(setLastRewardingBlock(REWARDS_END_BLOCK_28_DAYS)),
];

export const vip145 = () => {
  const meta = {
    version: "v2",
    title: "IL Rewards, last rewarding block",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with setting last rewarding block",
    againstDescription: "I do not think that Venus Protocol should proceed with setting last rewarding block",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with setting last rewarding block",
  };

  return makeProposal(commands, meta, ProposalType.REGULAR);
};
