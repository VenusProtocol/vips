import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, NORMAL_TIMELOCK, RESILIENT_ORACLE } = NETWORK_ADDRESSES["zksyncmainnet"];

export const COMPTROLLER = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";
export const ZKETH_ORACLE = "0x540aA1683E5E5592E0444499bDA41f6DF8de2Dd8";

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
};

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

export const newMarket = {
  vToken: {
    address: "0xCEb7Da150d16aCE58F090754feF2775C23C8b631",
    name: "Venus zkETH (Core)",
    symbol: "vzkETH_Core",
    underlying: tokens["zkETH"],
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER,
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
};

const vip460 = () => {
  const meta = {
    version: "v2",
    title: "[ZKsync] New zkETH market in the Core pool",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Oracle config
      {
        target: RESILIENT_ORACLE,
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

      // Market
      {
        target: newMarket.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [newMarket.vToken.underlying.address, newMarket.initialSupply.amount, NORMAL_TIMELOCK],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: newMarket.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, newMarket.initialSupply.amount],
        dstChainId: LzChainId.zksyncmainnet,
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
            NORMAL_TIMELOCK,
            newMarket.riskParameters.supplyCap,
            newMarket.riskParameters.borrowCap,
          ],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: newMarket.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: newMarket.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, newMarket.initialSupply.vTokensToBurn],
        dstChainId: LzChainId.zksyncmainnet,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(newMarket.initialSupply.amount, newMarket.vToken.exchangeRate);
        const vTokensRemaining = vTokensMinted.sub(newMarket.initialSupply.vTokensToBurn);
        return {
          target: newMarket.vToken.address,
          signature: "transfer(address,uint256)",
          params: [newMarket.initialSupply.vTokenReceiver, vTokensRemaining],
          dstChainId: LzChainId.zksyncmainnet,
        };
      })(),
      {
        target: newMarket.vToken.address,
        signature: "setProtocolSeizeShare(uint256)",
        params: [newMarket.riskParameters.protocolSeizeShare],
        dstChainId: LzChainId.zksyncmainnet,
      },

      {
        target: COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[newMarket.vToken.address], [2], true],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip460;
