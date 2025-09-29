import { BigNumber, BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;

export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
export const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const PT_xSolvBTC_18DEC2025 = "0xb786A97032ea5A1Bcfe02341f34599C6DfEA6351";
export const vPT_xSolvBTC_18DEC2025 = "0x208ab0b7C543Be39f534B7Cd6bb62F997B32E73E";
export const PT_SolvBTC_BNB_18DEC2025 = "0x666DeDB281A49C2cA493b7766311467062F11f09";
export const vPT_SolvBTC_BNB_18DEC2025 = "0x02dB4eC1Df47064314969a467A0889Fa35652758";
export const MOCK_PENDLE_PT_ORACLE = "0xa37A9127C302fEc17d456a6E1a5643a18a1779aD";
export const PT_xSolvBTC_PENDLE_ORACLE = "0x2dE6EC714173e92D7A0138d0Eee4EA09FCF11965";
export const PT_SolvBTC_BNB_PENDLE_ORACLE = "0x137cbEf31e76e6aF6818Fb50f52D3f7cF1d46d55";
export const RATE_MODEL = "0x0acdc336EA232E4C31D91FCb9B93b10921A3fCEF";
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";
const TWAP_DURATION = 1800;

// Converters
const ETH = "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7";
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
const BTCB = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
const XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";
const WBNB = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
const RISK_FUND_CONVERTER = "0x32Fbf7bBbd79355B86741E3181ef8c1D9bD309Bb";
const USDT_PRIME_CONVERTER = "0xf1FA230D25fC5D6CAfe87C5A6F9e1B17Bc6F194E";
const USDC_PRIME_CONVERTER = "0x2ecEdE6989d8646c992344fF6C97c72a3f811A13";
const BTCB_PRIME_CONVERTER = "0x989A1993C023a45DA141928921C0dE8fD123b7d1";
const ETH_PRIME_CONVERTER = "0xf358650A007aa12ecC8dac08CF8929Be7f72A4D9";
const XVS_VAULT_CONVERTER = "0x258f49254C758a0E37DAb148ADDAEA851F4b02a2";
const WBNB_BURN_CONVERTER = "0x42DBA48e7cCeB030eC73AaAe29d4A3F0cD4facba";
export const CONVERSION_INCENTIVE = 1e14;

// Capped oracles
export const DAYS_30 = 30 * 24 * 60 * 60;
export const increaseExchangeRateByPercentage = (
  exchangeRate: BigNumber,
  percentage: BigNumber, // BPS value (e.g., 10000 for 100%)
) => {
  const increaseAmount = exchangeRate.mul(percentage).div(10000);
  return exchangeRate.add(increaseAmount).toString();
};
export const getSnapshotGap = (
  exchangeRate: BigNumber,
  percentage: number, // BPS value (e.g., 10000 for 100%)
) => {
  // snapshot gap is percentage of the exchange rate
  const snapshotGap = exchangeRate.mul(percentage).div(10000);
  return snapshotGap.toString();
};
export const SECONDS_PER_YEAR = 31536000;
export const PTXSOLVBTC_InitialExchangeRate = parseUnits("0.996374117903232014", 18);
export const PTXSOLVBTC_Timestamp = 1758874206;
export const PTXSOLVBTC_GrowthRate = SECONDS_PER_YEAR; // 0% per year
export const PTXSOLVBTC_SnapshotGap = 400; // 4.00%

export const PTSOLVBTCBNB_InitialExchangeRate = parseUnits("0.985801401412392011", 18);
export const PTSOLVBTCBNB_Timestamp = 1758874206;
export const PTSOLVBTCBNB_GrowthRate = SECONDS_PER_YEAR; // 0% per year
export const PTSOLVBTCBNB_SnapshotGap = 400; // 4.00%

export const converterBaseAssets = {
  [RISK_FUND_CONVERTER]: USDT,
  [USDT_PRIME_CONVERTER]: USDT,
  [USDC_PRIME_CONVERTER]: USDC,
  [BTCB_PRIME_CONVERTER]: BTCB,
  [ETH_PRIME_CONVERTER]: ETH,
  [XVS_VAULT_CONVERTER]: XVS,
  [WBNB_BURN_CONVERTER]: WBNB,
};

export const xSolvBTCMarketSpecs = {
  vToken: {
    address: vPT_xSolvBTC_18DEC2025,
    name: "Venus PT-xSolvBTC-18DEC2025",
    symbol: "vPT-xSolvBTC-18DEC2025",
    underlying: {
      address: PT_xSolvBTC_18DEC2025,
      decimals: 18,
      symbol: "PT-xSolvBTC-18DEC2025",
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: bsctestnet.UNITROLLER,
    isLegacyPool: true,
  },
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.1",
    jumpMultiplierPerYear: "2.5",
    kink: "0.8",
  },
  riskParameters: {
    collateralFactor: parseUnits("0", 18),
    liquidationThreshold: parseUnits("0", 18),
    liquidationIncentive: parseUnits("1", 18),
    reserveFactor: parseUnits("0", 18),
    supplyCap: parseUnits("10", 18),
    borrowCap: parseUnits("0", 18),
  },
  initialSupply: {
    amount: parseUnits("0.01", 18),
    vTokenReceiver: bsctestnet.VTREASURY,
    vTokensToBurn: parseUnits("0.01", 8),
  },
};

export const solvBTCBNBMarketSpecs = {
  vToken: {
    address: vPT_SolvBTC_BNB_18DEC2025,
    name: "Venus PT-SolvBTC.BNB-18DEC2025",
    symbol: "vPT-SolvBTC.BNB-18DEC2025",
    underlying: {
      address: PT_SolvBTC_BNB_18DEC2025,
      decimals: 18,
      symbol: "PT-SolvBTC.BNB-18DEC2025",
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: bsctestnet.UNITROLLER,
    isLegacyPool: true,
  },
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.1",
    jumpMultiplierPerYear: "2.5",
    kink: "0.8",
  },
  riskParameters: {
    collateralFactor: parseUnits("0", 18),
    liquidationThreshold: parseUnits("0", 18),
    liquidationIncentive: parseUnits("1", 18),
    reserveFactor: parseUnits("0", 18),
    supplyCap: parseUnits("10", 18),
    borrowCap: parseUnits("0", 18),
  },
  initialSupply: {
    amount: parseUnits("0.01", 18),
    vTokenReceiver: bsctestnet.VTREASURY,
    vTokensToBurn: parseUnits("0.01", 8),
  },
};

// BTC emode group
export const vBTC = "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe";
export const vSolvBTC = "0xA38110ae4451A86ab754695057d5B5a9BEAd0387";
export const vxSolvBTC = "0x97cB97B05697c377C0bd09feDce67DBd86B7aB1e";
export const EMODE_POOL = {
  label: "BTC",
  id: 3,
  allowCorePoolFallback: true,
  markets: [vBTC, vSolvBTC, vxSolvBTC, vPT_xSolvBTC_18DEC2025, vPT_SolvBTC_BNB_18DEC2025],
  marketConfig: {
    vBTC: {
      address: vBTC,
      collateralFactor: parseUnits("0", 18),
      liquidationThreshold: parseUnits("0", 18),
      liquidationIncentive: parseUnits("1", 18),
      borrowAllowed: true,
    },
    vSolvBTC: {
      address: vSolvBTC,
      collateralFactor: parseUnits("0.9", 18),
      liquidationThreshold: parseUnits("0.92", 18),
      liquidationIncentive: parseUnits("1.06", 18),
      borrowAllowed: false,
    },
    vxSolvBTC: {
      address: vxSolvBTC,
      collateralFactor: parseUnits("0.9", 18),
      liquidationThreshold: parseUnits("0.92", 18),
      liquidationIncentive: parseUnits("1.06", 18),
      borrowAllowed: false,
    },
    PT_xSolvBTC: {
      address: vPT_xSolvBTC_18DEC2025,
      collateralFactor: parseUnits("0.9", 18),
      liquidationThreshold: parseUnits("0.92", 18),
      liquidationIncentive: parseUnits("1.06", 18),
      borrowAllowed: false,
    },
    PT_SolvBTC_BNB: {
      address: vPT_SolvBTC_BNB_18DEC2025,
      collateralFactor: parseUnits("0.9", 18),
      liquidationThreshold: parseUnits("0.92", 18),
      liquidationIncentive: parseUnits("1.06", 18),
      borrowAllowed: false,
    },
  },
};

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

const vTokensMinted = convertAmountToVTokens(
  xSolvBTCMarketSpecs.initialSupply.amount,
  xSolvBTCMarketSpecs.vToken.exchangeRate,
);
const vTokensRemaining = vTokensMinted.sub(xSolvBTCMarketSpecs.initialSupply.vTokensToBurn);

const configureConverters = (fromAssets: string[], incentive: BigNumberish = CONVERSION_INCENTIVE) => {
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

export const vip553 = () => {
  const meta = {
    version: "v2",
    title: "VIP-553 [BNB Chain] BTC emode group",
    description: "VIP-553 [BNB Chain] BTC emode group",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // configure oracle for PT-xSolvBTC-18DEC2025
      {
        target: MOCK_PENDLE_PT_ORACLE,
        signature: "setPtToSyRate(address,uint32,uint256)",
        params: ["0x0000000000000000000000000000000000000005", TWAP_DURATION, parseUnits("0.985801401412392011", 18)],
      },
      {
        target: bsctestnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            PT_xSolvBTC_18DEC2025,
            [PT_xSolvBTC_PENDLE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
      },
      {
        target: PT_xSolvBTC_PENDLE_ORACLE,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(PTXSOLVBTC_InitialExchangeRate, BigNumber.from(PTXSOLVBTC_SnapshotGap)),
          PTXSOLVBTC_Timestamp,
        ],
      },
      {
        target: PT_xSolvBTC_PENDLE_ORACLE,
        signature: "setGrowthRate(uint256,uint256)",
        params: [PTXSOLVBTC_GrowthRate, DAYS_30],
      },
      {
        target: PT_xSolvBTC_PENDLE_ORACLE,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(PTXSOLVBTC_InitialExchangeRate, PTXSOLVBTC_SnapshotGap)],
      },

      // configure oracle for PT-SolvBTC.BNB-18DEC2025
      {
        target: MOCK_PENDLE_PT_ORACLE,
        signature: "setPtToSyRate(address,uint32,uint256)",
        params: ["0x0000000000000000000000000000000000000006", TWAP_DURATION, parseUnits("0.996374117903232014", 18)],
      },
      {
        target: bsctestnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            PT_SolvBTC_BNB_18DEC2025,
            [PT_SolvBTC_BNB_PENDLE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
      },
      {
        target: PT_SolvBTC_BNB_PENDLE_ORACLE,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(PTSOLVBTCBNB_InitialExchangeRate, BigNumber.from(PTSOLVBTCBNB_SnapshotGap)),
          PTSOLVBTCBNB_Timestamp,
        ],
      },
      {
        target: PT_SolvBTC_BNB_PENDLE_ORACLE,
        signature: "setGrowthRate(uint256,uint256)",
        params: [PTSOLVBTCBNB_GrowthRate, DAYS_30],
      },
      {
        target: PT_SolvBTC_BNB_PENDLE_ORACLE,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(PTSOLVBTCBNB_InitialExchangeRate, PTSOLVBTCBNB_SnapshotGap)],
      },

      // Add xSolvBTC Market
      {
        target: xSolvBTCMarketSpecs.vToken.comptroller,
        signature: "_supportMarket(address)",
        params: [xSolvBTCMarketSpecs.vToken.address],
      },
      {
        target: xSolvBTCMarketSpecs.vToken.comptroller,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[xSolvBTCMarketSpecs.vToken.address], [xSolvBTCMarketSpecs.riskParameters.supplyCap]],
      },
      {
        target: xSolvBTCMarketSpecs.vToken.comptroller,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[xSolvBTCMarketSpecs.vToken.address], [xSolvBTCMarketSpecs.riskParameters.borrowCap]],
      },
      {
        target: xSolvBTCMarketSpecs.vToken.address,
        signature: "setAccessControlManager(address)",
        params: [bsctestnet.ACCESS_CONTROL_MANAGER],
      },
      {
        target: xSolvBTCMarketSpecs.vToken.address,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },
      {
        target: xSolvBTCMarketSpecs.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [REDUCE_RESERVES_BLOCK_DELTA],
      },
      {
        target: xSolvBTCMarketSpecs.vToken.address,
        signature: "_setReserveFactor(uint256)",
        params: [xSolvBTCMarketSpecs.riskParameters.reserveFactor],
      },
      {
        target: xSolvBTCMarketSpecs.vToken.comptroller,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [
          xSolvBTCMarketSpecs.vToken.address,
          xSolvBTCMarketSpecs.riskParameters.collateralFactor,
          xSolvBTCMarketSpecs.riskParameters.liquidationThreshold,
        ],
      },
      {
        target: xSolvBTCMarketSpecs.vToken.comptroller,
        signature: "setLiquidationIncentive(address,uint256)",
        params: [xSolvBTCMarketSpecs.vToken.address, xSolvBTCMarketSpecs.riskParameters.liquidationIncentive],
      },
      {
        target: PT_xSolvBTC_18DEC2025,
        signature: "faucet(uint256)",
        params: [xSolvBTCMarketSpecs.initialSupply.amount],
      },
      {
        target: xSolvBTCMarketSpecs.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [xSolvBTCMarketSpecs.vToken.address, xSolvBTCMarketSpecs.initialSupply.amount],
      },
      {
        target: xSolvBTCMarketSpecs.vToken.address,
        signature: "mint(uint256)",
        params: [xSolvBTCMarketSpecs.initialSupply.amount],
      },
      {
        target: xSolvBTCMarketSpecs.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [xSolvBTCMarketSpecs.vToken.address, 0],
      },
      // Burn some vTokens
      {
        target: xSolvBTCMarketSpecs.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, xSolvBTCMarketSpecs.initialSupply.vTokensToBurn],
      },
      // Transfer leftover vTokens to receiver
      {
        target: xSolvBTCMarketSpecs.vToken.address,
        signature: "transfer(address,uint256)",
        params: [xSolvBTCMarketSpecs.initialSupply.vTokenReceiver, vTokensRemaining],
      },
      {
        target: xSolvBTCMarketSpecs.vToken.comptroller,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[xSolvBTCMarketSpecs.vToken.address], [2], true], // Borrrow Pause
      },
      ...configureConverters([PT_xSolvBTC_18DEC2025]),

      // Add solvBTC.BNB Market
      {
        target: solvBTCBNBMarketSpecs.vToken.comptroller,
        signature: "_supportMarket(address)",
        params: [solvBTCBNBMarketSpecs.vToken.address],
      },
      {
        target: solvBTCBNBMarketSpecs.vToken.comptroller,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[solvBTCBNBMarketSpecs.vToken.address], [solvBTCBNBMarketSpecs.riskParameters.supplyCap]],
      },
      {
        target: solvBTCBNBMarketSpecs.vToken.comptroller,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[solvBTCBNBMarketSpecs.vToken.address], [solvBTCBNBMarketSpecs.riskParameters.borrowCap]],
      },
      {
        target: solvBTCBNBMarketSpecs.vToken.address,
        signature: "setAccessControlManager(address)",
        params: [bsctestnet.ACCESS_CONTROL_MANAGER],
      },
      {
        target: solvBTCBNBMarketSpecs.vToken.address,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },
      {
        target: solvBTCBNBMarketSpecs.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [REDUCE_RESERVES_BLOCK_DELTA],
      },
      {
        target: solvBTCBNBMarketSpecs.vToken.address,
        signature: "_setReserveFactor(uint256)",
        params: [solvBTCBNBMarketSpecs.riskParameters.reserveFactor],
      },
      {
        target: solvBTCBNBMarketSpecs.vToken.comptroller,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [
          solvBTCBNBMarketSpecs.vToken.address,
          solvBTCBNBMarketSpecs.riskParameters.collateralFactor,
          solvBTCBNBMarketSpecs.riskParameters.liquidationThreshold,
        ],
      },
      {
        target: solvBTCBNBMarketSpecs.vToken.comptroller,
        signature: "setLiquidationIncentive(address,uint256)",
        params: [solvBTCBNBMarketSpecs.vToken.address, solvBTCBNBMarketSpecs.riskParameters.liquidationIncentive],
      },
      {
        target: PT_SolvBTC_BNB_18DEC2025,
        signature: "faucet(uint256)",
        params: [solvBTCBNBMarketSpecs.initialSupply.amount],
      },
      {
        target: solvBTCBNBMarketSpecs.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [solvBTCBNBMarketSpecs.vToken.address, solvBTCBNBMarketSpecs.initialSupply.amount],
      },
      {
        target: solvBTCBNBMarketSpecs.vToken.address,
        signature: "mint(uint256)",
        params: [solvBTCBNBMarketSpecs.initialSupply.amount],
      },
      {
        target: solvBTCBNBMarketSpecs.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [solvBTCBNBMarketSpecs.vToken.address, 0],
      },
      // Burn some vTokens
      {
        target: solvBTCBNBMarketSpecs.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, solvBTCBNBMarketSpecs.initialSupply.vTokensToBurn],
      },
      // Transfer leftover vTokens to receiver
      {
        target: solvBTCBNBMarketSpecs.vToken.address,
        signature: "transfer(address,uint256)",
        params: [solvBTCBNBMarketSpecs.initialSupply.vTokenReceiver, vTokensRemaining],
      },
      {
        target: solvBTCBNBMarketSpecs.vToken.comptroller,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[solvBTCBNBMarketSpecs.vToken.address], [2], true], // Borrrow Pause
      },
      ...configureConverters([PT_SolvBTC_BNB_18DEC2025]),

      // BTC Emode Group
      {
        target: bsctestnet.UNITROLLER,
        signature: "createPool(string)",
        params: [EMODE_POOL.label],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "addPoolMarkets(uint96[],address[])",
        params: [Array(EMODE_POOL.markets.length).fill(EMODE_POOL.id), EMODE_POOL.markets],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vSolvBTC.address,
          EMODE_POOL.marketConfig.vSolvBTC.collateralFactor,
          EMODE_POOL.marketConfig.vSolvBTC.liquidationThreshold,
        ],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vxSolvBTC.address,
          EMODE_POOL.marketConfig.vxSolvBTC.collateralFactor,
          EMODE_POOL.marketConfig.vxSolvBTC.liquidationThreshold,
        ],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.PT_xSolvBTC.address,
          EMODE_POOL.marketConfig.PT_xSolvBTC.collateralFactor,
          EMODE_POOL.marketConfig.PT_xSolvBTC.liquidationThreshold,
        ],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.PT_SolvBTC_BNB.address,
          EMODE_POOL.marketConfig.PT_SolvBTC_BNB.collateralFactor,
          EMODE_POOL.marketConfig.PT_SolvBTC_BNB.liquidationThreshold,
        ],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vBTC.address,
          EMODE_POOL.marketConfig.vBTC.liquidationIncentive,
        ],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vSolvBTC.address,
          EMODE_POOL.marketConfig.vSolvBTC.liquidationIncentive,
        ],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vxSolvBTC.address,
          EMODE_POOL.marketConfig.vxSolvBTC.liquidationIncentive,
        ],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.PT_xSolvBTC.address,
          EMODE_POOL.marketConfig.PT_xSolvBTC.liquidationIncentive,
        ],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.PT_SolvBTC_BNB.address,
          EMODE_POOL.marketConfig.PT_SolvBTC_BNB.liquidationIncentive,
        ],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setAllowCorePoolFallback(uint96,bool)",
        params: [EMODE_POOL.id, EMODE_POOL.allowCorePoolFallback],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [EMODE_POOL.id, EMODE_POOL.marketConfig.vBTC.address, EMODE_POOL.marketConfig.vBTC.borrowAllowed],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [bsctestnet.UNITROLLER, "_supportMarket(address)", bsctestnet.FAST_TRACK_TIMELOCK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip553;
