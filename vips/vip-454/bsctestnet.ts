import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const baseAddresses = NETWORK_ADDRESSES["basesepolia"];
const zksyncAddresses = NETWORK_ADDRESSES["zksyncsepolia"];

export const COMPTROLLER_CORE_BASE = "0x272795dd6c5355CF25765F36043F34014454Eb5b";
export const wstETH_ONE_JUMP_ORACLE_BASE = "0x71e7AAcb01C5764A56DB92aa31aA473e839d964F";
export const COMPTROLLER_CORE_ZKSYNC = "0xC527DE08E43aeFD759F7c0e6aE85433923064669";
export const wstETH_ONE_JUMP_ORACLE_ZKSYNC = "0x832AafFeeD5EC923489744CE37fB35f4F533284e";

type Token = {
  address: string;
  decimals: number;
  symbol: string;
};

export const wstETHBase = {
  address: "0xAd69AA3811fE0EE7dBd4e25C4bae40e6422c76C8",
  decimals: 18,
  symbol: "wstETH",
};

export const wstETHZksync = {
  address: "0x8507bb4F4f0915D05432011E384850B65a7FCcD1",
  decimals: 18,
  symbol: "wstETH",
};

type Market = {
  vToken: {
    address: string;
    name: string;
    symbol: string;
    underlying: Token;
    decimals: number;
    exchangeRate: BigNumber;
    comptroller: string;
  };
  riskParameters: {
    collateralFactor: BigNumber;
    liquidationThreshold: BigNumber;
    supplyCap: BigNumber;
    borrowCap: BigNumber;
    reserveFactor: BigNumber;
    protocolSeizeShare: BigNumber;
  };
  initialSupply: {
    amount: BigNumber;
    vTokenReceiver: string;
  };
  interestRateModel: {
    address: string;
    base: string;
    multiplier: string;
    jump: string;
    kink: string;
  };
};

export const baseMarket: Market = {
  vToken: {
    address: "0x40A30E1B01e0CF3eE3F22f769b0E437160550eEa",
    name: "Venus wstETH (Core)",
    symbol: "vwstETH_Core",
    underlying: wstETHBase,
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE_BASE,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.785", 18),
    liquidationThreshold: parseUnits("0.81", 18),
    supplyCap: parseUnits("26000", 18),
    borrowCap: parseUnits("260", 18),
    reserveFactor: parseUnits("0.25", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("2.5", 18),
    vTokenReceiver: baseAddresses.VTREASURY,
  },
  interestRateModel: {
    address: "0x43B1cF9AFA734F04d395Db87c593c75c2701Ea49",
    base: "0",
    multiplier: "0.09",
    jump: "3",
    kink: "0.45",
  },
};

export const zksyncMarket = {
  vToken: {
    address: "0x853ed4e6ab3a6747d71Bb79eDbc0A64FF87D31BF",
    name: "Venus wstETH (Core)",
    symbol: "vwstETH_Core",
    underlying: wstETHZksync,
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE_ZKSYNC,
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
    amount: parseUnits("2.5", 18),
    vTokenReceiver: zksyncAddresses.VTREASURY,
  },
  interestRateModel: {
    address: "0x41113B64774a5980bCC09011855756775A297876",
    base: "0",
    multiplier: "0.09",
    jump: "3",
    kink: "0.45",
  },
};

const FIXED_STABLECOIN_PRICE = parseUnits("1.1", 18);

const vip454 = () => {
  const meta = {
    version: "v2",
    title: "VIP-454 New vwstETH_Core baseMarket in the Core pool",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: baseAddresses.CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [wstETHBase.address, FIXED_STABLECOIN_PRICE],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: baseAddresses.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            wstETHBase.address,
            [wstETH_ONE_JUMP_ORACLE_BASE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: baseMarket.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: wstETHBase.address,
        signature: "faucet(uint256)",
        params: [baseMarket.initialSupply.amount],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: baseMarket.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [baseAddresses.POOL_REGISTRY, baseMarket.initialSupply.amount],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: baseAddresses.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            baseMarket.vToken.address,
            baseMarket.riskParameters.collateralFactor,
            baseMarket.riskParameters.liquidationThreshold,
            baseMarket.initialSupply.amount,
            baseMarket.initialSupply.vTokenReceiver,
            baseMarket.riskParameters.supplyCap,
            baseMarket.riskParameters.borrowCap,
          ],
        ],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: baseMarket.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [baseAddresses.POOL_REGISTRY, 0],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: zksyncAddresses.CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [wstETHZksync.address, FIXED_STABLECOIN_PRICE],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: zksyncAddresses.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            wstETHZksync.address,
            [wstETH_ONE_JUMP_ORACLE_ZKSYNC, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: zksyncMarket.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: zksyncMarket.vToken.underlying.address,
        signature: "faucet(uint256)",
        params: [zksyncMarket.initialSupply.amount],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: zksyncMarket.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [zksyncAddresses.POOL_REGISTRY, zksyncMarket.initialSupply.amount],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: zksyncAddresses.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            zksyncMarket.vToken.address,
            zksyncMarket.riskParameters.collateralFactor,
            zksyncMarket.riskParameters.liquidationThreshold,
            zksyncMarket.initialSupply.amount,
            zksyncMarket.initialSupply.vTokenReceiver,
            zksyncMarket.riskParameters.supplyCap,
            zksyncMarket.riskParameters.borrowCap,
          ],
        ],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: zksyncMarket.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [zksyncAddresses.POOL_REGISTRY, 0],
        dstChainId: LzChainId.zksyncsepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip454;
