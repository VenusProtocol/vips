import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, CHAINLINK_ORACLE, RESILIENT_ORACLE, NORMAL_TIMELOCK } = NETWORK_ADDRESSES["ethereum"];

export const BaseAssets = [
  "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT USDTPrimeConverter BaseAsset
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC USDCPrimeConverter BaseAsset
  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC WBTCPrimeConverter BaseAsset
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH WETHPrimeConverter BaseAsset
  "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A", // XVS XVSPrimeConverter BaseAsset
];

export const CONVERTER_NETWORK = "0x232CC47AECCC55C2CAcE4372f5B268b27ef7cac8";
export const USDT_PRIME_CONVERTER = "0x4f55cb0a24D5542a3478B0E284259A6B850B06BD";
export const USDC_PRIME_CONVERTER = "0xcEB9503f10B781E30213c0b320bCf3b3cE54216E";
export const WBTC_PRIME_CONVERTER = "0xDcCDE673Cd8988745dA384A7083B0bd22085dEA0";
export const WETH_PRIME_CONVERTER = "0xb8fD67f215117FADeF06447Af31590309750529D";
export const XVS_VAULT_CONVERTER = "0x1FD30e761C3296fE36D9067b1e398FD97B4C0407";

export const COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
export const sUSDS_ERC4626_ORACLE = "0xDC4861F5Ad18bD584Eab322cc6706e632E9D1c94";
export const USDS = "0xdC035D45d973E3EC169d2276DDab16f1e407384F";
export const vUSDS = "0x0c6B19287999f1e31a5c0a44393b24B62D2C0468";
export const VTOKEN_RECEIVER = "0x9c489E4efba90A67299C1097a8628e233C33BB7B";

export const USDS_CHAINLINK_FEED = "0xfF30586cD0F29eD462364C7e81375FC0C71219b1";
const STALE_PERIOD_26H = 26 * 60 * 60;

export const CONVERSION_INCENTIVE = parseUnits("0.0001", 18);

const vip440 = (chainlinkStalePeriod?: number) => {
  const meta = {
    version: "v2",
    title: "Configure USDS & sUSDS markets on Ethereum - Core pool",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Oracle config
      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[USDS, USDS_CHAINLINK_FEED, chainlinkStalePeriod || STALE_PERIOD_26H]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [USDS, [CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero], [true, false, false]],
        ],
        dstChainId: LzChainId.ethereum,
      },
      // USDS Market
      {
        target: vUSDS,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: vUSDS,
        signature: "setReserveFactor(uint256)",
        params: [parseUnits("0.1", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [USDS, parseUnits("10000", 18), NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: USDS,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, parseUnits("10000", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            vUSDS,
            parseUnits("0.73", 18),
            parseUnits("0.75", 18),
            parseUnits("10000", 18),
            VTOKEN_RECEIVER,
            parseUnits("65000000", 18),
            parseUnits("7680000", 18),
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: USDS,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: vUSDS,
        signature: "setProtocolSeizeShare(uint256)",
        params: [parseUnits("0.05", 18)],
        dstChainId: LzChainId.ethereum,
      },

      // set converters
      {
        target: USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[0], [USDS], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[1], [USDS], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[2], [USDS], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[3], [USDS], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[4], [USDS], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip440;
