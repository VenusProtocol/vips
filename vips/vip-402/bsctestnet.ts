import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

const LBTC = "0x37798CaB3Adde2F4064afBc1C7F9bbBc6A826375";
const LBTC_VTOKEN = "0x315F064cF5B5968fE1655436e1856F3ca558d395";
const CORE_POOL_COMPTROLLER = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
const REDUCE_RESERVES_BLOCK_DELTA = "7200";

const { POOL_REGISTRY, REDSTONE_ORACLE, RESILIENT_ORACLE, VTREASURY } = sepolia;

export const marketSpec = {
  vToken: {
    address: LBTC_VTOKEN,
    name: "Venus LBTC (Core)",
    symbol: "vLBTC_Core",
    underlying: {
      address: LBTC,
      decimals: 8,
      symbol: "LBTC",
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 18),
    comptroller: CORE_POOL_COMPTROLLER,
  },
  interestRateModel: {
    address: "0x49DF29953303c5AB09201d54435C8662d06d024C", // JumpRateModelV2_base0bps_slope900bps_jump20000bps_kink4500bps
    base: "0",
    multiplier: "0.09",
    jump: "2",
    kink: "0.45",
  },
  initialSupply: {
    amount: parseUnits("0.106", 8),
    vTokenReceiver: VTREASURY,
  },
  riskParameters: {
    supplyCap: parseUnits("450", 8),
    borrowCap: parseUnits("45", 8),
    collateralFactor: parseUnits("0.735", 18),
    liquidationThreshold: parseUnits("0.785", 18),
    reserveFactor: parseUnits("0.2", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
};

const LBTC_ONE_JUMP_REDSTONE_ORACLE = "0x1082191431E1d24D21C97717ED1927ce337caa70";

export const CONVERSION_INCENTIVE = 1e14;

export const USDT_PRIME_CONVERTER = "0x3716C24EA86A67cAf890d7C9e4C4505cDDC2F8A2";
export const USDC_PRIME_CONVERTER = "0x511a559a699cBd665546a1F75908f7E9454Bfc67";
export const WBTC_PRIME_CONVERTER = "0x8a3937F27921e859db3FDA05729CbCea8cfd82AE";
export const WETH_PRIME_CONVERTER = "0x274a834eFFA8D5479502dD6e78925Bc04ae82B46";
export const XVS_VAULT_CONVERTER = "0xc203bfA9dCB0B5fEC510Db644A494Ff7f4968ed2";
const USDT = "0x8d412FD0bc5d826615065B931171Eed10F5AF266";
const USDC = "0x772d68929655ce7234C8C94256526ddA66Ef641E";
const WBTC = "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b";
const WETH = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
const XVS = "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E";
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

export const vip402 = () => {
  const meta = {
    version: "v2",
    title: "VIP-401",
    description: `LBTC`,
    forDescription: "Process to configure and launch the new market",
    againstDescription: "Defer configuration and launch of the new market",
    abstainDescription: "No opinion on the matter",
  };

  return makeProposal(
    [
      // Configure Oracle
      {
        target: REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [marketSpec.vToken.underlying.address, parseUnits("1.1", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            marketSpec.vToken.underlying.address,
            [LBTC_ONE_JUMP_REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },

      // Add Market
      {
        target: marketSpec.vToken.underlying.address,
        signature: "faucet(uint256)",
        params: [marketSpec.initialSupply.amount],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: marketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, marketSpec.initialSupply.amount],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: marketSpec.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [REDUCE_RESERVES_BLOCK_DELTA],
        dstChainId: LzChainId.sepolia,
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
        dstChainId: LzChainId.sepolia,
      },
      {
        target: marketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
        dstChainId: LzChainId.sepolia,
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
        dstChainId: LzChainId.sepolia,
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip402;
