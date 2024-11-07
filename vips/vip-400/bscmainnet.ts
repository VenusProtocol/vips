import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

const PUFETH = "0xD9A442856C234a39a81a089C06451EBAa4306a72";
const PUFETH_VTOKEN = "0xE0ee5dDeBFe0abe0a4Af50299D68b74Cec31668e";
const LST_ETH_COMPTROLLER = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";
const REDUCE_RESERVES_BLOCK_DELTA = "7200";

const { POOL_REGISTRY, VTREASURY, REDSTONE_ORACLE, RESILIENT_ORACLE } = ethereum;

export const marketSpec = {
  vToken: {
    address: PUFETH_VTOKEN,
    name: "Venus pufETH (Liquid Staked ETH)",
    symbol: "vpufETH_LiquidStakedETH",
    underlying: {
      address: PUFETH,
      decimals: 18,
      symbol: "pufETH",
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: LST_ETH_COMPTROLLER,
  },
  interestRateModel: {
    address: "0xDaFA3B350288cEb448e0E03077D932f8EF561391",
    base: "0",
    multiplier: "0.045",
    jump: "2",
    kink: "0.45",
  },
  initialSupply: {
    amount: parseUnits("5", 18),
    vTokenReceiver: VTREASURY,
  },
  riskParameters: {
    supplyCap: parseUnits("3000", 18),
    borrowCap: parseUnits("300", 18),
    collateralFactor: parseUnits("0.8", 18),
    liquidationThreshold: parseUnits("0.85", 18),
    reserveFactor: parseUnits("0.2", 18),
    protocolSeizeShare: parseUnits("0.01", 18),
  },
};

const PUFETH_ONE_JUMP_REDSTONE_ORACLE = "0xAaE18CEBDF55bbbbf5C70c334Ee81D918be728Bc";
export const PUFETH_REDSTONE_FEED = "0x76A495b0bFfb53ef3F0E94ef0763e03cE410835C";
const MAX_STALE_PERIOD = 26 * 3600; // heartbeat of 24 hours + 2 hours margin

export const CONVERSION_INCENTIVE = 1e14;

export const USDT_PRIME_CONVERTER = "0x4f55cb0a24D5542a3478B0E284259A6B850B06BD";
export const USDC_PRIME_CONVERTER = "0xcEB9503f10B781E30213c0b320bCf3b3cE54216E";
export const WBTC_PRIME_CONVERTER = "0xDcCDE673Cd8988745dA384A7083B0bd22085dEA0";
export const WETH_PRIME_CONVERTER = "0xb8fD67f215117FADeF06447Af31590309750529D";
export const XVS_VAULT_CONVERTER = "0x1FD30e761C3296fE36D9067b1e398FD97B4C0407";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
export const converterBaseAssets = {
  [USDT_PRIME_CONVERTER]: USDT,
  [USDC_PRIME_CONVERTER]: USDC,
  [WBTC_PRIME_CONVERTER]: WBTC,
  [WETH_PRIME_CONVERTER]: WETH,
  [XVS_VAULT_CONVERTER]: XVS,
};

enum ConversionAccessibility {
  NONE = 0,
  ALL = 1,
  ONLY_FOR_CONVERTERS = 2,
  ONLY_FOR_USERS = 3,
}

export const vip400 = () => {
  const meta = {
    version: "v2",
    title: "VIP-400",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Configure Oracle
      {
        target: REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[marketSpec.vToken.underlying.address, PUFETH_REDSTONE_FEED, MAX_STALE_PERIOD]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            marketSpec.vToken.underlying.address,
            [PUFETH_ONE_JUMP_REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },

      // Add Market
      {
        target: marketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, marketSpec.initialSupply.amount],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: marketSpec.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [REDUCE_RESERVES_BLOCK_DELTA],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            marketSpec.vToken.address,
            marketSpec.riskParameters.collateralFactor,
            marketSpec.riskParameters.liquidationThreshold,
            marketSpec.initialSupply.amount,
            marketSpec.initialSupply.vTokenReceiver,
            marketSpec.riskParameters.supplyCap,
            marketSpec.riskParameters.borrowCap,
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: marketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: marketSpec.vToken.address,
        signature: "setProtocolSeizeShare(uint256)",
        params: [marketSpec.riskParameters.protocolSeizeShare],
        dstChainId: LzChainId.ethereum,
      },

      // Configure converters
      ...Object.entries(converterBaseAssets).map(([converter, baseAsset]: [string, string]) => ({
        target: converter,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          baseAsset,
          [marketSpec.vToken.underlying.address],
          [[CONVERSION_INCENTIVE, ConversionAccessibility.ALL]],
        ],
        dstChainId: LzChainId.ethereum,
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip400;
