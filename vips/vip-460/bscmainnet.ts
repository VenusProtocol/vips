import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { unichainmainnet, zksyncmainnet } = NETWORK_ADDRESSES;

const REDSTONE_UNI_FEED = "0xf1454949C6dEdfb500ae63Aa6c784Aa1Dde08A6c";
const STALE_PERIOD_26H = 26 * 60 * 60; // heartbeat of 24H

export const ZKETH_COMPTROLLER_CORE = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";
export const ZKETH_ORACLE = "0x540aA1683E5E5592E0444499bDA41f6DF8de2Dd8";
export const UNI_COMPTROLLER_CORE = "0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe";

export const tokens = {
  WETH: {
    address: "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
    decimals: 18,
    symbol: "WETH",
  },
  zkETH: {
    address: "0xb72207E1FB50f341415999732A20B6D25d8127aa",
    decimals: 18,
    symbol: "zkETH",
  },
  UNI: {
    address: "0x8f187aA05619a017077f5308904739877ce9eA21",
    decimals: 18,
    symbol: "UNI",
  },
};

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

export const newMarkets = {
  zkETH: {
    vToken: {
      address: "0xCEb7Da150d16aCE58F090754feF2775C23C8b631",
      name: "Venus zkETH (Core)",
      symbol: "vzkETH_Core",
      underlying: tokens["zkETH"],
      decimals: 8,
      exchangeRate: parseUnits("1", 28),
      comptroller: ZKETH_COMPTROLLER_CORE,
    },
    riskParameters: {
      collateralFactor: parseUnits("0.7", 18),
      liquidationThreshold: parseUnits("0.75", 18),
      supplyCap: parseUnits("2400", 18),
      borrowCap: BigNumber.from("0"),
      reserveFactor: parseUnits("0.1", 18),
      protocolSeizeShare: parseUnits("0.05", 18),
    },
    initialSupply: {
      amount: parseUnits("3.734", 18),
      vTokensToBurn: parseUnits("0.0037", 8), // Approximately $10
      vTokenReceiver: "0x3d97E13A1D2bb4C9cE9EA9d424D83d3638F052ad",
    },
    interestRateModel: {
      address: "0x6e0f830e7fc78a296B0EbD5694573C2D9f0994B1",
      base: "0",
      multiplier: "0.0875",
      jump: "0.8",
      kink: "0.8",
    },
  },
  UNI: {
    vToken: {
      address: "0x67716D6Bf76170Af816F5735e14c4d44D0B05eD2",
      name: "Venus UNI (Core)",
      symbol: "vUNI_Core",
      underlying: tokens["UNI"],
      decimals: 8,
      exchangeRate: parseUnits("1", 28),
      comptroller: UNI_COMPTROLLER_CORE,
    },
    riskParameters: {
      collateralFactor: BigNumber.from("0"),
      liquidationThreshold: BigNumber.from("0"),
      supplyCap: parseUnits("20000", 18),
      borrowCap: BigNumber.from("0"),
      reserveFactor: parseUnits("0.25", 18),
      protocolSeizeShare: parseUnits("0.05", 18),
    },
    initialSupply: {
      amount: parseUnits("529.463427983309919376", 18),
      vTokensToBurn: parseUnits("1", 8), // Approximately $10
      vTokenReceiver: unichainmainnet.VTREASURY,
    },
    interestRateModel: {
      address: "0x6379613ceE9f40E187971c9917fdf33ba5386CAb",
      base: "0",
      multiplier: "0.15",
      jump: "3",
      kink: "0.3",
    },
  },
};

