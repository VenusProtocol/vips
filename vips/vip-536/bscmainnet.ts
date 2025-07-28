import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const SINGLE_TOKEN_CONVERTER_BEACON_BSC = "0x4c9D57b05B245c40235D720A5f3A592f3DfF11ca";
export const NEW_SINGLE_TOKEN_CONVERTER_IMP_BSC = "0xF96363e03D175eEcc6A965f117e1497EAe878d29";
export const SINGLE_TOKEN_CONVERTER_BEACON_ETHEREUM = "0x5C0b5D09388F2BA6441E74D40666C4d96e4527D1";
export const NEW_SINGLE_TOKEN_CONVERTER_IMP_ETHEREUM = "0x560E50dc157E7140C0E5bdF46e586c658C8A066c";
export const SINGLE_TOKEN_CONVERTER_BEACON_ARBITRUM = "0x993900Ab4ef4092e5B76d4781D09A2732086F0F0";
export const NEW_SINGLE_TOKEN_CONVERTER_IMP_ARBITRUM = "0x2EE413F4e060451CB25AeD5Cdd348F430aa79105";

export const TREASURY_CONVERTER_BSC = "0x3d459f128cf6b938d6B7E626115F149F1567546f";
export const TREASURY_CONVERTER_ETHEREUM = "0x47faB3596F221078f6e3A90B74504d5b9f9FaEC3";
export const TREASURY_CONVERTER_ARBITRUM = "0x557684a9B7743B8D24Dbb1C0B88D659D56035f38";

export const BSC_CONVERSION_INCENTIVE = 1e14;
export const ARBITRUM_CONVERSION_INCENTIVE = 1e14;
export const ETHEREUM_CONVERSION_INCENTIVE = 1e13;

const { bscmainnet, ethereum, arbitrumone } = NETWORK_ADDRESSES;

export enum ConversionAccessibility {
  NONE = 0,
  ALL = 1,
  ONLY_FOR_CONVERTERS = 2,
  ONLY_FOR_USERS = 3,
}

