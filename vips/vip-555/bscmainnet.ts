import { BigNumber, BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;
export const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const slisBNB = "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B";
export const vslisBNB = "0x89c910Eb8c90df818b4649b508Ba22130Dc73Adc";
export const RATE_MODEL = "0x68Cb22f8664546E19B7BfCC4F86Fd0fCbDd0b02e";
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
    supplyCap: parseUnits("3000", 18),
    borrowCap: parseUnits("0", 18),
  },
  initialSupply: {
    amount: parseUnits("0.1", 18),
    vTokenReceiver: bscmainnet.VTREASURY,
    vTokensToBurn: parseUnits("0.1", 8),
  },
};

// BNB emode group
export const vWBNB = "0x6bCa74586218dB34cdB402295796b79663d816e9";
export const vasBNB = "0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF";
export const EMODE_POOL = {
  label: "BNB",
  id: 3,
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
      {
        target: marketSpecs.vToken.comptroller,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[marketSpecs.vToken.address], [2], true], // Pause Borrow actions
      },

      // BNB Emode Group
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
          EMODE_POOL.marketsConfig.vasBNB.address,
          EMODE_POOL.marketsConfig.vasBNB.collateralFactor,
          EMODE_POOL.marketsConfig.vasBNB.liquidationThreshold,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketsConfig.vslisBNB.address,
          EMODE_POOL.marketsConfig.vslisBNB.collateralFactor,
          EMODE_POOL.marketsConfig.vslisBNB.liquidationThreshold,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketsConfig.vWBNB.address,
          EMODE_POOL.marketsConfig.vWBNB.liquidationIncentive,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketsConfig.vasBNB.address,
          EMODE_POOL.marketsConfig.vasBNB.liquidationIncentive,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketsConfig.vslisBNB.address,
          EMODE_POOL.marketsConfig.vslisBNB.liquidationIncentive,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [EMODE_POOL.id, EMODE_POOL.marketsConfig.vWBNB.address, EMODE_POOL.marketsConfig.vWBNB.borrowAllowed],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setAllowCorePoolFallback(uint96,bool)",
        params: [EMODE_POOL.id, EMODE_POOL.allowCorePoolFallback],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip555;
