import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, RESILIENT_ORACLE, NORMAL_TIMELOCK } = NETWORK_ADDRESSES["zksyncsepolia"];

export const COMPTROLLER = "0xC527DE08E43aeFD759F7c0e6aE85433923064669";
export const ZKETH_ORACLE = "0x6aE071218F81f4e70312d1F435be24AeD70fa53A";

export const tokens = {
  WETH: {
    address: "0x53F7e72C7ac55b44c7cd73cC13D4EF4b121678e6",
    decimals: 18,
    symbol: "WETH",
  },
  zkETH: {
    address: "0x13231E8B60BE0900fB3a3E9dc52C2b39FA4794df",
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
    address: "0xac01abfbe100b56Fc414C346B175599E5f582912",
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
    vTokenReceiver: VTREASURY,
  },
  interestRateModel: {
    address: "0x782D1BA04d28dbbf1Ff664B62993f69cd6225466",
    base: "0",
    multiplier: "0.0875",
    jump: "0.8",
    kink: "0.8",
  },
};

const vip464 = () => {
  const meta = {
    version: "v2",
    title: "[ZKsync sepolia] New zkETH market in the Core pool",
    description: `zkETH market ok ZKsync sepolia - Core pool`,
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
            NORMAL_TIMELOCK,
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
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, newMarket.initialSupply.vTokensToBurn],
        dstChainId: LzChainId.zksyncsepolia,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(newMarket.initialSupply.amount, newMarket.vToken.exchangeRate);
        const vTokensRemaining = vTokensMinted.sub(newMarket.initialSupply.vTokensToBurn);
        return {
          target: newMarket.vToken.address,
          signature: "transfer(address,uint256)",
          params: [newMarket.initialSupply.vTokenReceiver, vTokensRemaining],
          dstChainId: LzChainId.zksyncsepolia,
        };
      })(),
      {
        target: newMarket.vToken.address,
        signature: "setProtocolSeizeShare(uint256)",
        params: [newMarket.riskParameters.protocolSeizeShare],
        dstChainId: LzChainId.zksyncsepolia,
      },

      {
        target: COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[newMarket.vToken.address], [2], true],
        dstChainId: LzChainId.zksyncsepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip464;
