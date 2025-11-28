import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const IRM = "0x1AAADE04A970043756D90e11af57e03A3A10E2c4";

export const vip574 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-574 [BNB Chain] BNB and WBNB market parameters update",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: vUSDT,
        signature: "_setInterestRateModel(address)",
        params: [IRM],
      },
      {
        target: vUSDC,
        signature: "_setInterestRateModel(address)",
        params: [IRM],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip574;
