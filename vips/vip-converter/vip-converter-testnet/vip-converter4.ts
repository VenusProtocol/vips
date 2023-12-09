import { ProposalType } from "../../../src/types";
import { makeProposal } from "../../../src/utils";
import { conversionConfigCommandsETHPrimeConverter, conversionConfigCommandsXVSVaultConverter } from "./commands";

export const vipConverter4 = () => {
  const meta = {
    version: "v2",
    title: "VIP-converter2 Sets ConversionConfigs in ETHPrimeConverter and XVSVaultConverter",
    description: `
    This Vip sets the different conversion config for conversion in ETHPrimeConverter and XVSVaultConverter
    `,

    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [...conversionConfigCommandsETHPrimeConverter, ...conversionConfigCommandsXVSVaultConverter],
    meta,
    ProposalType.REGULAR,
  );
};
