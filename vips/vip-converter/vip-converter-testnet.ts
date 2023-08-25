import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const RISK_FUND_CONVERTER = "0x93520Fa75b569eB67232Bd43d3655E85E75F6C2A";
const RISK_FUND_PROXY_ADMIN = "0x7Ba118F162B7A248ef34A1934148e7e77561Ab27";
const RISK_FUND_PROXY = "0x27481F538C36eb366FAB4752a8dd5a03ed04a3cF";
const RISK_FUNDV2 = "0x9Ea638B93b9cb591fbB28EA66085591B3B511bf1";

export const vipConverter = () => {
  const meta = {
    version: "v2",
    title: "VIP-converter Change target address in protocolShareReserve to RiskFundConverter",
    description: `
    target address update in protocolShareReserve to RiskFundSwapper
    update the implementation of riskfund V1 to riskfund V2
    update destination address to riskfund in riskfund converter`,

    forDescription: "I agree that Venus Protocol should proceed with the Risk Parameters Update's",
    againstDescription: "I do not think that Venus Protocol should proceed with the Risk Parameters Update's",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Risk Parameters Update's or not",
  };

  return makeProposal(
    [
      {
        target: RISK_FUND_CONVERTER,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: RISK_FUND_CONVERTER,
        signature: "setDestination(address)",
        params: [RISK_FUND_PROXY],
      },
      {
        target: RISK_FUND_PROXY,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: RISK_FUND_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RISK_FUND_PROXY, RISK_FUNDV2],
      },
      {
        target: RISK_FUND_PROXY,
        signature: "setRiskFundConverter(address)",
        params: [RISK_FUND_CONVERTER],
      },
      {
        target: RISK_FUND_PROXY,
        signature: "setRiskFundConverter(address)",
        params: [RISK_FUND_CONVERTER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
