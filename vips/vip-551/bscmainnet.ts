import { BigNumber, BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;
export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const PT_USDe_30OCT2025 = "0x607C834cfb7FCBbb341Cbe23f77A6E83bCf3F55c";
export const vPT_USDe_30OCT2025 = "0x6D0cDb3355c93A0cD20071aBbb3622731a95c73E";
export const RATE_MODEL = "0x6D7c746D4A9170F1731F89580414235dA47787fc";
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";
export const PT_USDe_PENDLE_ORACLE = "0xAa5138e86c078fd2859a929173B3870b5003EC30";
export const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";

// Converters
const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
const RISK_FUND_CONVERTER = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";
const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";
const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";
const BTCB_PRIME_CONVERTER = "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53";
const ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";
const XVS_VAULT_CONVERTER = "0xd5b9AE835F4C59272032B3B954417179573331E0";
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
    address: vPT_USDe_30OCT2025,
    name: "Venus PT-USDe-30OCT2025",
    symbol: "vPT-USDe-30OCT2025",
    underlying: {
      address: PT_USDe_30OCT2025,
      decimals: 18,
      symbol: "PT-USDe-30Oct2025",
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
    supplyCap: parseUnits("1000000", 18),
    borrowCap: parseUnits("0", 18),
  },
  initialSupply: {
    amount: parseUnits("100", 18),
    vTokenReceiver: bscmainnet.VTREASURY,
    vTokensToBurn: parseUnits("100", 8),
  },
};

// stablecoin emode group
export const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const EMODE_POOL_SPECS = {
  label: "Stablecoins",
  id: 1,
  markets: [vUSDT, vUSDC, vPT_USDe_30OCT2025],
  marketsConfig: {
    vUSDT: {
      address: vUSDT,
      collateralFactor: parseUnits("0", 18),
      liquidationThreshold: parseUnits("0", 18),
      liquidationIncentive: parseUnits("0", 18),
      borrowAllowed: true,
    },
    vUSDC: {
      address: vUSDC,
      collateralFactor: parseUnits("0", 18),
      liquidationThreshold: parseUnits("0", 18),
      liquidationIncentive: parseUnits("0", 18),
      borrowAllowed: true,
    },
    vPT_USDe: {
      address: vPT_USDe_30OCT2025,
      collateralFactor: parseUnits("0.90", 18),
      liquidationThreshold: parseUnits("0.92", 18),
      liquidationIncentive: parseUnits("1.08", 18),
      borrowAllowed: false,
    },
  },
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
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            PT_USDe_30OCT2025,
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
        params: [bscmainnet.ACCESS_CONTROL_MANAGER],
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
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [marketSpecs.vToken.underlying.address, marketSpecs.initialSupply.amount, bscmainnet.NORMAL_TIMELOCK],
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
      // Pause Borrow actions
      {
        target: marketSpecs.vToken.comptroller,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[marketSpecs.vToken.address], [2], true],
      },
      // Configure converters
      ...configureConverters([PT_USDe_30OCT2025]),

      // Add markets to Stablecoins emode
      {
        target: bscmainnet.UNITROLLER,
        signature: "addPoolMarkets(uint96[],address[])",
        params: [Array(EMODE_POOL_SPECS.markets.length).fill(EMODE_POOL_SPECS.id), EMODE_POOL_SPECS.markets],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [
          EMODE_POOL_SPECS.id,
          EMODE_POOL_SPECS.marketsConfig.vPT_USDe.address,
          EMODE_POOL_SPECS.marketsConfig.vPT_USDe.collateralFactor,
          EMODE_POOL_SPECS.marketsConfig.vPT_USDe.liquidationThreshold,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL_SPECS.id,
          EMODE_POOL_SPECS.marketsConfig.vPT_USDe.address,
          EMODE_POOL_SPECS.marketsConfig.vPT_USDe.liquidationIncentive,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [
          EMODE_POOL_SPECS.id,
          EMODE_POOL_SPECS.marketsConfig.vUSDT.address,
          EMODE_POOL_SPECS.marketsConfig.vUSDT.borrowAllowed,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [
          EMODE_POOL_SPECS.id,
          EMODE_POOL_SPECS.marketsConfig.vUSDC.address,
          EMODE_POOL_SPECS.marketsConfig.vUSDC.borrowAllowed,
        ],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bscmainnet.UNITROLLER, "_supportMarket(address)", bscmainnet.FAST_TRACK_TIMELOCK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip551;
