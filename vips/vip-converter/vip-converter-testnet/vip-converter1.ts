import { ProposalType } from "../../../src/types";
import { makeProposal } from "../../../src/utils";
import { CONVERTER_NETWORK } from "./Addresses";
import { acceptOwnershipCommandsAllConverters, callPermissionCommandsAllConverter } from "./commands";

const XVS_VAULT_TREASURY = "0xab79995b1154433C9652393B7BF3aeb65C2573Bd";

export const vipConverter1 = () => {
  const meta = {
    version: "v2",
    title: "VIP-converter1 accepts the ownership of different contracts and give call permissions to timelock",
    description: `
    Accepts the ownership of the following contracts:
    1. RiskFundConverter
    2. USDTPrimeConverter
    3. USDCPrimeConverter
    4. BTCBPrimeConverter
    5. ETHPrimeConverter
    6. XVSVaultConverter
    7. XVSVaultTreasury
    8. ConverterNetwork

    Gives call permissions to timelock`,

    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      ...acceptOwnershipCommandsAllConverters,
      {
        target: XVS_VAULT_TREASURY,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: CONVERTER_NETWORK,
        signature: "acceptOwnership()",
        params: [],
      },
      ...callPermissionCommandsAllConverter,
    ],
    meta,
    ProposalType.REGULAR,
  );
};
