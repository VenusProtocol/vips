import { ProposalType } from "../../../src/types";
import { makeProposal } from "../../../src/utils";
import { conversionConfigCommandsBTCBPrimeConverter, conversionConfigCommandsUSDCPrimeConverter } from "./commands";

export const vipConverter3 = () => {
  const meta = {
    version: "v2",
    title: "VIP-converter2 Sets ConversionConfigs in USDCPrimeConverter and BTCBPrimeConverter",
    description: `
    This Vip sets the different conversion config for conversion in USDCPrimeConverter and BTCBPrimeConverter
    `,

    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [...conversionConfigCommandsUSDCPrimeConverter, ...conversionConfigCommandsBTCBPrimeConverter],
    meta,
    ProposalType.REGULAR,
  );
};
