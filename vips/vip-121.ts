import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const vETH = "0xf508fcd89b8bd15579dc79a6827cb4686a3592c8";
const vLINK = "0x650b940a1033b8a1b1873f78730fcfc73ec11f1f";
const vLTC = "0x57a5297f2cb2c0aac9d554660acd6d385ab50c6b";
const vMATIC = "0x5c9476fcd6a4f9a3654139721c949c2233bbbbc8";
const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const vBTC = "0x882c173bc7ff3b7786ca16dfed3dfffb9ee7847b";
const vXRP = "0xb248a295732e0225acd3337607cc01068e3b9c10";

const ETH_BTC_RATE_MODEL = "0xAA69D9B80B5b303F66227932489669538027783F";
const LINK_LTC_MATIC_XRP_RATE_MODEL = "0xda6cdE1F47AE792FA40Aa85C9F6901d5E64a6769";
const BNB_RATE_MODEL = "0x8B5351D0568CEEFa9BfC71C7a11C01179B736d99";

export const vip121 = () => {
  const meta = {
    version: "v2",
    title: "VIP-121 Interest Rate Model Parameter Updates",
    description: `
    Given the significant shifts in crypto markets, Gauntlet’s platform has evaluated all assets on Venus's active markets and has 
    identified opportunities to adjust parameters for certain assets for the benefit of the protocol. Our methodology makes data-informed 
    decisions around setting borrower and supplier interest rates when market conditions require the protocol to reduce risk or when 
    strategic opportunities present themselves to increase protocol revenue without materially impacting risk.`,
    forDescription: "I agree that Venus Protocol should proceed with the Interest Rate Model Parameter Updates",
    againstDescription:
      "I do not think that Venus Protocol should proceed with the Interest Rate Model Parameter Updates",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with the Interest Rate Model Parameter Updates or not",
  };

  return makeProposal(
    [
      {
        target: vETH,
        signature: "_setInterestRateModel(address)",
        params: [ETH_BTC_RATE_MODEL],
      },

      {
        target: vBTC,
        signature: "_setInterestRateModel(address)",
        params: [ETH_BTC_RATE_MODEL],
      },

      {
        target: vLINK,
        signature: "_setInterestRateModel(address)",
        params: [LINK_LTC_MATIC_XRP_RATE_MODEL],
      },

      {
        target: vLTC,
        signature: "_setInterestRateModel(address)",
        params: [LINK_LTC_MATIC_XRP_RATE_MODEL],
      },

      {
        target: vMATIC,
        signature: "_setInterestRateModel(address)",
        params: [LINK_LTC_MATIC_XRP_RATE_MODEL],
      },

      {
        target: vXRP,
        signature: "_setInterestRateModel(address)",
        params: [LINK_LTC_MATIC_XRP_RATE_MODEL],
      },

      {
        target: vBNB,
        signature: "_setInterestRateModel(address)",
        params: [BNB_RATE_MODEL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
