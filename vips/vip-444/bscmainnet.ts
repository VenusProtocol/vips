import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, NORMAL_TIMELOCK } = NETWORK_ADDRESSES["ethereum"];

export const COMPTROLLER_CORE = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";

type Token = {
  address: string;
  decimals: number;
  symbol: string;
};

export const token = {
  address: "0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88",
  decimals: 18,
  symbol: "weETHs",
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

export const market: Market = {
  vToken: {
    address: "0xc42E4bfb996ED35235bda505430cBE404Eb49F77",
    name: "Venus weETHs (Core)",
    symbol: "vweETHs_Core",
    underlying: token,
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.70", 18),
    liquidationThreshold: parseUnits("0.75", 18),
    supplyCap: parseUnits("700", 18),
    borrowCap: parseUnits("0", 18),
    reserveFactor: parseUnits("0.25", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("2", 18),
    vTokenReceiver: "0x3e8734ec146c981e3ed1f6b582d447dde701d90c",
  },
  interestRateModel: {
    address: "0xae838dEB13Ff67681704AA69e31Da304918Ee43D",
    base: "0",
    multiplier: "0.09",
    jump: "0.75",
    kink: "0.45",
  },
};

const vip437 = () => {
  const meta = {
    version: "v2",
    title: "VIP-444",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: market.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: market.vToken.address,
        signature: "setReserveFactor(uint256)",
        params: [market.riskParameters.reserveFactor],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [market.vToken.underlying.address, market.initialSupply.amount, NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: market.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, market.initialSupply.amount],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            market.vToken.address,
            market.riskParameters.collateralFactor,
            market.riskParameters.liquidationThreshold,
            market.initialSupply.amount,
            market.initialSupply.vTokenReceiver,
            market.riskParameters.supplyCap,
            market.riskParameters.borrowCap,
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: market.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: COMPTROLLER_CORE,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[market.vToken.address], [2], true],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip437;
