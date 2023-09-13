import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const HAY_REWARDS_DISTRIBUTOR = "0x2aBEf3602B688493fe698EF11D27DCa43a0CE4BE";
const SD_REWARDS_DISTRIBUTOR = "0x37fA1e5613455223F09e179DFAEBba61d7505C97";
const MARKET_BNBx = "0x644A149853E5507AdF3e682218b8AC86cdD62951";
const MARKET_HAY = "0x170d3b2da05cc2124334240fB34ad1359e34C562";

export const vip169Testnet = () => {
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
        params: [[MARKET_HAY], ["33410731"], ["33410731"]],
      },
      {
        target: SD_REWARDS_DISTRIBUTOR,
        signature: "setLastRewardingBlocks(address[],uint32[],uint32[])",
        params: [[MARKET_BNBx], ["33410731"], ["33410731"]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
