import { BigNumber, BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { NORMAL_TIMELOCK } from "src/vip-framework";

const bsctestnet = NETWORK_ADDRESSES.bsctestnet;
export const PROTOCOL_SHARE_RESERVE_BSC = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const xSolvBTC_BSC = "0x3ea87323806586A0282b50377e0FEa76070F532B";
export const vxSolvBTC_BSC = "0x97cB97B05697c377C0bd09feDce67DBd86B7aB1e";
export const xSolvBTC_Oracle_BSC = "0x9783294c8c2073A7e91A6F8B1b5f5658056232C8";
export const REDUCE_RESERVES_BLOCK_DELTA_BSC = "28800";

const sepolia = NETWORK_ADDRESSES.sepolia;
export const COMPTROLLER_CORE_ETH = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
export const tBTC_ETH = "0x5B377e8d43D7D11978A83D7F055Dce30daf385AF";
export const tBTC_Price = parseUnits("103921.65", 18);

// Converters
const ETH_BSC = "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7";
const USDT_BSC = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const USDC_BSC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
const BTCB_BSC = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
const XVS_BSC = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";
const RISK_FUND_CONVERTER_BSC = "0x32Fbf7bBbd79355B86741E3181ef8c1D9bD309Bb";
const USDT_PRIME_CONVERTER_BSC = "0xf1FA230D25fC5D6CAfe87C5A6F9e1B17Bc6F194E";
const USDC_PRIME_CONVERTER_BSC = "0x2ecEdE6989d8646c992344fF6C97c72a3f811A13";
const BTCB_PRIME_CONVERTER_BSC = "0x989A1993C023a45DA141928921C0dE8fD123b7d1";
const ETH_PRIME_CONVERTER_BSC = "0xf358650A007aa12ecC8dac08CF8929Be7f72A4D9";
const XVS_VAULT_CONVERTER_BSC = "0x258f49254C758a0E37DAb148ADDAEA851F4b02a2";
export const CONVERSION_INCENTIVE_BSC = 1e14;

export const converterBaseAssets = {
  [RISK_FUND_CONVERTER_BSC]: USDT_BSC,
  [USDT_PRIME_CONVERTER_BSC]: USDT_BSC,
  [USDC_PRIME_CONVERTER_BSC]: USDC_BSC,
  [BTCB_PRIME_CONVERTER_BSC]: BTCB_BSC,
  [ETH_PRIME_CONVERTER_BSC]: ETH_BSC,
  [XVS_VAULT_CONVERTER_BSC]: XVS_BSC,
};

const USDT_ETH = "0x8d412FD0bc5d826615065B931171Eed10F5AF266";
const USDC_ETH = "0x772d68929655ce7234C8C94256526ddA66Ef641E";
const WBTC_ETH = "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b";
const WETH_ETH = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
const XVS_ETH = "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E";
export const USDT_PRIME_CONVERTER_ETH = "0x3716C24EA86A67cAf890d7C9e4C4505cDDC2F8A2";
export const USDC_PRIME_CONVERTER_ETH = "0x511a559a699cBd665546a1F75908f7E9454Bfc67";
export const WBTC_PRIME_CONVERTER_ETH = "0x8a3937F27921e859db3FDA05729CbCea8cfd82AE";
export const WETH_PRIME_CONVERTER_ETH = "0x274a834eFFA8D5479502dD6e78925Bc04ae82B46";
export const XVS_VAULT_CONVERTER_ETH = "0xc203bfA9dCB0B5fEC510Db644A494Ff7f4968ed2";

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

  return Object.entries(converterBaseAssets).map(([converter, baseAsset]: [string, string]) => {
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
      dstChainId: LzChainId.sepolia,
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
    comptroller: bsctestnet.UNITROLLER,
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
    vTokensToBurn: parseUnits("0.001666", 8), // Approximately $100
    vTokenReceiver: bsctestnet.VTREASURY,
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
    address: "0x834078D691d431aAdC80197f7a61239F9F89547b",
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
    vTokenReceiver: sepolia.VTREASURY,
  },
  interestRateModel: {
    address: "0xA854D35664c658280fFf27B6eDC6C4195c3229B3",
    base: "0",
    multiplier: "0.15",
    jump: "3",
    kink: "0.45",
  },
};

export const vip505 = () => {
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
        target: bsctestnet.REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [xSolvBTCMarketSpec.vToken.underlying.address, parseUnits("1", 18)],
      },
      {
        target: bsctestnet.RESILIENT_ORACLE,
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
        params: [bsctestnet.ACCESS_CONTROL_MANAGER],
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
        target: xSolvBTCMarketSpec.vToken.underlying.address,
        signature: "faucet(uint256)",
        params: [xSolvBTCMarketSpec.initialSupply.amount],
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

      // Configure Oracle
      {
        target: sepolia.CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [tBTCMarketSpec.vToken.underlying, tBTC_Price],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            tBTCMarketSpec.vToken.underlying,
            [sepolia.CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      // Market config
      {
        target: tBTCMarketSpec.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: tBTCMarketSpec.vToken.underlying,
        signature: "faucet(uint256)",
        params: [tBTCMarketSpec.initialSupply.amount],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: tBTCMarketSpec.vToken.underlying,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, 0],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: tBTCMarketSpec.vToken.underlying,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, tBTCMarketSpec.initialSupply.amount],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            tBTCMarketSpec.vToken.address,
            tBTCMarketSpec.riskParameters.collateralFactor, // CF
            tBTCMarketSpec.riskParameters.liquidationThreshold, // LT
            tBTCMarketSpec.initialSupply.amount, // initial supply
            sepolia.NORMAL_TIMELOCK, // vToken receiver
            tBTCMarketSpec.riskParameters.supplyCap, // supply cap
            tBTCMarketSpec.riskParameters.borrowCap, // borrow cap
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: tBTCMarketSpec.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, tBTCMarketSpec.initialSupply.vTokensToBurn],
        dstChainId: LzChainId.sepolia,
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
          dstChainId: LzChainId.sepolia,
        };
      })(),
      ...configureConvertersEth([tBTCMarketSpec.vToken.underlying]),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip505;
