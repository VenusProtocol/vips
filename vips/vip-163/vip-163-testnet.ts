import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const COMPTROLLER_BEACON = "0xdDDD7725C073105fB2AbfCbdeC16708fC4c24B74";
const COMPTROLLER_NEW_IMPLEMENTATION = "0x069705246364d60c5503bF19b4A714ab412521a0";
const HAY_REWARDS_DISTRIBUTOR = "0x2aBEf3602B688493fe698EF11D27DCa43a0CE4BE";
const SD_REWARDS_DISTRIBUTOR = "0x37fA1e5613455223F09e179DFAEBba61d7505C97";
const TREASURY = "0x8b293600c50d6fbdc6ed4251cc75ece29880276f";
const STABLE_COINS_POOL = "0x10b57706AD2345e590c2eA4DC02faef0d9f5b08B";
const LIQUID_STAKED_BNB_POOL = "0x596B11acAACF03217287939f88d63b51d3771704";
const HAY_TOKEN = "0xe73774DfCD551BF75650772dC2cC56a2B6323453";
const SD_TOKEN = "0xac7D6B77EBD1DB8C5a9f0896e5eB5d485CB677b3";
const HAY_AMOUNT = "2000000000000000000000";
const SD_AMOUNT = "2000000000000000000000";
const MARKET_BNBx = "0x644A149853E5507AdF3e682218b8AC86cdD62951";
const MARKET_HAY = "0x170d3b2da05cc2124334240fB34ad1359e34C562";

export const vip163Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-163 HAY and SD Rewards",
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
        params: [[MARKET_BNBx], ["1157407407407407"], ["1157407407407407"]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
