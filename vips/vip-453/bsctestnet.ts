import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, CHAINLINK_ORACLE, RESILIENT_ORACLE } = NETWORK_ADDRESSES["zksyncsepolia"];

export const COMPTROLLER_CORE = "0xC527DE08E43aeFD759F7c0e6aE85433923064669";
export const wstETH_ONE_JUMP_ORACLE = "0x832AafFeeD5EC923489744CE37fB35f4F533284e";

// Core Pool configuration
export const token = {
  wstETH: {
    address: "0x8507bb4F4f0915D05432011E384850B65a7FCcD1",
    decimals: 18,
    symbol: "wstETH",
  },
};

export const newMarket = {
  vToken: {
    address: "0x853ed4e6ab3a6747d71Bb79eDbc0A64FF87D31BF",
    name: "Venus wstETH (Core)",
    symbol: "vwstETH_Core",
    underlying: token["wstETH"],
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.71", 18),
    liquidationThreshold: parseUnits("0.76", 18),
    supplyCap: parseUnits("350", 18),
    borrowCap: parseUnits("35", 18),
    reserveFactor: parseUnits("0.25", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("10000", 18),
    vTokenReceiver: VTREASURY,
  },
  interestRateModel: {
    address: "0x41113B64774a5980bCC09011855756775A297876",
    base: "0",
    multiplier: "0.09",
    jump: "3",
    kink: "0.45",
  },
};

export const FIXED_STABLECOIN_PRICE = parseUnits("1.1", 18);
const STALE_PERIOD_26H = 26 * 60 * 60; // 26 hours (pricefeeds with heartbeat of 24 hr)
const ETH_USD_FEED = "0xfEefF7c3fB57d18C5C6Cdd71e45D2D0b4F9377bF";
const vip453 = () => {
  const meta = {
    version: "v2",
    title: "VIP-453 [Zksync] New wstETH market in the Core pool",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [token["wstETH"].address, FIXED_STABLECOIN_PRICE],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            token["wstETH"].address,
            [wstETH_ONE_JUMP_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[token["wstETH"].address, ETH_USD_FEED, STALE_PERIOD_26H]],
      },
      {
        target: newMarket.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: newMarket.vToken.address,
        signature: "setReserveFactor(uint256)",
        params: [newMarket.riskParameters.reserveFactor],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: newMarket.vToken.address,
        signature: "setProtocolSeizeShare(uint256)",
        params: [newMarket.riskParameters.protocolSeizeShare],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: newMarket.vToken.underlying.address,
        signature: "faucet(uint256)",
        params: [newMarket.initialSupply.amount],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: newMarket.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, newMarket.initialSupply.amount],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
              target: POOL_REGISTRY,
              signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
              params: [
                [
                  newMarket.vToken.address,
                  newMarket.riskParameters.collateralFactor,
                  newMarket.riskParameters.liquidationThreshold,
                  newMarket.initialSupply.amount,
                  newMarket.initialSupply.vTokenReceiver,
                  newMarket.riskParameters.supplyCap,
                  newMarket.riskParameters.borrowCap,
                ],
              ],
              dstChainId: LzChainId.zksyncsepolia,
            },
      {
        target: newMarket.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
        dstChainId: LzChainId.zksyncsepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip453;
