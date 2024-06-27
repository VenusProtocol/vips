import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const FEE_OUT = 10; // 10bps
export const PSM_USDT = "0xC138aa4E424D1A8539e8F38Af5a754a2B7c3Cc36";

export const vip159 = () => {
  const meta = {
    version: "v2",
    title: "VIP-159 PSM risk parameters",
    description: `
    Fee out: 10bps
      `,
    forDescription: "I agree that Venus Protocol should proceed with the Risk Parameters Update's",
    againstDescription: "I do not think that Venus Protocol should proceed with the Risk Parameters Update's",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Risk Parameters Update's or not",
  };

  return makeProposal(
    [
      {
        target: PSM_USDT,
        signature: "setFeeOut(uint256)",
        params: [FEE_OUT],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};
