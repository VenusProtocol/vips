import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const BSW_REWARDS_DISTRIBUTOR = "0x7524116CEC937ef17B5998436F16d1306c4F7EF8";
const VBSW_DEFI = "0x8f657dFD3a1354DEB4545765fE6840cc54AFd379";

const commands = [
  {
    target: BSW_REWARDS_DISTRIBUTOR,
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [[VBSW_DEFI], ["11168981481481481"], ["11168981481481481"]],
    value: "0",
  },
  {
    target: BSW_REWARDS_DISTRIBUTOR,
    signature: "setLastRewardingBlocks(address[],uint32[],uint32[])",
    params: [[VBSW_DEFI], ["31692632"], ["31692632"]],
    value: "0",
  },
];

export const vip155 = () => {
  const meta = {
    version: "v2",
    title: "IL Rewards",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with IL Rewards",
    againstDescription: "I do not think that Venus Protocol should proceed with IL Rewards",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with IL Rewards",
  };

  return makeProposal(commands, meta, ProposalType.REGULAR);
};
