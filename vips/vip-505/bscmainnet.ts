import { BigNumber, BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { NORMAL_TIMELOCK } from "src/vip-framework";

const bscmainnet = NETWORK_ADDRESSES.bscmainnet;
export const PROTOCOL_SHARE_RESERVE_BSC = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const xSolvBTC_BSC = "0x1346b618dC92810EC74163e4c27004c921D446a5";
export const vxSolvBTC_BSC = "0xd804dE60aFD05EE6B89aab5D152258fD461B07D5";
export const xSolvBTC_Oracle_BSC = "0xD39f9280873EB8A312246ee85f7ff118cb8206bb";
export const xSolvBTC_RedStone_Feed_BSC = "0x24c8964338Deb5204B096039147B8e8C3AEa42Cc";
export const stalePeriod_BSC = 7 * 60 * 60; // 7 hours in seconds
export const REDUCE_RESERVES_BLOCK_DELTA_BSC = "28800";

const ethereum = NETWORK_ADDRESSES.ethereum;
export const tBTC_Chainlink_Feed_ETH = "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c";
export const tBTC_Stale_Period_ETH = 6000; // 100 minutes in seconds
export const COMPTROLLER_CORE_ETH = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
export const tBTC_ETH = "0x18084fbA666a33d37592fA2633fD49a74DD93a88";

// Converters
export const USDT_BSC = "0x55d398326f99059fF775485246999027B3197955";
const USDC_BSC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const BTCB_BSC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
const XVS_BSC = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
const ETH_BSC = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const RISK_FUND_CONVERTER_BSC = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";
const USDT_PRIME_CONVERTER_BSC = "0xD9f101AA67F3D72662609a2703387242452078C3";
const USDC_PRIME_CONVERTER_BSC = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";
const BTCB_PRIME_CONVERTER_BSC = "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53";
const ETH_PRIME_CONVERTER_BSC = "0xca430B8A97Ea918fF634162acb0b731445B8195E";
const XVS_VAULT_CONVERTER_BSC = "0xd5b9AE835F4C59272032B3B954417179573331E0";
export const CONVERSION_INCENTIVE_BSC = 1e14;

export const converterBaseAssetsBsc = {
  [RISK_FUND_CONVERTER_BSC]: USDT_BSC,
  [USDT_PRIME_CONVERTER_BSC]: USDT_BSC,
  [USDC_PRIME_CONVERTER_BSC]: USDC_BSC,
  [BTCB_PRIME_CONVERTER_BSC]: BTCB_BSC,
  [ETH_PRIME_CONVERTER_BSC]: ETH_BSC,
  [XVS_VAULT_CONVERTER_BSC]: XVS_BSC,
};

export const USDT_ETH = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const USDC_ETH = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const WBTC_ETH = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
const WETH_ETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const XVS_ETH = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
export const USDT_PRIME_CONVERTER_ETH = "0x4f55cb0a24D5542a3478B0E284259A6B850B06BD";
export const USDC_PRIME_CONVERTER_ETH = "0xcEB9503f10B781E30213c0b320bCf3b3cE54216E";
export const WBTC_PRIME_CONVERTER_ETH = "0xDcCDE673Cd8988745dA384A7083B0bd22085dEA0";
export const WETH_PRIME_CONVERTER_ETH = "0xb8fD67f215117FADeF06447Af31590309750529D";
export const XVS_VAULT_CONVERTER_ETH = "0x1FD30e761C3296fE36D9067b1e398FD97B4C0407";

export const converterBaseAssetsEth = {
  [USDT_PRIME_CONVERTER_ETH]: USDT_ETH,
  [USDC_PRIME_CONVERTER_ETH]: USDC_ETH,
  [WBTC_PRIME_CONVERTER_ETH]: WBTC_ETH,
  [WETH_PRIME_CONVERTER_ETH]: WETH_ETH,
  [XVS_VAULT_CONVERTER_ETH]: XVS_ETH,
};
export const CONVERSION_INCENTIVE_ETH = 3e14;

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

const configureConvertersBsc = (fromAssets: string[], incentive: BigNumberish = CONVERSION_INCENTIVE_BSC) => {
  enum ConversionAccessibility {
    NONE = 0,
    ALL = 1,
    ONLY_FOR_CONVERTERS = 2,
    ONLY_FOR_USERS = 3,
  }

  return Object.entries(converterBaseAssetsBsc).map(([converter, baseAsset]: [string, string]) => {
    const conversionConfigs = fromAssets.map(() => [incentive, ConversionAccessibility.ALL]);
    return {
      target: converter,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [baseAsset, fromAssets, conversionConfigs],
    };
  });
};

const configureConvertersEth = (fromAssets: string[], incentive: BigNumberish = CONVERSION_INCENTIVE_ETH) => {
  enum ConversionAccessibility {
    NONE = 0,
    ALL = 1,
    ONLY_FOR_CONVERTERS = 2,
    ONLY_FOR_USERS = 3,
  }

  return Object.entries(converterBaseAssetsEth).map(([converter, baseAsset]: [string, string]) => {
    const conversionConfigs = fromAssets.map(() => [incentive, ConversionAccessibility.ALL]);
    return {
      target: converter,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [baseAsset, fromAssets, conversionConfigs],
      dstChainId: LzChainId.ethereum,
    };
  });
};

export const xSolvBTCMarketSpec = {
  vToken: {
    address: vxSolvBTC_BSC,
    name: "Venus xSolvBTC",
    symbol: "vxSolvBTC",
    underlying: {
      address: xSolvBTC_BSC,
      decimals: 18,
      symbol: "xSolvBTC",
    },
    decimals: 18,
    exchangeRate: parseUnits("1", 28),
    comptroller: bscmainnet.UNITROLLER,
    isLegacyPool: true,
  },
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.09",
    jumpMultiplierPerYear: "2",
    kink: "0.5",
  },
  initialSupply: {
    amount: parseUnits("1", 18),
    vTokensToBurn: parseUnits("0.0009615", 8), // Approximately $100
    vTokenReceiver: bscmainnet.VTREASURY,
  },
  riskParameters: {
    supplyCap: parseUnits("100", 18),
    borrowCap: parseUnits("0", 18),
    collateralFactor: parseUnits("0.72", 18),
    reserveFactor: parseUnits("0.1", 18),
  },
};

