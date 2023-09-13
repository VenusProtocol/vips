import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const HAY_REWARDS_DISTRIBUTOR = "0xA31185D804BF9209347698128984a43A67Ce6d11";
const SD_REWARDS_DISTRIBUTOR = "0xBE607b239a8776B47159e2b0E9E65a7F1DAA6478";
const MARKET_BNBx = "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791";
const MARKET_HAY = "0xCa2D81AA7C09A1a025De797600A7081146dceEd9";

export const vip169 = () => {
  const meta = {
    version: "v2",
    title: "VIP-163 Stop HAY and SD Rewards",
    description: `Stop HAY and SD rewards`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: HAY_REWARDS_DISTRIBUTOR,
        signature: "setLastRewardingBlocks(address[],uint32[],uint32[])",
        params: [[MARKET_HAY], ["32713205"], ["32713205"]],
      },
      {
        target: SD_REWARDS_DISTRIBUTOR,
        signature: "setLastRewardingBlocks(address[],uint32[],uint32[])",
        params: [[MARKET_BNBx], ["32713205"], ["32713205"]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
