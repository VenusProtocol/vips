import { ProposalType } from "../../../src/types";
import { makeProposal } from "../../../src/utils";
import { conversionConfigArrayForAllConverters } from "./commands";

const RISK_FUND_PROXY_ADMIN = "0x7Ba118F162B7A248ef34A1934148e7e77561Ab27";
const RISK_FUND_PROXY = "0x487CeF72dacABD7E12e633bb3B63815a386f7012";
const RISK_FUND_V2_IMPLEMENTATION = "0x6b925876F9e007b7CD0d7EFd100991F3eF4a4276";
const XVS_VAULT_TREASURY = "0x6Bde363aF8Ef4d16B2DB1bFf11516E5E32Cfc8bA";
const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const PROTOCOL_SHARE_RESERVE_PROXY = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
const PROTOCOL_SHARE_RESERVE_ADMIN = "";
const PROTOCOL_SHARE_RESERVE_NEW_IMPLEMENTATION = "";


const RISK_FUND_CONVERTER = "0x62EC4E011983F9b8Ca943BA12DfE2a2b1E1dd865";
const USDT_PRIME_CONVERTER = "0x0F58902b3b2B4Ff55477f3f98b3AA2aeA76de78F";
const USDC_PRIME_CONVERTER = "0x7D8FceD094225688EDcB4eF6D8F5710EF07A1837";
const BTCB_PRIME_CONVERTER = "0xc0f7157E5f0703Ab76F6DeD3B88d72F4Fb0ABC32";
const ETH_PRIME_CONVERTER = "0x55488A4740170b71c058a406913f5C0c0d26Dc53";
const XVS_VAULT_CONVERTER = "0x1Dff591c2A40870f618A0B1f90547DB3b43BEC2a";

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
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_FUND_PROXY],
      },
      {
        target: RISK_FUND_PROXY_ADMIN,
        signature: "upgardeTo(address)",
        params: [RISK_FUND_V2_IMPLEMENTATION],
      },
      {
        target: RISK_FUND_PROXY,
        signature: "setRiskFundConverter(address)",
        params: [RISK_FUND_CONVERTER],
      },
      {
        target: PROTOCOL_SHARE_RESERVE_ADMIN,
        signature: "upgardeTo(address)",
        params: [PROTOCOL_SHARE_RESERVE_NEW_IMPLEMENTATION],
      },
      {
        target: PROTOCOL_SHARE_RESERVE_PROXY,
        signature: "addOrUpdateDistributionConfig()", // schema 0
        params: [],
      },
      {
        target: PROTOCOL_SHARE_RESERVE_PROXY,
        signature: "addOrUpdateDistributionConfig()", // schema 1
        params: [],
      },
      {
        target: XVS_VAULT_TREASURY,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: RISK_FUND_CONVERTER,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: USDT_PRIME_CONVERTER,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: BTCB_PRIME_CONVERTER,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: ETH_PRIME_CONVERTER,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "acceptOwnership()",
        params: [],
      },
      ...conversionConfigArrayForAllConverters,
    ],
    meta,
    ProposalType.REGULAR,
  );
};
