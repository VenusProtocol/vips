import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";

const { POOL_REGISTRY, VTREASURY, NORMAL_TIMELOCK, CHAINLINK_ORACLE, RESILIENT_ORACLE } =
  NETWORK_ADDRESSES["arbitrumone"];

export const COMPTROLLER_CORE = "0x317c1A5739F39046E20b08ac9BeEa3f10fD43326";
export const CHAINLINK_STALE_PERIOD = 26 * 60 * 60; // 26 hours
export const gmBTC_CHAINLINK_FEED = "0x395D5c5D552Df670dc4B2B1cef0c4EABfFba492f";

export const USDT_PRIME_CONVERTER = "0x435Fac1B002d5D31f374E07c0177A1D709d5DC2D";
export const USDC_PRIME_CONVERTER = "0x6553C9f9E131191d4fECb6F0E73bE13E229065C6";
export const WBTC_PRIME_CONVERTER = "0xF91369009c37f029aa28AF89709a352375E5A162";
export const WETH_PRIME_CONVERTER = "0x4aCB90ddD6df24dC6b0D50df84C94e72012026d0";
export const XVS_VAULT_CONVERTER = "0x9c5A7aB705EA40876c1B292630a3ff2e0c213DB1";
export const BaseAssets = [
  "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT USDTTokenConverter BaseAsset
  "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC USDCTokenConverter BaseAsset
  "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", // WBTC WBTCTokenConverter BaseAsset
  "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH WETHTokenConverter BaseAsset
  "0xc1Eb7689147C81aC840d4FF0D298489fc7986d52", // XVS XVSTokenConverter BaseAsset
];
const CONVERSION_INCENTIVE = parseUnits("0.0001", 18);

export const REFUND_ADDRESS = "0xe1f7c5209938780625E354dc546E28397F6Ce174";
export const REFUND_AMOUNT = parseUnits("10000", 18);
export const REFUND_TOKEN = "0x7C11F78Ce78768518D743E81Fdfa2F860C6b9A77";

type Token = {
  address: string;
  decimals: number;
  symbol: string;
};

export const token = {
  address: "0x47c031236e19d024b42f8AE6780E44A573170703",
  decimals: 18,
  symbol: "GM",
};

type Market = {
  vToken: {
    address: string;
    name: string;
    symbol: string;
    underlying: Token;
    decimals: number;
    exchangeRate: BigNumber;
    comptroller: string;
  };
  riskParameters: {
    collateralFactor: BigNumber;
    liquidationThreshold: BigNumber;
    supplyCap: BigNumber;
    borrowCap: BigNumber;
    reserveFactor: BigNumber;
    protocolSeizeShare: BigNumber;
  };
  initialSupply: {
    amount: BigNumber;
    vTokenReceiver: string;
  };
  interestRateModel: {
    address: string;
    base: string;
    multiplier: string;
    jump: string;
    kink: string;
  };
};

export const market: Market = {
  vToken: {
    address: "0x4f3a73f318C5EA67A86eaaCE24309F29f89900dF",
    name: "Venus gmBTC-USDC (Core)",
    symbol: "vgmBTC-USDC_Core",
    underlying: token,
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.55", 18),
    liquidationThreshold: parseUnits("0.6", 18),
    supplyCap: parseUnits("2650000", 18),
    borrowCap: parseUnits("0", 18),
    reserveFactor: parseUnits("0.25", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("4800", 18),
    vTokenReceiver: "0xe1f7c5209938780625E354dc546E28397F6Ce174",
  },
  interestRateModel: {
    address: "0x390D1C248217615D79f74f2453D682906Bd2dD20",
    base: "0",
    multiplier: "0.15",
    jump: "2.5",
    kink: "0.45",
  },
};

const vip435ArbitrumOneCommands = (overrides: { chainlinkStalePeriod?: number }) => {
  const chainlinkStalePeriod = overrides?.chainlinkStalePeriod || CHAINLINK_STALE_PERIOD;

  return [
    {
      target: CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[token.address, gmBTC_CHAINLINK_FEED, chainlinkStalePeriod]],
      dstChainId: LzChainId.arbitrumone,
    },
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          token.address,
          [CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
          [true, false, false],
        ],
      ],
      dstChainId: LzChainId.arbitrumone,
    },

    {
      target: market.vToken.address,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
      dstChainId: LzChainId.arbitrumone,
    },
    {
      target: market.vToken.address,
      signature: "setReserveFactor(uint256)",
      params: [market.riskParameters.reserveFactor],
      dstChainId: LzChainId.arbitrumone,
    },
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [market.vToken.underlying.address, market.initialSupply.amount, NORMAL_TIMELOCK],
      dstChainId: LzChainId.arbitrumone,
    },
    {
      target: market.vToken.underlying.address,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, market.initialSupply.amount],
      dstChainId: LzChainId.arbitrumone,
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          market.vToken.address,
          market.riskParameters.collateralFactor,
          market.riskParameters.liquidationThreshold,
          market.initialSupply.amount,
          market.initialSupply.vTokenReceiver,
          market.riskParameters.supplyCap,
          market.riskParameters.borrowCap,
        ],
      ],
      dstChainId: LzChainId.arbitrumone,
    },
    {
      target: market.vToken.underlying.address,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
      dstChainId: LzChainId.arbitrumone,
    },
    {
      target: market.vToken.address,
      signature: "setProtocolSeizeShare(uint256)",
      params: [market.riskParameters.protocolSeizeShare],
      dstChainId: LzChainId.arbitrumone,
    },
    {
      target: USDT_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[0], [market.vToken.underlying.address], [[CONVERSION_INCENTIVE, 1]]],
      dstChainId: LzChainId.arbitrumone,
    },
    {
      target: USDC_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[1], [market.vToken.underlying.address], [[CONVERSION_INCENTIVE, 1]]],
      dstChainId: LzChainId.arbitrumone,
    },
    {
      target: WBTC_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[2], [market.vToken.underlying.address], [[CONVERSION_INCENTIVE, 1]]],
      dstChainId: LzChainId.arbitrumone,
    },
    {
      target: WETH_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[3], [market.vToken.underlying.address], [[CONVERSION_INCENTIVE, 1]]],
      dstChainId: LzChainId.arbitrumone,
    },
    {
      target: XVS_VAULT_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[4], [market.vToken.underlying.address], [[CONVERSION_INCENTIVE, 1]]],
      dstChainId: LzChainId.arbitrumone,
    },
    {
      target: COMPTROLLER_CORE,
      signature: "setActionsPaused(address[],uint8[],bool)",
      params: [[market.vToken.address], [2], true],
      dstChainId: LzChainId.arbitrumone,
    },
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [REFUND_TOKEN, REFUND_AMOUNT, REFUND_ADDRESS],
      dstChainId: LzChainId.arbitrumone,
    },
  ];
};

export default vip435ArbitrumOneCommands;
