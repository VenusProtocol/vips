import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const PROTOCOL_SHARE_RESERVE = "0x4eDB103c9Fe0863C62559Ccc3301dd3003A7dec2";
const RISK_FUND_TRANSFORMER = "0x8CC7ecFa3AF1D78dD2ceE2239E2b58aA206f8952";
const RISK_FUND_PROXY_ADMIN = "0x7Ba118F162B7A248ef34A1934148e7e77561Ab27";
const RISK_FUND_PROXY = "0x27481F538C36eb366FAB4752a8dd5a03ed04a3cF";
const RISK_FUNDV2 = "0xdefd29416e0bE78d16B37ee5a286985379673830";

export const vipTransformer = () => {
  const meta = {
    version: "v2",
    title: "VIP-transformer Change target address in protocolShareReserve to RiskFundTransformer",
    description: `
    target address update in protocolShareReserve to RiskFundSwapper
    update the implementation of riskfund V1 to riskfund V2
    update destination address to riskfund in riskfund transformer`,

    forDescription: "I agree that Venus Protocol should proceed with the Risk Parameters Update's",
    againstDescription: "I do not think that Venus Protocol should proceed with the Risk Parameters Update's",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Risk Parameters Update's or not",
  };

  return makeProposal(
    [
      {
        target: PROTOCOL_SHARE_RESERVE,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: PROTOCOL_SHARE_RESERVE,
        signature: "setRiskFundTransformer(address)",
        params: [RISK_FUND_TRANSFORMER],
      },
      {
        target: RISK_FUND_TRANSFORMER,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: RISK_FUND_TRANSFORMER,
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
        signature: "setRiskFundTransformer(address)",
        params: [RISK_FUND_TRANSFORMER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
