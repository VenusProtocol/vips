import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const VETH_LST_IRM = "0x49a06B82b3c907AB140879F73f1d8dE262962c30";
export const vETH_CORE_IRM = "0x3aa125788FC6b9F801772baEa887aA40328015e9";
export const vETH_CORE = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
export const vETH_LST = "0xeCCACF760FEA7943C5b0285BD09F601505A29c05";

const vip392 = () => {
  const meta = {
    version: "v2",
    title: "VIP-392",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: vETH_CORE,
        signature: "_setInterestRateModel(address)",
        params: [vETH_CORE_IRM],
      },
      {
        target: vETH_LST,
        signature: "setInterestRateModel(address)",
        params: [VETH_LST_IRM],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip392;