const vip460 = () => {
  const meta = {
    version: "v2",
    title: "[ZKsync][Unichain] New zkETH and UNI market in the Core pool",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Oracle config
      {
        target: zksyncmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            tokens["zkETH"].address,
            [ZKETH_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },

      {
        target: unichainmainnet.REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[tokens["UNI"].address, REDSTONE_UNI_FEED, STALE_PERIOD_26H]],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: unichainmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            tokens["UNI"].address,
            [unichainmainnet.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },

      // Market
      {
        target: newMarkets["zkETH"].vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: zksyncmainnet.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [
          newMarkets["zkETH"].vToken.underlying.address,
          newMarkets["zkETH"].initialSupply.amount,
          zksyncmainnet.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: newMarkets["zkETH"].vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [zksyncmainnet.POOL_REGISTRY, newMarkets["zkETH"].initialSupply.amount],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: zksyncmainnet.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            newMarkets["zkETH"].vToken.address,
            newMarkets["zkETH"].riskParameters.collateralFactor,
            newMarkets["zkETH"].riskParameters.liquidationThreshold,
            newMarkets["zkETH"].initialSupply.amount,
            zksyncmainnet.NORMAL_TIMELOCK,
            newMarkets["zkETH"].riskParameters.supplyCap,
            newMarkets["zkETH"].riskParameters.borrowCap,
          ],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: newMarkets["zkETH"].vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [zksyncmainnet.POOL_REGISTRY, 0],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: newMarkets["zkETH"].vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, newMarkets["zkETH"].initialSupply.vTokensToBurn],
        dstChainId: LzChainId.zksyncmainnet,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(
          newMarkets["zkETH"].initialSupply.amount,
          newMarkets["zkETH"].vToken.exchangeRate,
        );
        const vTokensRemaining = vTokensMinted.sub(newMarkets["zkETH"].initialSupply.vTokensToBurn);
        return {
          target: newMarkets["zkETH"].vToken.address,
          signature: "transfer(address,uint256)",
          params: [newMarkets["zkETH"].initialSupply.vTokenReceiver, vTokensRemaining],
          dstChainId: LzChainId.zksyncmainnet,
        };
      })(),
      {
        target: newMarkets["zkETH"].vToken.address,
        signature: "setProtocolSeizeShare(uint256)",
        params: [newMarkets["zkETH"].riskParameters.protocolSeizeShare],
        dstChainId: LzChainId.zksyncmainnet,
      },

      {
        target: ZKETH_COMPTROLLER_CORE,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[newMarkets["zkETH"].vToken.address], [2], true],
        dstChainId: LzChainId.zksyncmainnet,
      },

      {
        target: unichainmainnet.VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: newMarkets["UNI"].vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: unichainmainnet.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [
          newMarkets["UNI"].vToken.underlying.address,
          newMarkets["UNI"].initialSupply.amount,
          unichainmainnet.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: newMarkets["UNI"].vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [unichainmainnet.POOL_REGISTRY, 0],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: newMarkets["UNI"].vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [unichainmainnet.POOL_REGISTRY, newMarkets["UNI"].initialSupply.amount],
        dstChainId: LzChainId.unichainmainnet,
      },

      {
        target: unichainmainnet.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            newMarkets["UNI"].vToken.address,
            0, // CF
            0, // LT
            newMarkets["UNI"].initialSupply.amount, // initial supply
            unichainmainnet.NORMAL_TIMELOCK,
            parseUnits("20000", 18), // supply cap
            parseUnits("0", 18), // borrow cap
          ],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: newMarkets["UNI"].vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, newMarkets["UNI"].initialSupply.vTokensToBurn],
        dstChainId: LzChainId.unichainmainnet,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(
          newMarkets["UNI"].initialSupply.amount,
          newMarkets["UNI"].vToken.exchangeRate,
        );
        const vTokensRemaining = vTokensMinted.sub(newMarkets["UNI"].initialSupply.vTokensToBurn);
        return {
          target: newMarkets["UNI"].vToken.address,
          signature: "transfer(address,uint256)",
          params: [unichainmainnet.VTREASURY, vTokensRemaining],
          dstChainId: LzChainId.unichainmainnet,
        };
      })(),
      {
        target: newMarkets["UNI"].vToken.address,
        signature: "setProtocolSeizeShare(uint256)",
        params: [newMarkets["UNI"].riskParameters.protocolSeizeShare],
        dstChainId: LzChainId.unichainmainnet,
      },

      {
        target: UNI_COMPTROLLER_CORE,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[newMarkets["UNI"].vToken.address], [2], true],
        dstChainId: LzChainId.unichainmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip460;
