import { BigNumber, BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;
export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
export const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const slisBNB = "0xd2aF6A916Bc77764dc63742BC30f71AF4cF423F4";
export const vslisBNB = "0xaB5504A3cde0d8253E8F981D663c7Ff7128B3e56";
export const RATE_MODEL = "0x2aFDF0f2377158cD45C12f4a5c70269baF15fcc5";
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";

// Converters
const ETH = "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7";
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
const BTCB = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
const XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";
const WBNB = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
const WBNB_BURN_CONVERTER = "0x42DBA48e7cCeB030eC73AaAe29d4A3F0cD4facba";
const RISK_FUND_CONVERTER = "0x32Fbf7bBbd79355B86741E3181ef8c1D9bD309Bb";
const USDT_PRIME_CONVERTER = "0xf1FA230D25fC5D6CAfe87C5A6F9e1B17Bc6F194E";
const USDC_PRIME_CONVERTER = "0x2ecEdE6989d8646c992344fF6C97c72a3f811A13";
const BTCB_PRIME_CONVERTER = "0x989A1993C023a45DA141928921C0dE8fD123b7d1";
const ETH_PRIME_CONVERTER = "0xf358650A007aa12ecC8dac08CF8929Be7f72A4D9";
const XVS_VAULT_CONVERTER = "0x258f49254C758a0E37DAb148ADDAEA851F4b02a2";
export const CONVERSION_INCENTIVE = 1e14;

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
    address: vslisBNB,
    name: "Venus slisBNB",
    symbol: "vslisBNB",
    underlying: {
      address: slisBNB,
      decimals: 18,
      symbol: "slisBNB",
    },
    decimals: 8,
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
  riskParameters: {
    collateralFactor: parseUnits("0", 18),
    liquidationThreshold: parseUnits("0", 18),
    liquidationIncentive: parseUnits("1", 18),
    reserveFactor: parseUnits("0", 18),
    supplyCap: parseUnits("3000", 18),
    borrowCap: parseUnits("0", 18),
  },
  initialSupply: {
    amount: parseUnits("0.1", 18),
    vTokenReceiver: bsctestnet.VTREASURY,
    vTokensToBurn: parseUnits("0.1", 8),
  },
};

// BNB emode group
export const vWBNB = "0xd9E77847ec815E56ae2B9E69596C69b6972b0B1C";
export const vasBNB = "0x73F506Aefd5e169D48Ea21A373B9B0a200E37585";
export const EMODE_POOL = {
  label: "BNB",
  id: 4,
  markets: [vWBNB, vasBNB, vslisBNB],
  allowCorePoolFallback: true,
  marketsConfig: {
    vWBNB: {
      address: vWBNB,
      collateralFactor: parseUnits("0", 18),
      liquidationThreshold: parseUnits("0", 18),
      liquidationIncentive: parseUnits("1", 18),
      borrowAllowed: true,
    },
    vasBNB: {
      address: vasBNB,
      collateralFactor: parseUnits("0.87", 18),
      liquidationThreshold: parseUnits("0.9", 18),
      liquidationIncentive: parseUnits("1.025", 18),
      borrowAllowed: false,
    },
    vslisBNB: {
      address: vslisBNB,
      collateralFactor: parseUnits("0.90", 18),
      liquidationThreshold: parseUnits("0.93", 18),
      liquidationIncentive: parseUnits("1.025", 18),
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

export const vip555 = () => {
  const meta = {
    version: "v2",
    title: "VIP-555 [BNB Chain] BNB emode group",
    description: "VIP-555 [BNB Chain] BNB emode group",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
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
        target: slisBNB,
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
      {
        target: marketSpecs.vToken.comptroller,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[marketSpecs.vToken.address], [2], true], // Pause Borrow actions
      },

      // Configure converters
      ...configureConverters([slisBNB]),

      // BNB Emode Group
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
          EMODE_POOL.marketsConfig.vasBNB.address,
          EMODE_POOL.marketsConfig.vasBNB.collateralFactor,
          EMODE_POOL.marketsConfig.vasBNB.liquidationThreshold,
        ],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketsConfig.vslisBNB.address,
          EMODE_POOL.marketsConfig.vslisBNB.collateralFactor,
          EMODE_POOL.marketsConfig.vslisBNB.liquidationThreshold,
        ],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketsConfig.vWBNB.address,
          EMODE_POOL.marketsConfig.vWBNB.liquidationIncentive,
        ],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketsConfig.vasBNB.address,
          EMODE_POOL.marketsConfig.vasBNB.liquidationIncentive,
        ],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketsConfig.vslisBNB.address,
          EMODE_POOL.marketsConfig.vslisBNB.liquidationIncentive,
        ],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [EMODE_POOL.id, EMODE_POOL.marketsConfig.vWBNB.address, EMODE_POOL.marketsConfig.vWBNB.borrowAllowed],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setAllowCorePoolFallback(uint96,bool)",
        params: [EMODE_POOL.id, EMODE_POOL.allowCorePoolFallback],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip555;
