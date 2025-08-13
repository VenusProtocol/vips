import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { grantPremissions } from "./bscmainnet";
import { TREASURY_CONVERTER } from "./configuration";

export const SINGLE_TOKEN_CONVERTER_BEACON_BSC = "0xD2410D8B581D37c5B474CD9Ee0C15F02138AC028";
export const NEW_SINGLE_TOKEN_CONVERTER_IMP_BSC = "0x8279D424e85eeb431d72dDA5B971F40871ec8965";
export const SINGLE_TOKEN_CONVERTER_BEACON_ETHEREUM = "0xb86e532a5333d413A1c35d86cCdF1484B40219eF";
export const NEW_SINGLE_TOKEN_CONVERTER_IMP_ETHEREUM = "0x04444eAc8811140A3B22814a2203F6908d0708ad";
export const SINGLE_TOKEN_CONVERTER_BEACON_ARBITRUM = "0xC77D0F75f1e4e3720DA1D2F5D809F439125a2Fd4";
export const NEW_SINGLE_TOKEN_CONVERTER_IMP_ARBITRUM = "0xcf78eB1806660F0D001F786C66f294DADb9F95b0";

const { bsctestnet } = NETWORK_ADDRESSES;

export const ACM_COMMANDS_GRANT_PERMISSION_ID_BSCTESTNET = 1;

export const vip536 = () => {
  const meta = {
    version: "v2",
    title: "VIP-3328 upgrades the implementation of token converters",
    description: `
        This VIP upgrades the implementation of SingleTokenConverter on bsc, ethereum and arbitrum.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Upgrade SingleTokenConverter implementation
      {
        target: SINGLE_TOKEN_CONVERTER_BEACON_BSC,
        signature: "upgradeTo(address)",
        params: [NEW_SINGLE_TOKEN_CONVERTER_IMP_BSC],
      },
      // Treasury Converter configurations BSC Testnet
      {
        target: TREASURY_CONVERTER.bsctestnet.converter,
        signature: "acceptOwnership()",
        params: [],
      },
      ...grantPremissions(ACM_COMMANDS_GRANT_PERMISSION_ID_BSCTESTNET, bsctestnet),
      {
        target: TREASURY_CONVERTER.bsctestnet.converter,
        signature: "setConverterNetwork(address)",
        params: [TREASURY_CONVERTER.bsctestnet.converterNetwork],
      },
      {
        target: TREASURY_CONVERTER.bsctestnet.converter,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          TREASURY_CONVERTER.bsctestnet.tokenIn,
          TREASURY_CONVERTER.bsctestnet.tokensOut,
          TREASURY_CONVERTER.bsctestnet.conversionIncentive,
        ],
      },
      {
        target: TREASURY_CONVERTER.bsctestnet.converter,
        signature: "setAssetsDirectTransfer(address[],bool[])",
        params: [
          TREASURY_CONVERTER.bsctestnet.whitelistedTokens,
          new Array(TREASURY_CONVERTER.bsctestnet.whitelistedTokens.length).fill(true),
        ],
      },
      {
        target: TREASURY_CONVERTER.bsctestnet.psr,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [TREASURY_CONVERTER.bsctestnet.psrAddOrUpdateDistributionConfigsParams],
      },
      {
        target: TREASURY_CONVERTER.bsctestnet.psr,
        signature: "removeDistributionConfig(uint8,address)",
        params: [0, bsctestnet.VTREASURY],
      },
      {
        target: TREASURY_CONVERTER.bsctestnet.psr,
        signature: "removeDistributionConfig(uint8,address)",
        params: [1, bsctestnet.VTREASURY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip536;
