import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const NETWORK_ADDRESSES_BASE = NETWORK_ADDRESSES["basemainnet"];
const NETWORK_ADDRESSES_ZKSYNC = NETWORK_ADDRESSES["zksyncmainnet"];

export const COMPTROLLER_CORE_BASE = "0x0C7973F9598AA62f9e03B94E92C967fD5437426C";
export const COMPTROLLER_CORE_ZKSYNC = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";
export const CHAINLINK_STALE_PERIOD = 60 * 60 * 24; // 24 Hours
export const CHAINLINK_WSTETH_FEED_BASE = "0xB88BAc61a4Ca37C43a3725912B1f472c9A5bc061";
export const CHAINLINK_WSTETH_FEED_ZKSYNC = "0x24a0C9404101A8d7497676BE12F10aEa356bAC28";
export const WETH_ADDRESS_BASE = "0x4200000000000000000000000000000000000006";
export const wstETH_ONE_JUMP_ORACLE_BASE = "0x007e6Bd6993892b39210a7116506D6eA417B7565";
export const wstETH_ONE_JUMP_ORACLE_ZKSYNC = "0xd2b4352A3C1C452D9D4D11B4F19e28476128798f";
export const vTokenReceiverWstETH_BASE = "0x5A9d695c518e95CD6Ea101f2f25fC2AE18486A61";
export const vTokenReceiverWstETH_ZKSYNC = "0x65B05f4fCa066316383b0FE196C76C873a4dFD02";
type Token = {
  address: string;
  decimals: number;
  symbol: string;
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
    vTokensToBurn: BigNumber;
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

// Core Pool configuration BASE
export const token_BASE = {
  address: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452",
  decimals: 18,
  symbol: "wstETH",
};

// Core Pool configuration ZKSYNC
export const token_ZKSYNC = {
  wstETH: {
    address: "0x703b52F2b28fEbcB60E1372858AF5b18849FE867",
    decimals: 18,
    symbol: "wstETH",
  },
  WETH: {
    address: "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91",
    decimals: 18,
    symbol: "WETH",
  },
};

export const zksyncMarket: Market = {
  vToken: {
    address: "0x03CAd66259f7F34EE075f8B62D133563D249eDa4",
    name: "Venus wstETH (Core)",
    symbol: "vwstETH_Core",
    underlying: token_ZKSYNC["wstETH"],
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
    vTokenReceiver: vTokenReceiverWstETH_ZKSYNC,
    vTokensToBurn: parseUnits("0.0037", 8), // Approximately $10
  },
  interestRateModel: {
    address: "0x42053cb8Ee2cBbfCEDF423C79A50CF56c9C9424f",
    base: "0",
    multiplier: "0.09",
    jump: "3",
    kink: "0.45",
  },
};

export const baseMarket: Market = {
  vToken: {
    address: "0x133d3BCD77158D125B75A17Cb517fFD4B4BE64C5",
    name: "Venus wstETH (Core)",
    symbol: "vwstETH_Core",
    underlying: token_BASE,
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
    vTokensToBurn: parseUnits("0.0037", 8),
    vTokenReceiver: vTokenReceiverWstETH_BASE,
  },
  interestRateModel: {
    address: "0x527c29aAfB367fAd5AFf97855EBFAa610AA514CA",
    base: "0",
    multiplier: "0.09",
    jump: "3",
    kink: "0.45",
  },
};

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

const vip454 = (overrides: { chainlinkStalePeriod?: number }) => {
  const meta = {
    version: "v2",
    title: "VIP-454 [Base] New wstETH Market in the Core pool of Base and ZKSYNC",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  const chainlinkStalePeriod = overrides?.chainlinkStalePeriod || CHAINLINK_STALE_PERIOD;
  return makeProposal(
    [
      // BASE PROPOSAL
      {
        target: NETWORK_ADDRESSES_BASE["CHAINLINK_ORACLE"],
        signature: "setTokenConfig((address,address,uint256))",
        params: [[baseMarket.vToken.underlying.address, CHAINLINK_WSTETH_FEED_BASE, chainlinkStalePeriod]],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: NETWORK_ADDRESSES_BASE["RESILIENT_ORACLE"],
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            baseMarket.vToken.underlying.address,
            [wstETH_ONE_JUMP_ORACLE_BASE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: baseMarket.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: NETWORK_ADDRESSES_BASE["VTREASURY"],
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [
          baseMarket.vToken.underlying.address,
          baseMarket.initialSupply.amount,
          NETWORK_ADDRESSES_BASE["NORMAL_TIMELOCK"],
        ],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: baseMarket.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [NETWORK_ADDRESSES_BASE["POOL_REGISTRY"], baseMarket.initialSupply.amount],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: NETWORK_ADDRESSES_BASE["POOL_REGISTRY"],
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            baseMarket.vToken.address,
            baseMarket.riskParameters.collateralFactor,
            baseMarket.riskParameters.liquidationThreshold,
            baseMarket.initialSupply.amount,
            NETWORK_ADDRESSES_BASE["NORMAL_TIMELOCK"],
            baseMarket.riskParameters.supplyCap,
            baseMarket.riskParameters.borrowCap,
          ],
        ],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: baseMarket.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [NETWORK_ADDRESSES_BASE["POOL_REGISTRY"], 0],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: baseMarket.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, baseMarket.initialSupply.vTokensToBurn],
        dstChainId: LzChainId.basemainnet,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(baseMarket.initialSupply.amount, baseMarket.vToken.exchangeRate);
        const vTokensRemaining = vTokensMinted.sub(baseMarket.initialSupply.vTokensToBurn);
        return {
          target: baseMarket.vToken.address,
          signature: "transfer(address,uint256)",
          params: [baseMarket.initialSupply.vTokenReceiver, vTokensRemaining],
          dstChainId: LzChainId.basemainnet,
        };
      })(),
      // ZKSYNC PROPOSAL
      {
        target: NETWORK_ADDRESSES_ZKSYNC["CHAINLINK_ORACLE"],
        signature: "setTokenConfig((address,address,uint256))",
        params: [[token_ZKSYNC["wstETH"].address, CHAINLINK_WSTETH_FEED_ZKSYNC, chainlinkStalePeriod]],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: NETWORK_ADDRESSES_ZKSYNC["RESILIENT_ORACLE"],
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            token_ZKSYNC["wstETH"].address,
            [wstETH_ONE_JUMP_ORACLE_ZKSYNC, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },

      {
        target: zksyncMarket.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: NETWORK_ADDRESSES_ZKSYNC["VTREASURY"],
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [
          token_ZKSYNC["wstETH"].address,
          zksyncMarket.initialSupply.amount,
          NETWORK_ADDRESSES_ZKSYNC["NORMAL_TIMELOCK"],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: zksyncMarket.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [NETWORK_ADDRESSES_ZKSYNC["POOL_REGISTRY"], zksyncMarket.initialSupply.amount],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: NETWORK_ADDRESSES_ZKSYNC["POOL_REGISTRY"],
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            zksyncMarket.vToken.address,
            zksyncMarket.riskParameters.collateralFactor,
            zksyncMarket.riskParameters.liquidationThreshold,
            zksyncMarket.initialSupply.amount,
            NETWORK_ADDRESSES_ZKSYNC["NORMAL_TIMELOCK"],
            zksyncMarket.riskParameters.supplyCap,
            zksyncMarket.riskParameters.borrowCap,
          ],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: zksyncMarket.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [NETWORK_ADDRESSES_ZKSYNC["POOL_REGISTRY"], 0],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: zksyncMarket.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, zksyncMarket.initialSupply.vTokensToBurn],
        dstChainId: LzChainId.zksyncmainnet,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(
          zksyncMarket.initialSupply.amount,
          zksyncMarket.vToken.exchangeRate,
        );
        const vTokensRemaining = vTokensMinted.sub(zksyncMarket.initialSupply.vTokensToBurn);
        return {
          target: zksyncMarket.vToken.address,
          signature: "transfer(address,uint256)",
          params: [zksyncMarket.initialSupply.vTokenReceiver, vTokensRemaining],
          dstChainId: LzChainId.zksyncmainnet,
        };
      })(),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip454;
