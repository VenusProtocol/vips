import { BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { NORMAL_TIMELOCK } from "src/vip-framework";

const { VTREASURY, RESILIENT_ORACLE, REDSTONE_ORACLE, UNITROLLER, ACCESS_CONTROL_MANAGER } =
  NETWORK_ADDRESSES.bscmainnet;
export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const SOLVBTC = "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7";
const SOLVBTC_VTOKEN = "0xf841cb62c19fCd4fF5CD0AaB5939f3140BaaC3Ea";
export const SOLVBTC_REDSTONE_FEED = "0xF5F641fF3c7E39876A76e77E84041C300DFa4550";
const SOLVBTC_MAX_STALE_PERIOD = 7 * 3600; // 7 hours
const REDUCE_RESERVES_BLOCK_DELTA = "28800";

const USDT = "0x55d398326f99059fF775485246999027B3197955";
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

export const EXPECTED_CONVERSION_INCENTIVE = 1e14;
export const converterBaseAssets = {
  [RISK_FUND_CONVERTER]: USDT,
  [USDT_PRIME_CONVERTER]: USDT,
  [USDC_PRIME_CONVERTER]: USDC,
  [BTCB_PRIME_CONVERTER]: BTCB,
  [ETH_PRIME_CONVERTER]: ETH,
  [XVS_VAULT_CONVERTER]: XVS,
};

const configureConverters = (fromAssets: string[], incentive: BigNumberish = EXPECTED_CONVERSION_INCENTIVE) => {
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

export const marketSpec = {
  vToken: {
    address: SOLVBTC_VTOKEN,
    name: "Venus SolvBTC",
    symbol: "vSolvBTC",
    underlying: {
      address: SOLVBTC,
      decimals: 18,
      symbol: "SolvBTC",
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: UNITROLLER,
    isLegacyPool: true,
  },
  interestRateModel: {
    address: "0xf092558eD27Df036144f6d92cC657BAc9682A324",
    base: "0",
    multiplier: "0.09",
    jump: "2",
    kink: "0.5",
  },
  initialSupply: {
    amount: parseUnits("0.1572404", 18),
    vTokenReceiver: "0xD5bAa0C3d61Ba3f4899565f269e5f9b186AAf14B",
  },
  riskParameters: {
    supplyCap: parseUnits("100", 18),
    borrowCap: parseUnits("55", 18),
    collateralFactor: parseUnits("0.75", 18),
    reserveFactor: parseUnits("0.2", 18),
  },
};

export const vip400 = () => {
  const meta = {
    version: "v2",
    title: "VIP-400",
    description: ``,
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
        params: [[marketSpec.vToken.underlying.address, SOLVBTC_REDSTONE_FEED, SOLVBTC_MAX_STALE_PERIOD]],
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
        target: marketSpec.vToken.comptroller,
        signature: "_setCollateralFactor(address,uint256)",
        params: [marketSpec.vToken.address, marketSpec.riskParameters.collateralFactor],
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

      // Mint initial supply
      {
        target: VTREASURY,
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
        params: [marketSpec.initialSupply.vTokenReceiver, marketSpec.initialSupply.amount],
      },
      {
        target: marketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [marketSpec.vToken.address, 0],
      },

      ...configureConverters([marketSpec.vToken.underlying.address]),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip400;
