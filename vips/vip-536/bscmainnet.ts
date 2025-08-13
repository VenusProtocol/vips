import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { TREASURY_CONVERTER } from "./configuration";

export const SINGLE_TOKEN_CONVERTER_BEACON_BSC = "0x4c9D57b05B245c40235D720A5f3A592f3DfF11ca";
export const NEW_SINGLE_TOKEN_CONVERTER_IMP_BSC = "0x7D90b5Bc23e6E6E59744F7DEbD12b1844A22bAEb"; // TODO: Change after deployment
export const SINGLE_TOKEN_CONVERTER_BEACON_ETHEREUM = "0x5C0b5D09388F2BA6441E74D40666C4d96e4527D1";
export const NEW_SINGLE_TOKEN_CONVERTER_IMP_ETHEREUM = "0x560E50dc157E7140C0E5bdF46e586c658C8A066c"; // TODO: Change after deployment
export const SINGLE_TOKEN_CONVERTER_BEACON_ARBITRUM = "0x993900Ab4ef4092e5B76d4781D09A2732086F0F0";
export const NEW_SINGLE_TOKEN_CONVERTER_IMP_ARBITRUM = "0x2EE413F4e060451CB25AeD5Cdd348F430aa79105"; // TODO: Change after deployment

export const PSR_BSC = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const PSR_ETHEREUM = "0x8c8c8530464f7D95552A11eC31Adbd4dC4AC4d3E";
export const PSR_ARBITRUM = "0xF9263eaF7eB50815194f26aCcAB6765820B13D41";

export const ACM_COMMANDS_GRANT_PERMISSION_ID_BSC = 1; // TODO: Change after tx to grant permissions
export const ACM_COMMANDS_GRANT_PERMISSION_ID_ETHEREUM = 2; // TODO: Change after tx to grant permissions
export const ACM_COMMANDS_GRANT_PERMISSION_ID_ARBITRUM = 3; // TODO: Change after tx to grant permissions

const { bscmainnet, ethereum, arbitrumone } = NETWORK_ADDRESSES;

export function grantPremissions(
  grantPermissionId: number,
  network: {
    ACM_AGGREGATOR: string;
  },
  dstChainId?: LzChainId,
) {
  return [
    {
      target: network.ACM_AGGREGATOR,
      signature: "executeGrantPermissions(uint256)",
      params: [grantPermissionId],
      dstChainId,
    },
  ];
}

export const vip536 = () => {
  const meta = {
    version: "v2",
    title: "VIP-3328 upgrades the implementation of token converters",
    description: `
        This VIP upgrades the implementation of SingleTokenConverter for bsc, ethereum and arbitrum.`,
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
      {
        target: SINGLE_TOKEN_CONVERTER_BEACON_ETHEREUM,
        signature: "upgradeTo(address)",
        params: [NEW_SINGLE_TOKEN_CONVERTER_IMP_ETHEREUM],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: SINGLE_TOKEN_CONVERTER_BEACON_ARBITRUM,
        signature: "upgradeTo(address)",
        params: [NEW_SINGLE_TOKEN_CONVERTER_IMP_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      // Treasury Converter configurations BSCMainnet
      {
        target: TREASURY_CONVERTER.bscmainnet.converter,
        signature: "acceptOwnership()",
        params: [],
      },
      ...grantPremissions(ACM_COMMANDS_GRANT_PERMISSION_ID_BSC, bscmainnet),
      {
        target: TREASURY_CONVERTER.bscmainnet.converter,
        signature: "setConverterNetwork(address)",
        params: [TREASURY_CONVERTER.bscmainnet.converterNetwork],
      },
      {
        target: TREASURY_CONVERTER.bscmainnet.converter,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          TREASURY_CONVERTER.bscmainnet.tokenIn,
          TREASURY_CONVERTER.bscmainnet.whitelistedTokens,
          TREASURY_CONVERTER.bscmainnet.conversionIncentive,
        ],
      },
      // Treasury Converter configurations Ethereum
      {
        target: TREASURY_CONVERTER.ethereum.converter,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      ...grantPremissions(ACM_COMMANDS_GRANT_PERMISSION_ID_ETHEREUM, ethereum, LzChainId.ethereum),
      {
        target: TREASURY_CONVERTER.ethereum.converter,
        signature: "setConverterNetwork(address)",
        params: [TREASURY_CONVERTER.ethereum.converterNetwork],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: TREASURY_CONVERTER.ethereum.converter,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          TREASURY_CONVERTER.ethereum.tokenIn,
          TREASURY_CONVERTER.ethereum.whitelistedTokens,
          TREASURY_CONVERTER.ethereum.conversionIncentive,
        ],
        dstChainId: LzChainId.ethereum,
      },
      // Treasury Converter configurations Arbitrum
      {
        target: TREASURY_CONVERTER.arbitrumone.converter,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      ...grantPremissions(ACM_COMMANDS_GRANT_PERMISSION_ID_ARBITRUM, arbitrumone, LzChainId.arbitrumone),
      {
        target: TREASURY_CONVERTER.arbitrumone.converter,
        signature: "setConverterNetwork(address)",
        params: [TREASURY_CONVERTER.arbitrumone.converterNetwork],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: TREASURY_CONVERTER.arbitrumone.converter,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          TREASURY_CONVERTER.arbitrumone.tokenIn,
          TREASURY_CONVERTER.arbitrumone.whitelistedTokens,
          TREASURY_CONVERTER.arbitrumone.conversionIncentive,
        ],
        dstChainId: LzChainId.arbitrumone,
      },
      // Update PSR distribution configs BSCMainnet
      {
        target: TREASURY_CONVERTER.bscmainnet.psr,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [TREASURY_CONVERTER.bscmainnet.psrAddOrUpdateDistributionConfigsParams],
      },
      {
        target: TREASURY_CONVERTER.bscmainnet.psr,
        signature: "removeDistributionConfig(uint8,address)",
        params: [0, bscmainnet.VTREASURY],
      },
      {
        target: TREASURY_CONVERTER.bscmainnet.psr,
        signature: "removeDistributionConfig(uint8,address)",
        params: [1, bscmainnet.VTREASURY],
      },
      // Update PSR distribution configs Ethereum
      {
        target: TREASURY_CONVERTER.ethereum.psr,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [TREASURY_CONVERTER.ethereum.psrAddOrUpdateDistributionConfigsParams],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: TREASURY_CONVERTER.ethereum.psr,
        signature: "removeDistributionConfig(uint8,address)",
        params: [0, ethereum.VTREASURY],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: TREASURY_CONVERTER.ethereum.psr,
        signature: "removeDistributionConfig(uint8,address)",
        params: [1, ethereum.VTREASURY],
        dstChainId: LzChainId.ethereum,
      },
      // // Update PSR distribution configs Arbitrum
      {
        target: TREASURY_CONVERTER.arbitrumone.psr,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [TREASURY_CONVERTER.arbitrumone.psrAddOrUpdateDistributionConfigsParams],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: TREASURY_CONVERTER.arbitrumone.psr,
        signature: "removeDistributionConfig(uint8,address)",
        params: [0, ethereum.VTREASURY],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: TREASURY_CONVERTER.arbitrumone.psr,
        signature: "removeDistributionConfig(uint8,address)",
        params: [1, ethereum.VTREASURY],
        dstChainId: LzChainId.arbitrumone,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip536;
