import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { RESILIENT_ORACLE, CHAINLINK_ORACLE } = NETWORK_ADDRESSES.bscmainnet;
const bscmainnet = NETWORK_ADDRESSES.bscmainnet;
export const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";
export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666";
export const VU = "0x3d5E269787d562b74aCC55F18Bd26C5D09Fa245E";
export const RATE_MODEL = "0x846883aC2AFdaeF9d226182e82f3640d3D6D4d3f";
export const REDUCE_RESERVES_BLOCK_DELTA = "115200"; // 42048000 blocks per year (Before Fermi upgrade)
export const USDT_CHAINLINK_FEED = "0xB97Ad0E74fa7d920791E90258A6E2085088b4320";

// Oracle configuration
export const CHAINLINK_MAX_STALE_PERIOD = 93600; // 26 hours
const UPPER_BOUND_RATIO = parseUnits("1.02", 18); // 2% upper bound
const LOWER_BOUND_RATIO = parseUnits("0.98", 18); // 2% lower bound

export const UMarketSpec = {
  vToken: {
    address: VU,
    name: "Venus United Stables",
    symbol: "vU",
    underlying: {
      address: U,
      decimals: 18,
      symbol: "U",
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: bscmainnet.UNITROLLER,
    isLegacyPool: true,
  },
  interestRateModel: {
    model: "two-kinks",
    baseRatePerYear: "0",
    multiplierPerYear: "0.0625",
    kink: "0.8",
    baseRatePerYear2: "0",
    multiplierPerYear2: "0.6",
    kink2: "0.9",
    jumpMultiplierPerYear: "3.4",
  },
  riskParameters: {
    collateralFactor: parseUnits("0.75", 18),
    liquidationThreshold: parseUnits("0.75", 18),
    liquidationIncentive: parseUnits("1.1", 18),
    reserveFactor: parseUnits("0.1", 18),
    supplyCap: parseUnits("20000000", 18),
    borrowCap: parseUnits("20000000", 18),
  },
  initialSupply: {
    amount: parseUnits("100", 18),
    vTokenReceiver: bscmainnet.VTREASURY,
    vTokensToBurn: parseUnits("10", 8),
  },
};

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

const vTokensMinted = convertAmountToVTokens(UMarketSpec.initialSupply.amount, UMarketSpec.vToken.exchangeRate);
const vTokensRemaining = vTokensMinted.sub(UMarketSpec.initialSupply.vTokensToBurn);

export const vip795 = () => {
  const meta = {
    version: "v2",
    title: "VIP-795 [BNB Chain] Add U market to the Core Pool",
    description: "VIP-795 [BNB Chain] Add U market to the Core Pool",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Configure Oracle
      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[U, USDT_CHAINLINK_FEED, CHAINLINK_MAX_STALE_PERIOD]],
      },
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfig((address,uint256,uint256))",
        params: [[U, UPPER_BOUND_RATIO, LOWER_BOUND_RATIO]],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [[U, [CHAINLINK_ORACLE, CHAINLINK_ORACLE, ethers.constants.AddressZero], [true, true, false], false]],
      },
      // Add Market
      {
        target: UMarketSpec.vToken.comptroller,
        signature: "_supportMarket(address)",
        params: [UMarketSpec.vToken.address],
      },
      {
        target: UMarketSpec.vToken.comptroller,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[UMarketSpec.vToken.address], [UMarketSpec.riskParameters.supplyCap]],
      },
      {
        target: UMarketSpec.vToken.comptroller,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[UMarketSpec.vToken.address], [UMarketSpec.riskParameters.borrowCap]],
      },
      {
        target: UMarketSpec.vToken.address,
        signature: "setAccessControlManager(address)",
        params: [bscmainnet.ACCESS_CONTROL_MANAGER],
      },
      {
        target: UMarketSpec.vToken.address,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },
      {
        target: UMarketSpec.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [REDUCE_RESERVES_BLOCK_DELTA],
      },
      {
        target: UMarketSpec.vToken.address,
        signature: "_setReserveFactor(uint256)",
        params: [UMarketSpec.riskParameters.reserveFactor],
      },
      {
        target: UMarketSpec.vToken.comptroller,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [
          UMarketSpec.vToken.address,
          UMarketSpec.riskParameters.collateralFactor,
          UMarketSpec.riskParameters.liquidationThreshold,
        ],
      },
      {
        target: UMarketSpec.vToken.comptroller,
        signature: "setLiquidationIncentive(address,uint256)",
        params: [UMarketSpec.vToken.address, UMarketSpec.riskParameters.liquidationIncentive],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [UMarketSpec.vToken.underlying.address, UMarketSpec.initialSupply.amount, bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: UMarketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [UMarketSpec.vToken.address, UMarketSpec.initialSupply.amount],
      },
      {
        target: UMarketSpec.vToken.address,
        signature: "mint(uint256)",
        params: [UMarketSpec.initialSupply.amount],
      },
      {
        target: UMarketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [UMarketSpec.vToken.address, 0],
      },
      // Burn some vtokens
      {
        target: UMarketSpec.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, UMarketSpec.initialSupply.vTokensToBurn],
      },
      // Transfer leftover vTokens to receiver
      {
        target: UMarketSpec.vToken.address,
        signature: "transfer(address,uint256)",
        params: [UMarketSpec.initialSupply.vTokenReceiver, vTokensRemaining],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip795;
