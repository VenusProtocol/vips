import { BigNumber, ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { RESILIENT_ORACLE, REDSTONE_ORACLE } = NETWORK_ADDRESSES.bsctestnet;

const bsctestnet = NETWORK_ADDRESSES.bsctestnet;
export const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const MOCKU = "0x180Bc1a9843A65D4116e44886FD3558515a56A49";
export const vU = "0x93969F17d4c1C7B22000eA26D5C2766E0f616D90";
export const RATE_MODEL = "0x27670709C5CD7EA594a887Af5D4eBA926F36c561"; // two-kinks
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";

export const UMarketSpec = {
  vToken: {
    address: vU,
    name: "Venus United Stables",
    symbol: "vU",
    underlying: {
      address: MOCKU,
      decimals: 18,
      symbol: "U",
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: bsctestnet.UNITROLLER,
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
    vTokenReceiver: bsctestnet.VTREASURY,
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
    title: "VIP-795 [BNB Chain] Add U market to the Core pool",
    description: "VIP-795 [BNB Chain] Add U market to the Core pool",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Configure Oracle
      {
        target: REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [UMarketSpec.vToken.underlying.address, parseUnits("1", 18)],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            UMarketSpec.vToken.underlying.address,
            [REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
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
        params: [bsctestnet.ACCESS_CONTROL_MANAGER],
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
        target: MOCKU,
        signature: "faucet(uint256)",
        params: [UMarketSpec.initialSupply.amount],
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
      // Burn some vTokens
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
