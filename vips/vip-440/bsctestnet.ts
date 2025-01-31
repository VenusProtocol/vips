import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, CHAINLINK_ORACLE, RESILIENT_ORACLE } = NETWORK_ADDRESSES["sepolia"];

export const COMPTROLLER_CORE = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";

export const USDT_PRIME_CONVERTER = "0x3716C24EA86A67cAf890d7C9e4C4505cDDC2F8A2";
export const USDC_PRIME_CONVERTER = "0x511a559a699cBd665546a1F75908f7E9454Bfc67";
export const WBTC_PRIME_CONVERTER = "0x8a3937F27921e859db3FDA05729CbCea8cfd82AE";
export const WETH_PRIME_CONVERTER = "0x274a834eFFA8D5479502dD6e78925Bc04ae82B46";
export const XVS_VAULT_CONVERTER = "0xc203bfA9dCB0B5fEC510Db644A494Ff7f4968ed2";
export const BaseAssets = [
  "0x8d412FD0bc5d826615065B931171Eed10F5AF266", // USDT USDTTokenConverter BaseAsset
  "0x772d68929655ce7234C8C94256526ddA66Ef641E", // USDC USDCTokenConverter BaseAsset
  "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b", // WBTC WBTCTokenConverter BaseAsset
  "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9", // WETH WETHTokenConverter BaseAsset
  "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E", // XVS XVSTokenConverter BaseAsset
];
const CONVERSION_INCENTIVE = parseUnits("3", 14);
const ORACLE = "0xE2CA0cBFd70caA7C682e52C9E0e86A51CA174CA4";

type Token = {
  address: string;
  decimals: number;
  symbol: string;
};

export const token = {
  address: "0x5cBA66C5415E56CC0Ace55148ffC63f61327478B",
  decimals: 6,
  symbol: "yvUSDT-1",
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
    address: "0x9Ec91759d4EBaDE3109cCAD1B7AE199a02312c10",
    name: "Venus yvUSDT-1 (Core)",
    symbol: "vyvUSDT-1_Core",
    underlying: token,
    decimals: 8,
    exchangeRate: parseUnits("1", 16),
    comptroller: COMPTROLLER_CORE,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.5", 18),
    liquidationThreshold: parseUnits("0.6", 18),
    supplyCap: parseUnits("630000", 6),
    borrowCap: parseUnits("0", 6),
    reserveFactor: parseUnits("0.1", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("10000", 6),
    vTokenReceiver: VTREASURY,
  },
  interestRateModel: {
    address: "0xBd20E6922A5b1e20B5e611700f1Cab7c177C35De",
    base: "0",
    multiplier: "0.15625",
    jump: "2.5",
    kink: "0.8",
  },
};

const vip440 = () => {
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
            [ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: token.address,
        signature: "faucet(uint256)",
        params: [market.initialSupply.amount],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: market.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: market.vToken.address,
        signature: "setReserveFactor(uint256)",
        params: [market.riskParameters.reserveFactor],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: market.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, market.initialSupply.amount],
        dstChainId: LzChainId.sepolia,
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
        dstChainId: LzChainId.sepolia,
      },
      {
        target: market.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: market.vToken.address,
        signature: "setProtocolSeizeShare(uint256)",
        params: [market.riskParameters.protocolSeizeShare],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[0], [market.vToken.underlying.address], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[1], [market.vToken.underlying.address], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[2], [market.vToken.underlying.address], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[3], [market.vToken.underlying.address], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[4], [market.vToken.underlying.address], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: COMPTROLLER_CORE,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[market.vToken.address], [2], true],
        dstChainId: LzChainId.sepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip440;