export const tBTCMarketSpec = {
  vToken: {
    address: "0x5e35C312862d53FD566737892aDCf010cb4928F7",
    name: "Venus tBTC (Core)",
    symbol: "vtBTC_Core",
    underlying: tBTC_ETH,
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE_ETH,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.75", 18),
    liquidationThreshold: parseUnits("0.78", 18),
    supplyCap: parseUnits("120", 18),
    borrowCap: parseUnits("6", 18),
    reserveFactor: parseUnits("0.25", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("0.24", 18),
    vTokensToBurn: parseUnits("0.0009615", 8), // Approximately $100
    vTokenReceiver: "0x71E47a4429d35827e0312AA13162197C23287546",
  },
  interestRateModel: {
    address: "0x8a7F7b9f5DD2366E4Caaeb0362726531B86B711E",
    base: "0",
    multiplier: "0.15",
    jump: "3",
    kink: "0.45",
  },
};

export const vip505 = (maxStalePeriod?: number) => {
  const meta = {
    version: "v2",
    title: "VIP-505",
    description: "",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Configure Oracle
      {
        target: bscmainnet.REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[xSolvBTCMarketSpec.vToken.underlying.address, xSolvBTC_RedStone_Feed_BSC, stalePeriod_BSC]],
      },
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            xSolvBTCMarketSpec.vToken.underlying.address,
            [xSolvBTC_Oracle_BSC, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
      },
      // Add Market
      {
        target: xSolvBTCMarketSpec.vToken.comptroller,
        signature: "_supportMarket(address)",
        params: [xSolvBTCMarketSpec.vToken.address],
      },
      {
        target: xSolvBTCMarketSpec.vToken.comptroller,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[xSolvBTCMarketSpec.vToken.address], [xSolvBTCMarketSpec.riskParameters.supplyCap]],
      },
      {
        target: xSolvBTCMarketSpec.vToken.comptroller,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[xSolvBTCMarketSpec.vToken.address], [xSolvBTCMarketSpec.riskParameters.borrowCap]],
      },
      {
        target: xSolvBTCMarketSpec.vToken.address,
        signature: "setAccessControlManager(address)",
        params: [bscmainnet.ACCESS_CONTROL_MANAGER],
      },
      {
        target: xSolvBTCMarketSpec.vToken.address,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE_BSC],
      },
      {
        target: xSolvBTCMarketSpec.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [REDUCE_RESERVES_BLOCK_DELTA_BSC],
      },
      {
        target: xSolvBTCMarketSpec.vToken.address,
        signature: "_setReserveFactor(uint256)",
        params: [xSolvBTCMarketSpec.riskParameters.reserveFactor],
      },
      {
        target: xSolvBTCMarketSpec.vToken.comptroller,
        signature: "_setCollateralFactor(address,uint256)",
        params: [xSolvBTCMarketSpec.vToken.address, xSolvBTCMarketSpec.riskParameters.collateralFactor],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [
          xSolvBTCMarketSpec.vToken.underlying.address,
          xSolvBTCMarketSpec.initialSupply.amount,
          NORMAL_TIMELOCK,
        ],
      },
      {
        target: xSolvBTCMarketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [xSolvBTCMarketSpec.vToken.address, xSolvBTCMarketSpec.initialSupply.amount],
      },
      {
        target: xSolvBTCMarketSpec.vToken.address,
        signature: "mintBehalf(address,uint256)",
        params: [NORMAL_TIMELOCK, xSolvBTCMarketSpec.initialSupply.amount],
      },
      {
        target: xSolvBTCMarketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [xSolvBTCMarketSpec.vToken.address, 0],
      },
      // Burn some vtokens
      {
        target: xSolvBTCMarketSpec.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, xSolvBTCMarketSpec.initialSupply.vTokensToBurn],
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(
          xSolvBTCMarketSpec.initialSupply.amount,
          xSolvBTCMarketSpec.vToken.exchangeRate,
        );
        const vTokensRemaining = vTokensMinted.sub(xSolvBTCMarketSpec.initialSupply.vTokensToBurn);
        return {
          target: xSolvBTCMarketSpec.vToken.address,
          signature: "transfer(address,uint256)",
          params: [xSolvBTCMarketSpec.initialSupply.vTokenReceiver, vTokensRemaining],
        };
      })(),
      {
        target: xSolvBTCMarketSpec.vToken.comptroller,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[xSolvBTCMarketSpec.vToken.address], [2], true],
      },
      ...configureConvertersBsc([xSolvBTCMarketSpec.vToken.underlying.address]),
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT_BSC, parseUnits("100", 18), xSolvBTCMarketSpec.initialSupply.vTokenReceiver],
      },

      // Configure Oracle
      {
        target: ethereum.CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[tBTCMarketSpec.vToken.underlying, tBTC_Chainlink_Feed_ETH, maxStalePeriod || tBTC_Stale_Period_ETH]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            tBTCMarketSpec.vToken.underlying,
            [ethereum.CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      // Market config
      {
        target: tBTCMarketSpec.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [tBTCMarketSpec.vToken.underlying, tBTCMarketSpec.initialSupply.amount, ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: tBTCMarketSpec.vToken.underlying,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, 0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: tBTCMarketSpec.vToken.underlying,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, tBTCMarketSpec.initialSupply.amount],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            tBTCMarketSpec.vToken.address,
            tBTCMarketSpec.riskParameters.collateralFactor, // CF
            tBTCMarketSpec.riskParameters.liquidationThreshold, // LT
            tBTCMarketSpec.initialSupply.amount, // initial supply
            ethereum.NORMAL_TIMELOCK, // vToken receiver
            tBTCMarketSpec.riskParameters.supplyCap, // supply cap
            tBTCMarketSpec.riskParameters.borrowCap, // borrow cap
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: tBTCMarketSpec.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, tBTCMarketSpec.initialSupply.vTokensToBurn],
        dstChainId: LzChainId.ethereum,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(
          tBTCMarketSpec.initialSupply.amount,
          tBTCMarketSpec.vToken.exchangeRate,
        );
        const vTokensRemaining = vTokensMinted.sub(tBTCMarketSpec.initialSupply.vTokensToBurn);
        return {
          target: tBTCMarketSpec.vToken.address,
          signature: "transfer(address,uint256)",
          params: [tBTCMarketSpec.initialSupply.vTokenReceiver, vTokensRemaining],
          dstChainId: LzChainId.ethereum,
        };
      })(),
      ...configureConvertersEth([tBTCMarketSpec.vToken.underlying]),
      {
        target: ethereum.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [USDT_ETH, parseUnits("100", 6), tBTCMarketSpec.initialSupply.vTokenReceiver],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip505;
