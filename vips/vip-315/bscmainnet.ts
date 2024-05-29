import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const vWBNB_IR = "0x6765202c3e6d3FdD05F0b26105d0C8DF59D3efaf";
export const vWBNB_BASE_RATE_PER_YEAR = 0;
export const vWBNB_MULTIPLIER_PER_YEAR = parseUnits("0.09", 18);
export const vWBNB_JUMP_MULTIPLIER_PER_YEAR = parseUnits("3", 18);
export const vWBNB_KINK = parseUnits("0.9", 18);

const vip315 = () => {
  const meta = {
    version: "v2",
    title: "VIP-315 Chaos Labs Recommendation",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: vWBNB_IR,
        signature: "updateJumpRateModel(uint256,uint256,uint256,uint256)",
        params: [vWBNB_BASE_RATE_PER_YEAR, vWBNB_MULTIPLIER_PER_YEAR, vWBNB_JUMP_MULTIPLIER_PER_YEAR, vWBNB_KINK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip315;
