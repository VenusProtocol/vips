import { BigNumber, BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const PT_xSolvBTC_18DEC2025 = "0x154b13a628E947034CA69378Ee0acdE9d973d868";
export const vPT_xSolvBTC_18DEC2025 = "0xaD5f96593d40B27fD2EFab8EF905eE3D53B68aAD";
export const PT_SolvBTC_BNB_18DEC2025 = "0xEe61A49a180CD23C3E629c5A70c1eE6539c004bD";
export const vPT_SolvBTC_BNB_18DEC2025 = "0x281493610A3be31370ca8c00c5D4b605FaB5336F";
export const PT_xSolvBTC_PENDLE_ORACLE = "0xfbaC497147EF27f155f27aaB1172666dce09820E";
export const PT_SolvBTC_BNB_PENDLE_ORACLE = "0x9B353103f6da8FCb67B2e5bB129fC5c63691AbF8";
export const RATE_MODEL = "0x6D7c746D4A9170F1731F89580414235dA47787fc";
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";

// Converters
const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const RISK_FUND_CONVERTER = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";
const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";
const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";
const BTCB_PRIME_CONVERTER = "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53";
const ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";
const XVS_VAULT_CONVERTER = "0xd5b9AE835F4C59272032B3B954417179573331E0";
const WBNB_BURN_CONVERTER = "0x9eF79830e626C8ccA7e46DCEd1F90e51E7cFCeBE";
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
    comptroller: bscmainnet.UNITROLLER,
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
    vTokenReceiver: bscmainnet.VTREASURY,
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
    comptroller: bscmainnet.UNITROLLER,
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
    vTokenReceiver: bscmainnet.VTREASURY,
    vTokensToBurn: parseUnits("0.01", 8),
  },
};

// BTC emode group
export const vBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
export const vSolvBTC = "0xf841cb62c19fCd4fF5CD0AaB5939f3140BaaC3Ea";
export const vxSolvBTC = "0xd804dE60aFD05EE6B89aab5D152258fD461B07D5";
export const EMODE_POOL = {
  label: "BTC",
  id: 2,
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

const setRedstoneOracleForSimulations = (simulations: boolean, PTTokenAddress: string) => {
  if (simulations) {
    return [
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            PTTokenAddress,
            [bscmainnet.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
      },
    ];
  } else {
    return [];
  }
};

export const vip553 = (simulating: boolean) => {
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
        target: bscmainnet.RESILIENT_ORACLE,
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
      ...setRedstoneOracleForSimulations(simulating, PT_xSolvBTC_18DEC2025),
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
        target: bscmainnet.RESILIENT_ORACLE,
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
      ...setRedstoneOracleForSimulations(simulating, PT_SolvBTC_BNB_18DEC2025),
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
        params: [bscmainnet.ACCESS_CONTROL_MANAGER],
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
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [
          xSolvBTCMarketSpecs.vToken.underlying.address,
          xSolvBTCMarketSpecs.initialSupply.amount,
          bscmainnet.NORMAL_TIMELOCK,
        ],
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
        params: [bscmainnet.ACCESS_CONTROL_MANAGER],
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
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [
          solvBTCBNBMarketSpecs.vToken.underlying.address,
          solvBTCBNBMarketSpecs.initialSupply.amount,
          bscmainnet.NORMAL_TIMELOCK,
        ],
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
        target: bscmainnet.UNITROLLER,
        signature: "createPool(string)",
        params: [EMODE_POOL.label],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "addPoolMarkets(uint96[],address[])",
        params: [Array(EMODE_POOL.markets.length).fill(EMODE_POOL.id), EMODE_POOL.markets],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vSolvBTC.address,
          EMODE_POOL.marketConfig.vSolvBTC.collateralFactor,
          EMODE_POOL.marketConfig.vSolvBTC.liquidationThreshold,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vxSolvBTC.address,
          EMODE_POOL.marketConfig.vxSolvBTC.collateralFactor,
          EMODE_POOL.marketConfig.vxSolvBTC.liquidationThreshold,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.PT_xSolvBTC.address,
          EMODE_POOL.marketConfig.PT_xSolvBTC.collateralFactor,
          EMODE_POOL.marketConfig.PT_xSolvBTC.liquidationThreshold,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.PT_SolvBTC_BNB.address,
          EMODE_POOL.marketConfig.PT_SolvBTC_BNB.collateralFactor,
          EMODE_POOL.marketConfig.PT_SolvBTC_BNB.liquidationThreshold,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vBTC.address,
          EMODE_POOL.marketConfig.vBTC.liquidationIncentive,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vSolvBTC.address,
          EMODE_POOL.marketConfig.vSolvBTC.liquidationIncentive,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vxSolvBTC.address,
          EMODE_POOL.marketConfig.vxSolvBTC.liquidationIncentive,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.PT_xSolvBTC.address,
          EMODE_POOL.marketConfig.PT_xSolvBTC.liquidationIncentive,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.PT_SolvBTC_BNB.address,
          EMODE_POOL.marketConfig.PT_SolvBTC_BNB.liquidationIncentive,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setAllowCorePoolFallback(uint96,bool)",
        params: [EMODE_POOL.id, EMODE_POOL.allowCorePoolFallback],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [EMODE_POOL.id, EMODE_POOL.marketConfig.vBTC.address, EMODE_POOL.marketConfig.vBTC.borrowAllowed],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [bscmainnet.UNITROLLER, "_supportMarket(address)", bscmainnet.FAST_TRACK_TIMELOCK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip553;
