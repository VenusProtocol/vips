import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, NORMAL_TIMELOCK, RESILIENT_ORACLE, CHAINLINK_ORACLE } =
  NETWORK_ADDRESSES["basemainnet"];

export const COMPTROLLER_CORE = "0x0C7973F9598AA62f9e03B94E92C967fD5437426C";
export const CHAINLINK_STALE_PERIOD = 60 * 60 * 24 * 365; // 1 Year
export const wstETH_CHAINLINK_FEED = "0xB88BAc61a4Ca37C43a3725912B1f472c9A5bc061";
export const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";
export const wstETH_ONE_JUMP_ORACLE = "0x007e6Bd6993892b39210a7116506D6eA417B7565";

type Token = {
  address: string;
  decimals: number;
  symbol: string;
};

export const token = {
  address: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452",
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

export const market: Market = {
  vToken: {
    address: "0x133d3BCD77158D125B75A17Cb517fFD4B4BE64C5",
    name: "Venus wstETH (Core)",
    symbol: "vwstETH_Core",
    underlying: token,
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
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
    vTokenReceiver: "0x5A9d695c518e95CD6Ea101f2f25fC2AE18486A61",
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

const vip453 = () => {
  const meta = {
    version: "v2",
    title: "VIP-453 [Base] New wstETH market in the Core pool",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[market.vToken.underlying.address, wstETH_CHAINLINK_FEED, CHAINLINK_STALE_PERIOD]],
        dstChainId: LzChainId.basemainnet,
      },

      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            market.vToken.underlying.address,
            [wstETH_ONE_JUMP_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: market.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [market.vToken.underlying.address, market.initialSupply.amount, NORMAL_TIMELOCK],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: market.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, market.initialSupply.amount],
        dstChainId: LzChainId.basemainnet,
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
            NORMAL_TIMELOCK,
            market.riskParameters.supplyCap,
            market.riskParameters.borrowCap,
          ],
        ],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: market.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: market.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, market.initialSupply.vTokensToBurn],
        dstChainId: LzChainId.basemainnet,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(market.initialSupply.amount, market.vToken.exchangeRate);
        const vTokensRemaining = vTokensMinted.sub(market.initialSupply.vTokensToBurn);
        return {
          target: market.vToken.address,
          signature: "transfer(address,uint256)",
          params: [market.initialSupply.vTokenReceiver, vTokensRemaining],
          dstChainId: LzChainId.basemainnet,
        };
      })(),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip453;
