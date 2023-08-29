import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const COMPTROLLER_BEACON = "0x38B4Efab9ea1bAcD19dC81f19c4D1C2F9DeAe1B2";
const COMPTROLLER_NEW_IMPLEMENTATION = "0x17a6ac4f7f01387303deB1D78f01aC0A0C1a75b0";
const HAY_REWARDS_DISTRIBUTOR = "0xA31185D804BF9209347698128984a43A67Ce6d11";
const SD_REWARDS_DISTRIBUTOR = "0xBE607b239a8776B47159e2b0E9E65a7F1DAA6478";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const STABLE_COINS_POOL = "0x94c1495cD4c557f1560Cbd68EAB0d197e6291571";
const LIQUID_STAKED_BNB_POOL = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
const HAY_TOKEN = "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5";
const SD_TOKEN = "0x3BC5AC0dFdC871B365d159f728dd1B9A0B5481E8";
const HAY_AMOUNT = "2000000000000000000000";
const SD_AMOUNT = "2000000000000000000000";
const MARKET_BNBx = "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791";
const MARKET_HAY = "0xCa2D81AA7C09A1a025De797600A7081146dceEd9";

export const vip162 = () => {
  const meta = {
    version: "v2",
    title: "VIP-162 HAY and SD Rewards",
    description: `Uppgrade comptroller to support rewards distribution for duplicate reward tokens`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER_BEACON,
        signature: "upgradeTo(address)",
        params: [COMPTROLLER_NEW_IMPLEMENTATION],
      },
      {
        target: HAY_REWARDS_DISTRIBUTOR,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: SD_REWARDS_DISTRIBUTOR,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [HAY_TOKEN, HAY_AMOUNT, HAY_REWARDS_DISTRIBUTOR],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [SD_TOKEN, SD_AMOUNT, SD_REWARDS_DISTRIBUTOR],
      },
      {
        target: STABLE_COINS_POOL,
        signature: "addRewardsDistributor(address)",
        params: [HAY_REWARDS_DISTRIBUTOR],
      },
      {
        target: LIQUID_STAKED_BNB_POOL,
        signature: "addRewardsDistributor(address)",
        params: [SD_REWARDS_DISTRIBUTOR],
      },
      {
        target: HAY_REWARDS_DISTRIBUTOR,
        signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
        params: [[MARKET_HAY], ["1240079365079365"], ["1240079365079365"]],
      },
      {
        target: SD_REWARDS_DISTRIBUTOR,
        signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
        params: [[MARKET_BNBx], ["2314814814814814"], ["0"]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
