import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, CHAINLINK_ORACLE, RESILIENT_ORACLE } = NETWORK_ADDRESSES["zksyncsepolia"];

export const COMPTROLLER = "0xC527DE08E43aeFD759F7c0e6aE85433923064669";
export const CHAINLINK_STALE_PERIOD = 26 * 60 * 60; // 26 hours
export const WUSDM_ERC4626_ORACLE = "0xf1dD9549556F3fae6d8bf4F3283b1D9d2bfb996B";

export const tokens = {
  USDM: {
    address: "0x5d5334dBa9C727eD81b549b6106aE37Ea137076D",
    decimals: 18,
    symbol: "USDM",
  },
  wUSDM: {
    address: "0x0b3C8fB109f144f6296bF4Ac52F191181bEa003a",
    decimals: 18,
    symbol: "wUSDM",
  },
};

export const newMarket = {
  vToken: {
    address: "0x63abcB1f579dB71b4b8A1E182adbA2F131b75681",
    name: "Venus wUSDM (Core)",
    symbol: "vwUSDM_Core",
    underlying: tokens["wUSDM"],
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.75", 18),
    liquidationThreshold: parseUnits("0.78", 18),
    supplyCap: parseUnits("5000000", 18),
    borrowCap: parseUnits("4000000", 18),
    reserveFactor: parseUnits("0.25", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("10000", 18),
    vTokenReceiver: VTREASURY,
  },
  interestRateModel: {
    address: "0xCD6f2137182affDA1883135C3351D556721B81dE",
    base: "0",
    multiplier: "0.06875",
    jump: "2.5",
    kink: "0.8",
  },
};

export const FIXED_STABLECOIN_PRICE = parseUnits("1.1", 18);

const vip429 = () => {
  const meta = {
    version: "v2",
    title: "wUSDM market ok ZKsync sepolia - Core pool",
    description: `wUSDM market ok ZKsync sepolia - Core pool`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Oracle config
      {
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [tokens["USDM"].address, FIXED_STABLECOIN_PRICE],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            tokens["USDM"].address,
            [CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            tokens["wUSDM"].address,
            [WUSDM_ERC4626_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.zksyncsepolia,
      },

      // Market
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
      {
        target: newMarket.vToken.address,
        signature: "setProtocolSeizeShare(uint256)",
        params: [newMarket.riskParameters.protocolSeizeShare],
        dstChainId: LzChainId.zksyncsepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip429;
