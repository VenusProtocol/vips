import { BigNumber, BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { NORMAL_TIMELOCK } from "src/vip-framework";

const bsctestnet = NETWORK_ADDRESSES.bsctestnet;
export const PROTOCOL_SHARE_RESERVE_BSC = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const xSolvBTC_BSC = "0x3ea87323806586A0282b50377e0FEa76070F532B";
export const vxSolvBTC_BSC = "0x97cB97B05697c377C0bd09feDce67DBd86B7aB1e";
export const xSolvBTC_Oracle_BSC = "0x9783294c8c2073A7e91A6F8B1b5f5658056232C8";
export const REDUCE_RESERVES_BLOCK_DELTA_BSC= "28800";

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
        const vTokensMinted = convertAmountToVTokens(xSolvBTCMarketSpec.initialSupply.amount, xSolvBTCMarketSpec.vToken.exchangeRate);
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip505;
