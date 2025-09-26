import { BigNumber, BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;
export const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const PT_USDe_30Oct2025 = "0x3099fc25fCdE347D42a22329147d47aB0b0eb6Dd";
export const vPT_USDe_30Oct2025 = "0x353B95109F6CB13b8C601f9527DFd8A0beE750ae";
export const RATE_MODEL = "0x0acdc336EA232E4C31D91FCb9B93b10921A3fCEF";
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";
export const MOCK_PENDLE_PT_ORACLE = "0xa37A9127C302fEc17d456a6E1a5643a18a1779aD";
export const PT_USDe_PENDLE_ORACLE = "0x6c41e88f4ac0BD30e57cE4094CFE7524661F5Ef3";
const TWAP_DURATION = 1800;

// Converters
const ETH = "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7";
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
const BTCB = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
const XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";
const RISK_FUND_CONVERTER = "0x32Fbf7bBbd79355B86741E3181ef8c1D9bD309Bb";
const USDT_PRIME_CONVERTER = "0xf1FA230D25fC5D6CAfe87C5A6F9e1B17Bc6F194E";
const USDC_PRIME_CONVERTER = "0x2ecEdE6989d8646c992344fF6C97c72a3f811A13";
const BTCB_PRIME_CONVERTER = "0x989A1993C023a45DA141928921C0dE8fD123b7d1";
const ETH_PRIME_CONVERTER = "0xf358650A007aa12ecC8dac08CF8929Be7f72A4D9";
const XVS_VAULT_CONVERTER = "0x258f49254C758a0E37DAb148ADDAEA851F4b02a2";
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
export const PTUSDE30OCT2025_InitialExchangeRate = parseUnits("0.992132780932187177", 18);
export const PTUSDE30OCT2025_Timestamp = 1758874206;
export const PTUSDE30OCT2025_GrowthRate = SECONDS_PER_YEAR; // 0% per year
export const PTUSDE30OCT2025_SnapshotGap = 400; // 4.00%

export const converterBaseAssets = {
  [RISK_FUND_CONVERTER]: USDT,
  [USDT_PRIME_CONVERTER]: USDT,
  [USDC_PRIME_CONVERTER]: USDC,
  [BTCB_PRIME_CONVERTER]: BTCB,
  [ETH_PRIME_CONVERTER]: ETH,
  [XVS_VAULT_CONVERTER]: XVS,
};

export const marketSpecs = {
  vToken: {
    address: vPT_USDe_30Oct2025,
    name: "Venus PT-USDe-30Oct2025",
    symbol: "vPT-USDe-30Oct2025",
    underlying: {
      address: PT_USDe_30Oct2025,
      decimals: 18,
      symbol: "PT-USDe-30Oct2025",
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
    supplyCap: parseUnits("1000000", 18),
    borrowCap: parseUnits("0", 18),
  },
  initialSupply: {
    amount: parseUnits("300", 18),
    vTokenReceiver: bsctestnet.VTREASURY,
    vTokensToBurn: parseUnits("100", 8),
  },
};

// stablecoin emode group
export const vUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";
export const vUSDC = "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7";
export const EMODE_POOL_SPECS = {
  label: "Stablecoins",
  id: 1,
  markets: [vUSDT, vUSDC, vPT_USDe_30Oct2025],
  marketsConfig: [
    {
      address: vUSDT,
      collateralFactor: parseUnits("0", 18),
      liquidationThreshold: parseUnits("0", 18),
      liquidationIncentive: parseUnits("1.08", 18),
      borrowAllowed: true,
    },
    {
      address: vUSDC,
      collateralFactor: parseUnits("0.", 18),
      liquidationThreshold: parseUnits("0", 18),
      liquidationIncentive: parseUnits("1.08", 18),
      borrowAllowed: true,
    },
    {
      address: vPT_USDe_30Oct2025,
      collateralFactor: parseUnits("0.90", 18),
      liquidationThreshold: parseUnits("0.92", 18),
      liquidationIncentive: parseUnits("1.08", 18),
      borrowAllowed: false,
    },
  ],
};

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

const vTokensMinted = convertAmountToVTokens(marketSpecs.initialSupply.amount, marketSpecs.vToken.exchangeRate);
const vTokensRemaining = vTokensMinted.sub(marketSpecs.initialSupply.vTokensToBurn);

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

export const vip551 = () => {
  const meta = {
    version: "v2",
    title: "VIP-551 [BNB Chain] Add PT-USDe-30Oct2025 markets to the Core pool",
    description: "VIP-551 [BNB Chain] Add PT-USDe-30Oct2025 markets to the Core pool",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: MOCK_PENDLE_PT_ORACLE,
        signature: "setPtToSyRate(address,uint32,uint256)",
        params: ["0x0000000000000000000000000000000000000004", TWAP_DURATION, parseUnits("0.992132780932187177", 18)],
      },
      {
        target: bsctestnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            PT_USDe_30Oct2025,
            [PT_USDe_PENDLE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
      },
      {
        target: PT_USDe_PENDLE_ORACLE,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(
            PTUSDE30OCT2025_InitialExchangeRate,
            BigNumber.from(PTUSDE30OCT2025_SnapshotGap),
          ),
          PTUSDE30OCT2025_Timestamp,
        ],
      },
      {
        target: PT_USDe_PENDLE_ORACLE,
        signature: "setGrowthRate(uint256,uint256)",
        params: [PTUSDE30OCT2025_GrowthRate, DAYS_30],
      },
      {
        target: PT_USDe_PENDLE_ORACLE,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(PTUSDE30OCT2025_InitialExchangeRate, PTUSDE30OCT2025_SnapshotGap)],
      },

      // Add Market
      {
        target: marketSpecs.vToken.comptroller,
        signature: "_supportMarket(address)",
        params: [marketSpecs.vToken.address],
      },
      {
        target: marketSpecs.vToken.comptroller,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[marketSpecs.vToken.address], [marketSpecs.riskParameters.supplyCap]],
      },
      {
        target: marketSpecs.vToken.comptroller,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[marketSpecs.vToken.address], [marketSpecs.riskParameters.borrowCap]],
      },
      {
        target: marketSpecs.vToken.address,
        signature: "setAccessControlManager(address)",
        params: [bsctestnet.ACCESS_CONTROL_MANAGER],
      },
      {
        target: marketSpecs.vToken.address,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },
      {
        target: marketSpecs.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [REDUCE_RESERVES_BLOCK_DELTA],
      },
      {
        target: marketSpecs.vToken.address,
        signature: "_setReserveFactor(uint256)",
        params: [marketSpecs.riskParameters.reserveFactor],
      },
      {
        target: marketSpecs.vToken.comptroller,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [
          marketSpecs.vToken.address,
          marketSpecs.riskParameters.collateralFactor,
          marketSpecs.riskParameters.liquidationThreshold,
        ],
      },
      {
        target: marketSpecs.vToken.comptroller,
        signature: "setLiquidationIncentive(address,uint256)",
        params: [marketSpecs.vToken.address, marketSpecs.riskParameters.liquidationIncentive],
      },
      {
        target: PT_USDe_30Oct2025,
        signature: "faucet(uint256)",
        params: [marketSpecs.initialSupply.amount],
      },
      {
        target: marketSpecs.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [marketSpecs.vToken.address, marketSpecs.initialSupply.amount],
      },
      {
        target: marketSpecs.vToken.address,
        signature: "mint(uint256)",
        params: [marketSpecs.initialSupply.amount],
      },
      {
        target: marketSpecs.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [marketSpecs.vToken.address, 0],
      },
      // Burn some vTokens
      {
        target: marketSpecs.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, marketSpecs.initialSupply.vTokensToBurn],
      },
      // Transfer leftover vTokens to receiver
      {
        target: marketSpecs.vToken.address,
        signature: "transfer(address,uint256)",
        params: [marketSpecs.initialSupply.vTokenReceiver, vTokensRemaining],
      },

      // Configure convertersp
      ...configureConverters([PT_USDe_30Oct2025]),

      // Add markets to Stablecoins emode
      {
        target: bsctestnet.UNITROLLER,
        signature: "addPoolMarkets(uint96[],address[])",
        params: [Array(EMODE_POOL_SPECS.markets.length).fill(EMODE_POOL_SPECS.id), EMODE_POOL_SPECS.markets],
      },

      ...EMODE_POOL_SPECS.marketsConfig.map(market => {
        return {
          target: bsctestnet.UNITROLLER,
          signature: "setCollateralFactor(uint96,address,uint256,uint256)",
          params: [EMODE_POOL_SPECS.id, market.address, market.collateralFactor, market.liquidationThreshold],
        };
      }),
      ...EMODE_POOL_SPECS.marketsConfig.map(market => {
        return {
          target: bsctestnet.UNITROLLER,
          signature: "setLiquidationIncentive(uint96,address,uint256)",
          params: [EMODE_POOL_SPECS.id, market.address, market.liquidationIncentive],
        };
      }),
      ...EMODE_POOL_SPECS.marketsConfig.map(market => {
        return {
          target: bsctestnet.UNITROLLER,
          signature: "setIsBorrowAllowed(uint96,address,bool)",
          params: [EMODE_POOL_SPECS.id, market.address, market.borrowAllowed],
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip551;