export const TREASURY_CONVERTER = {
  bscmainnet: {
    converter: TREASURY_CONVERTER_BSC,
    tokenIn: "0x55d398326f99059fF775485246999027B3197955", // USDT
    tokenOuts: [
      "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", // ETH
      "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", // BTCB
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // BNB
      "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC
    ],
    conversionIncentive: new Array(4).fill([BSC_CONVERSION_INCENTIVE, ConversionAccessibility.ALL]),
    converterNetwork: "0xF7Caad5CeB0209165f2dFE71c92aDe14d0F15995",
  },
  ethereum: {
    converter: TREASURY_CONVERTER_ETHEREUM,
    tokenIn: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    tokenOuts: [
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
      "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    ],
    conversionIncentive: new Array(3).fill([ETHEREUM_CONVERSION_INCENTIVE, ConversionAccessibility.ALL]),
    converterNetwork: "0x232CC47AECCC55C2CAcE4372f5B268b27ef7cac8",
  },
  arbitrumone: {
    converter: TREASURY_CONVERTER_ARBITRUM,
    tokenIn: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT
    tokenOuts: [
      "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // WETH
      "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", // WBTC
      "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC
    ],
    conversionIncentive: new Array(3).fill([ARBITRUM_CONVERSION_INCENTIVE, ConversionAccessibility.ALL]),
    converterNetwork: "0x2F6672C9A0988748b0172D97961BecfD9DC6D6d5",
  },
};

function grantPremissions(
  converter: string,
  network: {
    ACCESS_CONTROL_MANAGER: string;
    NORMAL_TIMELOCK: string;
    FAST_TRACK_TIMELOCK: string;
    CRITICAL_TIMELOCK: string;
    GUARDIAN: string;
  },
  dstChainId?: LzChainId,
) {
  return [
    {
      target: network.ACCESS_CONTROL_MANAGER,
      signature: "giveCallPermission(address,string,address)",
      params: [converter, "pauseConversion()", network.NORMAL_TIMELOCK],
      dstChainId,
    },
    {
      target: network.ACCESS_CONTROL_MANAGER,
      signature: "giveCallPermission(address,string,address)",
      params: [converter, "pauseConversion()", network.FAST_TRACK_TIMELOCK],
      dstChainId,
    },
    {
      target: network.ACCESS_CONTROL_MANAGER,
      signature: "giveCallPermission(address,string,address)",
      params: [converter, "pauseConversion()", network.CRITICAL_TIMELOCK],
      dstChainId,
    },
    {
      target: network.ACCESS_CONTROL_MANAGER,
      signature: "giveCallPermission(address,string,address)",
      params: [converter, "pauseConversion()", network.GUARDIAN],
      dstChainId,
    },
    {
      target: network.ACCESS_CONTROL_MANAGER,
      signature: "giveCallPermission(address,string,address)",
      params: [converter, "resumeConversion()", network.NORMAL_TIMELOCK],
      dstChainId,
    },
    {
      target: network.ACCESS_CONTROL_MANAGER,
      signature: "giveCallPermission(address,string,address)",
      params: [converter, "resumeConversion()", network.FAST_TRACK_TIMELOCK],
      dstChainId,
    },
    {
      target: network.ACCESS_CONTROL_MANAGER,
      signature: "giveCallPermission(address,string,address)",
      params: [converter, "resumeConversion()", network.CRITICAL_TIMELOCK],
      dstChainId,
    },
    {
      target: network.ACCESS_CONTROL_MANAGER,
      signature: "giveCallPermission(address,string,address)",
      params: [converter, "resumeConversion()", network.GUARDIAN],
      dstChainId,
    },
    {
      target: network.ACCESS_CONTROL_MANAGER,
      signature: "giveCallPermission(address,string,address)",
      params: [converter, "setMinAmountToConvert(uint256)", network.NORMAL_TIMELOCK],
      dstChainId,
    },
    {
      target: network.ACCESS_CONTROL_MANAGER,
      signature: "giveCallPermission(address,string,address)",
      params: [converter, "setMinAmountToConvert(uint256)", network.FAST_TRACK_TIMELOCK],
      dstChainId,
    },
    {
      target: network.ACCESS_CONTROL_MANAGER,
      signature: "giveCallPermission(address,string,address)",
      params: [converter, "setMinAmountToConvert(uint256)", network.CRITICAL_TIMELOCK],
      dstChainId,
    },
    {
      target: network.ACCESS_CONTROL_MANAGER,
      signature: "giveCallPermission(address,string,address)",
      params: [converter, "setMinAmountToConvert(uint256)", network.GUARDIAN],
      dstChainId,
    },
    {
      target: network.ACCESS_CONTROL_MANAGER,
      signature: "giveCallPermission(address,string,address)",
      params: [converter, "setConversionConfig(address,address,ConversionConfig)", network.NORMAL_TIMELOCK],
      dstChainId,
    },
    {
      target: network.ACCESS_CONTROL_MANAGER,
      signature: "giveCallPermission(address,string,address)",
      params: [converter, "setConversionConfig(address,address,ConversionConfig)", network.FAST_TRACK_TIMELOCK],
      dstChainId,
    },
    {
      target: network.ACCESS_CONTROL_MANAGER,
      signature: "giveCallPermission(address,string,address)",
      params: [converter, "setConversionConfig(address,address,ConversionConfig)", network.CRITICAL_TIMELOCK],
      dstChainId,
    },
    {
      target: network.ACCESS_CONTROL_MANAGER,
      signature: "giveCallPermission(address,string,address)",
      params: [converter, "setConversionConfig(address,address,ConversionConfig)", network.GUARDIAN],
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
      ...grantPremissions(TREASURY_CONVERTER.bscmainnet.converter, bscmainnet),
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
          TREASURY_CONVERTER.bscmainnet.tokenOuts,
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
      ...grantPremissions(TREASURY_CONVERTER.ethereum.converter, ethereum, LzChainId.ethereum),
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
          TREASURY_CONVERTER.ethereum.tokenOuts,
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
      ...grantPremissions(TREASURY_CONVERTER.arbitrumone.converter, arbitrumone, LzChainId.arbitrumone),
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
          TREASURY_CONVERTER.arbitrumone.tokenOuts,
          TREASURY_CONVERTER.arbitrumone.conversionIncentive,
        ],
        dstChainId: LzChainId.arbitrumone,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip536;
