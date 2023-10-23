import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const vETH = "0xf508fcd89b8bd15579dc79a6827cb4686a3592c8";
const vUSDT_Stablecoins = "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B";
const ETH_NEW_IR = "0x16412DBB7B2a4E119eDFCb3b58B08d196eC733BE";
const USDT_NEW_IR = "0x7dc969122450749A8B0777c0e324522d67737988";

export const vip187 = () => {
  const meta = {
    version: "v2",
    title: "VIP-187 Risk Parameters Adjustments (ETH and USDT Stablecoins)",
    description: `#### Description

This VIP will perform the following Risk Parameters actions as per Chaos Labs latest recommendations in this Venus community forum publication: [Risk Parameter Updates 10/16/2023](https://community.venus.io/t/chaos-labs-risk-parameter-updates-10-16-2023/3848). Changes to the IR’s and Kink’s are expected to facilitate new strategies and onboard more TVL.

- **ETH** (Core pool)
    - Interest rate multiplier: from 9% to 4.25%
    - Interest rate Kink: from 75% to 85%
- **USDT** (Stablecoins pool)
    - Interest rate multiplier: from 10% to 5%
    - Interest rate base: from 2% to 0%

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: https://github.com/VenusProtocol/vips/pull/87`,

    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
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
