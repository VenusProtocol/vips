import { BigNumber, BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;
export const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const PT_clisBNB_25JUN2026 = "0xe052823b4aefc6e230FAf46231A57d0905E30AE0";
export const vPT_clisBNB_25JUN2026 = "0x6d3BD68E90B42615cb5abF4B8DE92b154ADc435e";
export const RATE_MODEL = "0x6463ab803FF081616ac4daC31B9B66854cc28Bc0";
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";
export const PT_clisBNB_PENDLE_ORACLE = "0x0FfFBb55d51cD46cD10C7dc865Dc73BD76201310";

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
export const PTCLISBNB25JUN2026_InitialExchangeRate = parseUnits("1.034146782295294254", 18);
export const PTCLISBNB25JUN2026_Timestamp = 1768293952;
export const PTCLISBNB25JUN2026_GrowthRate = SECONDS_PER_YEAR; // 0% per year
export const PTCLISBNB25JUN2026_SnapshotGap = 400; // 4.00%

export const converterBaseAssets = {
  [RISK_FUND_CONVERTER]: USDT,
  [USDT_PRIME_CONVERTER]: USDT,
  [USDC_PRIME_CONVERTER]: USDC,
  [BTCB_PRIME_CONVERTER]: BTCB,
  [ETH_PRIME_CONVERTER]: ETH,
  [XVS_VAULT_CONVERTER]: XVS,
  [WBNB_BURN_CONVERTER]: WBNB,
};

export const marketSpecs = {
  vToken: {
    address: vPT_clisBNB_25JUN2026,
    name: "Venus PT Lista collateral BNB 25JUN2026",
    symbol: "vPT-clisBNB-25JUN2026",
    underlying: {
      address: PT_clisBNB_25JUN2026,
      decimals: 18,
      symbol: "PT-clisBNB-25JUN2026",
    },
    decimals: 8,
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
  riskParameters: {
    collateralFactor: parseUnits("0", 18),
    liquidationThreshold: parseUnits("0", 18),
    liquidationIncentive: parseUnits("1", 18),
    reserveFactor: parseUnits("0", 18),
    supplyCap: parseUnits("25000", 18),
    borrowCap: parseUnits("0", 18),
  },
  initialSupply: {
    amount: parseUnits("0.14", 18),
    vTokenReceiver: bscmainnet.VTREASURY,
    vTokensToBurn: parseUnits("0.1", 8),
  },
};

// BNB emode group
export const EMODE_POOL = {
  label: "BNB",
  id: 3,
  markets: [vPT_clisBNB_25JUN2026],
  allowCorePoolFallback: true,
  marketsConfig: {
    vPT_clisBNB_25JUN2026: {
      address: vPT_clisBNB_25JUN2026,
      collateralFactor: parseUnits("0.87", 18),
      liquidationThreshold: parseUnits("0.90", 18),
      liquidationIncentive: parseUnits("1.04", 18),
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

export const vip790 = () => {
  const meta = {
    version: "v2",
    title: "VIP-790 [BNB Chain] Add PT-slisBNBx-24JUN2026 market to the BNB emode group",
    description: "VIP-790 [BNB Chain] BNB emode group",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Add Market
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            PT_clisBNB_25JUN2026,
            [PT_clisBNB_PENDLE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
      },
      {
        target: PT_clisBNB_PENDLE_ORACLE,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(
            PTCLISBNB25JUN2026_InitialExchangeRate,
            BigNumber.from(PTCLISBNB25JUN2026_SnapshotGap),
          ),
          PTCLISBNB25JUN2026_Timestamp,
        ],
      },
      {
        target: PT_clisBNB_PENDLE_ORACLE,
        signature: "setGrowthRate(uint256,uint256)",
        params: [PTCLISBNB25JUN2026_GrowthRate, DAYS_30],
      },
      {
        target: PT_clisBNB_PENDLE_ORACLE,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(PTCLISBNB25JUN2026_InitialExchangeRate, PTCLISBNB25JUN2026_SnapshotGap)],
      },
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
        params: [ACM],
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
      // {
      //   target: bscmainnet.VTREASURY,
      //   signature: "withdrawTreasuryBEP20(address,uint256,address)",
      //   params: [marketSpecs.vToken.underlying.address, marketSpecs.initialSupply.amount, bscmainnet.NORMAL_TIMELOCK],
      // },
      // {
      //   target: marketSpecs.vToken.underlying.address,
      //   signature: "approve(address,uint256)",
      //   params: [marketSpecs.vToken.address, marketSpecs.initialSupply.amount],
      // },
      //   {
      //     target: marketSpecs.vToken.address,
      //     signature: "mint(uint256)",
      //     params: [marketSpecs.initialSupply.amount],
      //   },
      // {
      //   target: marketSpecs.vToken.underlying.address,
      //   signature: "approve(address,uint256)",
      //   params: [marketSpecs.vToken.address, 0],
      // },
      // // Burn some vTokens
      // {
      //   target: marketSpecs.vToken.address,
      //   signature: "transfer(address,uint256)",
      //   params: [ethers.constants.AddressZero, marketSpecs.initialSupply.vTokensToBurn],
      // },
      // // Transfer leftover vTokens to receiver
      // {
      //   target: marketSpecs.vToken.address,
      //   signature: "transfer(address,uint256)",
      //   params: [marketSpecs.initialSupply.vTokenReceiver, vTokensRemaining],
      // },
      {
        target: marketSpecs.vToken.comptroller,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[marketSpecs.vToken.address], [2], true], // Pause Borrow actions
      },

      // // Configure converters
      ...configureConverters([marketSpecs.vToken.underlying.address]),

      // // BNB Emode Group
      {
        target: bscmainnet.UNITROLLER,
        signature: "setPoolActive(uint96,bool)",
        params: [EMODE_POOL.id, true],
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
          EMODE_POOL.marketsConfig.vPT_clisBNB_25JUN2026.address,
          EMODE_POOL.marketsConfig.vPT_clisBNB_25JUN2026.collateralFactor,
          EMODE_POOL.marketsConfig.vPT_clisBNB_25JUN2026.liquidationThreshold,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketsConfig.vPT_clisBNB_25JUN2026.address,
          EMODE_POOL.marketsConfig.vPT_clisBNB_25JUN2026.liquidationIncentive,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketsConfig.vPT_clisBNB_25JUN2026.address,
          EMODE_POOL.marketsConfig.vPT_clisBNB_25JUN2026.borrowAllowed,
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip790;
