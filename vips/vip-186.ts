import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const vETH = "0xf508fcd89b8bd15579dc79a6827cb4686a3592c8";
const vUSDT_Stablecoins = "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B";
const ETH_NEW_IR = "0x16412DBB7B2a4E119eDFCb3b58B08d196eC733BE";
const USDT_NEW_IR = "0x7dc969122450749A8B0777c0e324522d67737988";

export const vip186 = () => {
  const meta = {
    version: "v2",
    title: "VIP-186 Risk Parameters Update",
    description: ``,

    forDescription: "I agree that Venus Protocol should proceed with the Risk Parameters Update's",
    againstDescription: "I do not think that Venus Protocol should proceed with the Risk Parameters Update's",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Risk Parameters Update's or not",
  };

  return makeProposal(
    [
      {
        target: vETH,
        signature: "_setInterestRateModel(address)",
        params: [ETH_NEW_IR],
      },

      {
        target: vUSDT_Stablecoins,
        signature: "setInterestRateModel(address)",
        params: [USDT_NEW_IR],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
