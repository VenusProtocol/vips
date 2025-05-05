import { BigNumber, BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const { RESILIENT_ORACLE, REDSTONE_ORACLE, UNITROLLER, ACCESS_CONTROL_MANAGER, VTREASURY, NORMAL_TIMELOCK } =
  NETWORK_ADDRESSES.bscmainnet;
export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const USD1 = "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d";
export const VUSD1 = "0x0C1DA220D301155b87318B90692Da8dc43B67340";
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";
export const USDE_REDSTONE_FEED = "0x0d9b42a2a73Ec528759701D0B70Ccf974a327EBb";
export const MAX_STALE_PERIOD = 25200; // 7 hours max stale period

// Converters
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const RISK_FUND_CONVERTER = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";
const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";
const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";
const BTCB_PRIME_CONVERTER = "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53";
const ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";
const XVS_VAULT_CONVERTER = "0xd5b9AE835F4C59272032B3B954417179573331E0";
export const CONVERSION_INCENTIVE = 1e14;

// Refunds
export const VANGUARD_VANTAGE_TREASURY = "0xf645a387180F5F74b968305dF81d54EB328d21ca";
export const VANGUARD_VANTAGE_AMOUNT_USDT = parseUnits("5000", 18);

export const converterBaseAssets = {
  [RISK_FUND_CONVERTER]: USDT,
  [USDT_PRIME_CONVERTER]: USDT,
  [USDC_PRIME_CONVERTER]: USDC,
  [BTCB_PRIME_CONVERTER]: BTCB,
  [ETH_PRIME_CONVERTER]: ETH,
  [XVS_VAULT_CONVERTER]: XVS,
};

export const marketSpec = {
  vToken: {
    address: VUSD1,
    name: "Venus USD1",
    symbol: "vUSD1",
    underlying: {
      address: USD1,
      decimals: 18,
      symbol: "USD1",
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: UNITROLLER,
    isLegacyPool: true,
  },
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.1",
    jumpMultiplierPerYear: "2.5",
    kink: "0.8",
  },
  initialSupply: {
    amount: parseUnits("4988.032727667459257279", 18),
    vTokensToBurn: parseUnits("100", 8), // Approximately $100
    vTokenReceiver: VTREASURY,
  },
  riskParameters: {
    supplyCap: parseUnits("16000000", 18),
    borrowCap: parseUnits("14400000", 18),
    collateralFactor: parseUnits("0", 18),
    reserveFactor: parseUnits("0.25", 18),
  },
};

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

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

export const vip500 = () => {
  const meta = {
    version: "v2",
    title: "VIP-500 [BNB Chain] Add support for USD1 on Venus Core Pool",
    description: "",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Configure Oracle
      {
        target: REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[marketSpec.vToken.underlying.address, USDE_REDSTONE_FEED, MAX_STALE_PERIOD]],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            marketSpec.vToken.underlying.address,
            [REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
      },
      // Add Market
      {
        target: marketSpec.vToken.comptroller,
        signature: "_supportMarket(address)",
        params: [marketSpec.vToken.address],
      },
      {
        target: marketSpec.vToken.comptroller,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[marketSpec.vToken.address], [marketSpec.riskParameters.supplyCap]],
      },
      {
        target: marketSpec.vToken.comptroller,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[marketSpec.vToken.address], [marketSpec.riskParameters.borrowCap]],
      },
      {
        target: marketSpec.vToken.address,
        signature: "setAccessControlManager(address)",
        params: [ACCESS_CONTROL_MANAGER],
      },
      {
        target: marketSpec.vToken.address,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },
      {
        target: marketSpec.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [REDUCE_RESERVES_BLOCK_DELTA],
      },
      {
        target: marketSpec.vToken.address,
        signature: "_setReserveFactor(uint256)",
        params: [marketSpec.riskParameters.reserveFactor],
      },
      {
        target: marketSpec.initialSupply.vTokenReceiver,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [marketSpec.vToken.underlying.address, marketSpec.initialSupply.amount, NORMAL_TIMELOCK],
      },
      {
        target: marketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [marketSpec.vToken.address, marketSpec.initialSupply.amount],
      },
      {
        target: marketSpec.vToken.address,
        signature: "mintBehalf(address,uint256)",
        params: [NORMAL_TIMELOCK, marketSpec.initialSupply.amount],
      },
      {
        target: marketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [marketSpec.vToken.address, 0],
      },
      {
        target: marketSpec.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, marketSpec.initialSupply.vTokensToBurn],
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(marketSpec.initialSupply.amount, marketSpec.vToken.exchangeRate);
        const vTokensRemaining = vTokensMinted.sub(marketSpec.initialSupply.vTokensToBurn);
        return {
          target: marketSpec.vToken.address,
          signature: "transfer(address,uint256)",
          params: [marketSpec.initialSupply.vTokenReceiver, vTokensRemaining],
        };
      })(),
      {
        target: marketSpec.vToken.comptroller,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[marketSpec.vToken.address], [7], true],
      },
      ...configureConverters([marketSpec.vToken.underlying.address]),
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, VANGUARD_VANTAGE_AMOUNT_USDT, VANGUARD_VANTAGE_TREASURY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip500;
