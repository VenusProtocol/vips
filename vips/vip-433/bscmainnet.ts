import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, NORMAL_TIMELOCK, RESILIENT_ORACLE } = NETWORK_ADDRESSES["basemainnet"];

export const COMPTROLLER_CORE = "0x0C7973F9598AA62f9e03B94E92C967fD5437426C";
export const wsuperOETHb_Oracle = "0x2ad7dFf3380A0b75dC0bB1f3B38C105AB5B6D818";

type Token = {
  address: string;
  decimals: number;
  symbol: string;
};

export const token = {
  address: "0x7FcD174E80f264448ebeE8c88a7C4476AAF58Ea6",
  decimals: 18,
  symbol: "wsuperOETHb",
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
    address: "0xbd1996209644E8FA6b473C3a1892Eb8D397ccbb6",
    name: "Venus wsuperOETHb",
    symbol: "vwsuperOETHb_Core",
    underlying: token,
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.73", 18),
    liquidationThreshold: parseUnits("0.78", 18),
    supplyCap: parseUnits("2000", 18),
    borrowCap: parseUnits("0", 18),
    reserveFactor: parseUnits("0.2", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("0.3", 18),
    vTokenReceiver: "0x3c112E20141B65041C252a68a611EF145f58B7bc",
  },
  interestRateModel: {
    address: "0x527c29aAfB367fAd5AFf97855EBFAa610AA514CA",
    base: "0",
    multiplier: "0.09",
    jump: "3",
    kink: "0.45",
  },
};

const vip433 = () => {
  const meta = {
    version: "v2",
    title: "VIP-433",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            token.address,
            [wsuperOETHb_Oracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
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
        target: market.vToken.address,
        signature: "setReserveFactor(uint256)",
        params: [market.riskParameters.reserveFactor],
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
            market.initialSupply.vTokenReceiver,
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
        signature: "setProtocolSeizeShare(uint256)",
        params: [market.riskParameters.protocolSeizeShare],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: COMPTROLLER_CORE,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[market.vToken.address], [2], true],
        dstChainId: LzChainId.basemainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip433;
