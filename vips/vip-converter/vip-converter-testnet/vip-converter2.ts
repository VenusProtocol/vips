import { ProposalType } from "../../../src/types";
import { makeProposal } from "../../../src/utils";
import { conversionConfigCommandsRiskFundConverter, conversionConfigCommandsUSDTPrimeConverter } from "./commands";

export const vipConverter2 = () => {
  const meta = {
    version: "v2",
    title: "VIP-converter2 Sets ConversionConfigs in RiskFundConverter and USDTPrimeConverter",
    description: `
    This Vip sets the different conversion config for conversion in RiskFundConverter and USDTPrimeConverter
    `,

    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [...conversionConfigCommandsRiskFundConverter, ...conversionConfigCommandsUSDTPrimeConverter],
    meta,
    ProposalType.REGULAR,
  );
};
