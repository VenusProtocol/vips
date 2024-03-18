import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
export const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";

const REWARD_DISTRIBUTORS_STABLECOIN = [
  "0xb0269d68CfdCc30Cb7Cd2E0b52b08Fa7Ffd3079b",
  "0x2aBEf3602B688493fe698EF11D27DCa43a0CE4BE",
  "0x78d32FC46e5025c29e3BA03Fcf2840323351F26a",
];

const REWARD_DISTRIBUTORS_DEFI = [
  "0x2b67Cfaf28a1aBbBf71fb814Ad384d0C5a98e0F9",
  "0x4be90041D1e082EfE3613099aA3b987D9045d718",
  "0x9372F0d88988B2cC0a2bf8700a5B3f04B0b81b8C",
];

const REWARD_DISTRIBUTORS_GAMEFI = [
  "0x5651866bcC4650d6fe5178E5ED7a8Be2cf3F70D0",
  "0x66E213a4b8ba1c8D62cAa4649C7177E29321E262",
];

const REWARD_DISTRIBUTORS_LST = [
  "0x7df11563c6b6b8027aE619FD9644A647dED5893B",
  "0x72c770A1E73Ad9ccD5249fC5536346f95345Fe2c",
  "0x8Ad2Ad29e4e2C0606644Be51c853A7A4a3078F85",
  "0x37fA1e5613455223F09e179DFAEBba61d7505C97",
  "0xc1Ea6292C49D6B6E952baAC6673dE64701bB88cB",
];

const REWARD_DISTRIBUTORS_TRON = [
  "0x095902273F06eEAC825c3F52dEF44f67a86B31cD",
  "0x9A73Ba89f6a95611B46b68241aBEcAF2cD0bd78A",
  "0x507401883C2a874D919e78a73dD0cB56f2e7eaD7",
  "0x1c50672f4752cc0Ae532D9b93b936C21121Ff08b",
];

const ALL_REWARD_DISTRIBUTORS = [
  ...REWARD_DISTRIBUTORS_DEFI,
  ...REWARD_DISTRIBUTORS_GAMEFI,
  ...REWARD_DISTRIBUTORS_LST,
  ...REWARD_DISTRIBUTORS_STABLECOIN,
  ...REWARD_DISTRIBUTORS_TRON,
];

export const vipCallPermission = () => {
  const meta = {
    version: "v2",
    title: "VIP-Gateway Gives call permission to timelock for setLastRewardingBlocks function of RewardsDistributor",
    description: `
    This VIP gives call permission to timelock for setLastRewardingBlocks function of RewardsDistributor
  `,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      ...ALL_REWARD_DISTRIBUTORS.map((rewardDistributor: string) => ({
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [rewardDistributor, "setLastRewardingBlocks(address[],uint32[],uint32[])", NORMAL_TIMELOCK],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vipCallPermission;
