import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { unichainsepolia } = NETWORK_ADDRESSES;

export const COMPTROLLER_CORE = "0xFeD3eAA668a6179c9E5E1A84e3A7d6883F06f7c1";

type Token = {
  address: string;
  decimals: number;
  symbol: string;
};

export const WBTC: Token = {
  address: "0x0f850f13fd273348046f1BaDc5aCb80271A672C4",
  decimals: 8,
  symbol: "WBTC",
};

export const USDTO: Token = {
  address: "0x6f64364A62F9c0eb102b54E0dDa7666E1d3266aB",
  decimals: 6,
  symbol: "USD₮0",
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
  };
};

export const WBTCMarket: Market = {
  vToken: {
    address: "0x3aaa754E66fcACd84b01Ae5493c922AF8D4E77c7",
    name: "Venus WBTC (Core)",
    symbol: "vWBTC_Core",
    underlying: WBTC,
    decimals: 8,
    exchangeRate: parseUnits("1", 18),
    comptroller: COMPTROLLER_CORE,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.77", 18),
    liquidationThreshold: parseUnits("0.8", 18),
    supplyCap: parseUnits("400", 8),
    borrowCap: parseUnits("40", 8),
    reserveFactor: parseUnits("0.2", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("0.00100364", 8),
    vTokensToBurn: parseUnits("0.00100364", 8), // 100%
  },
};

export const USDTOMarket: Market = {
  vToken: {
    address: "0x02A5E844C4B0FF5a587B4EE239BEe7c479530447",
    name: "Venus USD₮0 (Core)",
    symbol: "vUSD₮0_Core",
    underlying: USDTO,
    decimals: 8,
    exchangeRate: parseUnits("1", 16),
    comptroller: COMPTROLLER_CORE,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.77", 18),
    liquidationThreshold: parseUnits("0.8", 18),
    supplyCap: parseUnits("50000000", 6),
    borrowCap: parseUnits("45000000", 6),
    reserveFactor: parseUnits("0.1", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("102.84258", 6),
    vTokensToBurn: parseUnits("102.84258", 6), // 100%
  },
};

const vip512 = () => {
  const meta = {
    version: "v2",
    title: "VIP-512 [Unichain] Add WBTC and USDTO markets to the Core pool",
    description: "",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // oracle config
      {
        target: unichainsepolia.REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [WBTC.address, parseUnits("1", 18)],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: unichainsepolia.REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [USDTO.address, parseUnits("1", 18)],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: unichainsepolia.RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
        params: [
          [
            // WBTC config
            [
              WBTC.address,
              [unichainsepolia.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            // USDTO config
            [
              USDTO.address,
              [unichainsepolia.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
          ],
        ],
        dstChainId: LzChainId.unichainsepolia,
      },

      // <--- WBTC Market --->
      // Market configurations
      {
        target: WBTCMarket.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: WBTC.address,
        signature: "faucet(uint256)",
        params: [WBTCMarket.initialSupply.amount],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: WBTC.address,
        signature: "approve(address,uint256)",
        params: [unichainsepolia.POOL_REGISTRY, 0],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: WBTC.address,
        signature: "approve(address,uint256)",
        params: [unichainsepolia.POOL_REGISTRY, WBTCMarket.initialSupply.amount],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: unichainsepolia.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            WBTCMarket.vToken.address,
            WBTCMarket.riskParameters.collateralFactor, // CF
            WBTCMarket.riskParameters.liquidationThreshold, // LT
            WBTCMarket.initialSupply.amount, // initial supply
            unichainsepolia.NORMAL_TIMELOCK, // vToken receiver
            WBTCMarket.riskParameters.supplyCap, // supply cap
            WBTCMarket.riskParameters.borrowCap, // borrow cap
          ],
        ],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: WBTCMarket.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, WBTCMarket.initialSupply.vTokensToBurn],
        dstChainId: LzChainId.unichainsepolia,
      },

      // <--- USDTO Market --->
      // Market configurations
      {
        target: USDTOMarket.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: USDTO.address,
        signature: "faucet(uint256)",
        params: [USDTOMarket.initialSupply.amount],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: USDTO.address,
        signature: "approve(address,uint256)",
        params: [unichainsepolia.POOL_REGISTRY, 0],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: USDTO.address,
        signature: "approve(address,uint256)",
        params: [unichainsepolia.POOL_REGISTRY, USDTOMarket.initialSupply.amount],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: unichainsepolia.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            USDTOMarket.vToken.address,
            USDTOMarket.riskParameters.collateralFactor, // CF
            USDTOMarket.riskParameters.liquidationThreshold, // LT
            USDTOMarket.initialSupply.amount, // initial supply
            unichainsepolia.NORMAL_TIMELOCK, // vToken receiver
            USDTOMarket.riskParameters.supplyCap, // supply cap
            USDTOMarket.riskParameters.borrowCap, // borrow cap
          ],
        ],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: USDTOMarket.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, USDTOMarket.initialSupply.vTokensToBurn],
        dstChainId: LzChainId.unichainsepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip512;
