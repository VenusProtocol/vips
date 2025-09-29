import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const vUSDT_IRM = "0x1a7c9091973CABc491e361A9eaEFD047b48a3647";
export const vUSDC_IRM = "0xF48508A44da9C7D210a668eCe4d31Bc98702602b";

export const vip549 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-549",
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
        params: [vUSDT_IRM],
      },
      {
        target: vUSDC,
        signature: "_setInterestRateModel(address)",
        params: [vUSDC_IRM],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip549;
