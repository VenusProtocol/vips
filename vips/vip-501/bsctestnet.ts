import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { unichainsepolia } = NETWORK_ADDRESSES;

export const COMPTROLLER_CORE = "0xFeD3eAA668a6179c9E5E1A84e3A7d6883F06f7c1";
export const WEETH_ORACLE = "0xa980158116316d0759C56D7E812D7D8cEf18B425";
export const WSTETH_ORACLE = "0x555bD5dc1dCf87EEcC39778C3ba9DDCc40dF05c0";

export const CONVERSION_INCENTIVE = parseUnits("1", 14);

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

type Token = {
  address: string;
  decimals: number;
  symbol: string;
};

export const weETH: Token = {
  address: "0x3B3aCc90D848981E69052FD461123EA19dca6cAF",
  decimals: 18,
  symbol: "weETH",
};

export const wstETH: Token = {
  address: "0x114B3fD3dA17F8EDBc19a3AEE43aC168Ca5b03b4",
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

export const weETHMarket: Market = {
  vToken: {
    address: "0xF46F0E1Fe165018EC778e0c61a71661f55aEa09B",
    name: "Venus weETH (Core)",
    symbol: "vweETH_Core",
    underlying: weETH,
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.7", 18),
    liquidationThreshold: parseUnits("0.75", 18),
    supplyCap: parseUnits("4000", 18),
    borrowCap: parseUnits("400", 18),
    reserveFactor: parseUnits("0.4", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("3", 18),
    vTokensToBurn: parseUnits("0.03", 8), // around $100
    vTokenReceiver: unichainsepolia.VTREASURY,
  },
  interestRateModel: {
    address: "0xa8f62DE954852c39BC66ff9B103c8D4758982309",
    base: "0",
    multiplier: "0.09",
    jump: "3",
    kink: "0.45",
  },
};

export const wstETHMarket: Market = {
  vToken: {
    address: "0xb24c9a851542B4599Eb6C1644ce2e245074c885f",
    name: "Venus wstETH (Core)",
    symbol: "vwstETH_Core",
    underlying: wstETH,
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.7", 18),
    liquidationThreshold: parseUnits("0.725", 18),
    supplyCap: parseUnits("14000", 18),
    borrowCap: parseUnits("7000", 18),
    reserveFactor: parseUnits("0.25", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("3", 18),
    vTokensToBurn: parseUnits("0.03", 8), // around $100
    vTokenReceiver: unichainsepolia.VTREASURY,
  },
  interestRateModel: {
    address: "0x5C7D8858a25778d992eE803Ce79F1eff60c1d9D1",
    base: "0",
    multiplier: "0.15",
    jump: "3",
    kink: "0.45",
  },
};

const vip501 = () => {
  const meta = {
    version: "v2",
    title: "VIP-501 [Unichain] Add weETH and wstETH markets to the Core pool",
    description: "",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // <--- weETH Market --->
      // oracle config
      {
        target: unichainsepolia.REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [weETH.address, parseUnits("1", 18)],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: unichainsepolia.REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [wstETH.address, parseUnits("1", 18)],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: unichainsepolia.RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
        params: [
          [
            // weETH config
            [
              weETH.address,
              [WEETH_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            // wstETH config
            [
              wstETH.address,
              [WSTETH_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
          ],
        ],
        dstChainId: LzChainId.unichainsepolia,
      },

      // Market configurations
      {
        target: weETHMarket.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: weETH.address,
        signature: "faucet(uint256)",
        params: [weETHMarket.initialSupply.amount],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: weETH.address,
        signature: "approve(address,uint256)",
        params: [unichainsepolia.POOL_REGISTRY, 0],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: weETH.address,
        signature: "approve(address,uint256)",
        params: [unichainsepolia.POOL_REGISTRY, weETHMarket.initialSupply.amount],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: unichainsepolia.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            weETHMarket.vToken.address,
            weETHMarket.riskParameters.collateralFactor, // CF
            weETHMarket.riskParameters.liquidationThreshold, // LT
            weETHMarket.initialSupply.amount, // initial supply
            unichainsepolia.NORMAL_TIMELOCK, // vToken receiver
            weETHMarket.riskParameters.supplyCap, // supply cap
            weETHMarket.riskParameters.borrowCap, // borrow cap
          ],
        ],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: weETHMarket.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, weETHMarket.initialSupply.vTokensToBurn],
        dstChainId: LzChainId.unichainsepolia,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(weETHMarket.initialSupply.amount, weETHMarket.vToken.exchangeRate);
        const vTokensRemaining = vTokensMinted.sub(weETHMarket.initialSupply.vTokensToBurn);
        return {
          target: weETHMarket.vToken.address,
          signature: "transfer(address,uint256)",
          params: [weETHMarket.initialSupply.vTokenReceiver, vTokensRemaining],
          dstChainId: LzChainId.unichainsepolia,
        };
      })(),

      // <--- wstETH Market --->
      // Market configurations
      {
        target: wstETHMarket.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: wstETH.address,
        signature: "faucet(uint256)",
        params: [wstETHMarket.initialSupply.amount],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: wstETH.address,
        signature: "approve(address,uint256)",
        params: [unichainsepolia.POOL_REGISTRY, 0],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: wstETH.address,
        signature: "approve(address,uint256)",
        params: [unichainsepolia.POOL_REGISTRY, wstETHMarket.initialSupply.amount],
        dstChainId: LzChainId.unichainsepolia,
      },

      {
        target: unichainsepolia.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            wstETHMarket.vToken.address,
            wstETHMarket.riskParameters.collateralFactor, // CF
            wstETHMarket.riskParameters.liquidationThreshold, // LT
            wstETHMarket.initialSupply.amount, // initial supply
            unichainsepolia.NORMAL_TIMELOCK, // vToken receiver
            wstETHMarket.riskParameters.supplyCap, // supply cap
            wstETHMarket.riskParameters.borrowCap, // borrow cap
          ],
        ],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: wstETHMarket.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, wstETHMarket.initialSupply.vTokensToBurn],
        dstChainId: LzChainId.unichainsepolia,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(
          wstETHMarket.initialSupply.amount,
          wstETHMarket.vToken.exchangeRate,
        );
        const vTokensRemaining = vTokensMinted.sub(wstETHMarket.initialSupply.vTokensToBurn);
        return {
          target: wstETHMarket.vToken.address,
          signature: "transfer(address,uint256)",
          params: [wstETHMarket.initialSupply.vTokenReceiver, vTokensRemaining],
          dstChainId: LzChainId.unichainsepolia,
        };
      })(),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip501;
