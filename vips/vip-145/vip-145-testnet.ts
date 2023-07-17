import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const ANY_TARGET_CONTRACT = "0x0000000000000000000000000000000000000000";
const ACCESS_CONTROL_MANAGER = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";

const REWARDS_START_BLOCK = 31465785;
const REWARDS_END_BLOCK_30_DAYS = REWARDS_START_BLOCK + 864000;
const REWARDS_END_BLOCK_28_DAYS = REWARDS_START_BLOCK + 806400;

const rewardsDistributors30Days = {
  RewardsDistributor_BSW_DeFi: {
    address: "0x2b67Cfaf28a1aBbBf71fb814Ad384d0C5a98e0F9",
    vToken: "0x5e68913fbbfb91af30366ab1B21324410b49a308",
  },
  RewardsDistributor_FLOKI_GameFi: {
    address: "0x5651866bcC4650d6fe5178E5ED7a8Be2cf3F70D0",
    vToken: "0xef470AbC365F88e4582D8027172a392C473A5B53",
  },
  RewardsDistributor_RACA_GameFi: {
    address: "0x66E213a4b8ba1c8D62cAa4649C7177E29321E262",
    vToken: "0x1958035231E125830bA5d17D168cEa07Bb42184a",
  },
  RewardsDistributor_BTT_Tron: {
    address: "0x095902273F06eEAC825c3F52dEF44f67a86B31cD",
    vToken: "0x47793540757c6E6D84155B33cd8D9535CFdb9334",
  },
  RewardsDistributor_TRX_Tron: {
    address: "0x507401883C2a874D919e78a73dD0cB56f2e7eaD7",
    vToken: "0x410286c43a525E1DCC7468a9B091C111C8324cd1",
  },
  RewardsDistributor_USDD_Tron: {
    address: "0x1c50672f4752cc0Ae532D9b93b936C21121Ff08b",
    vToken: "0xD804F74fe21290d213c46610ab171f7c2EeEBDE7",
  },
  RewardsDistributor_WIN_Tron: {
    address: "0x9A73Ba89f6a95611B46b68241aBEcAF2cD0bd78A",
    vToken: "0xEe543D5de2Dbb5b07675Fc72831A2f1812428393",
  },
  RewardsDistributor_ankrBNB_LiquidStakedBNB: {
    address: "0x7df11563c6b6b8027aE619FD9644A647dED5893B",
    vToken: "0x57a664Dd7f1dE19545fEE9c86C949e3BF43d6D47",
  },
  RewardsDistributor_stkBNB_LiquidStakedBNB: {
    address: "0x72c770A1E73Ad9ccD5249fC5536346f95345Fe2c",
    vToken: "0x75aa42c832a8911B77219DbeBABBB40040d16987",
  },
  RewardsDistributor_SD_LiquidStakedBNB: {
    address: "0x8Ad2Ad29e4e2C0606644Be51c853A7A4a3078F85",
    vToken: "0x644A149853E5507AdF3e682218b8AC86cdD62951", // vBNBx
  },
};

const rewardsDistributors28Days = {
  RewardsDistributor_HAY_Stablecoins: {
    address: "0xb0269d68CfdCc30Cb7Cd2E0b52b08Fa7Ffd3079b",
    vToken: "0x170d3b2da05cc2124334240fB34ad1359e34C562",
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
  ...Object.values(rewardsDistributors30Days).flatMap(setLastRewardingBlock(REWARDS_END_BLOCK_30_DAYS)),
  ...Object.values(rewardsDistributors28Days).flatMap(setLastRewardingBlock(REWARDS_END_BLOCK_28_DAYS)),
];

export const vip145Testnet = () => {
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
