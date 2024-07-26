import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

const UPPER_BOUND_RATIO = parseUnits("1.01", 18);
const LOWER_BOUND_RATIO = parseUnits("0.99", 18);
const ezETH_ONE_JUMP_REDSTONE_ORACLE = "0x8062dC1b38c0b2CF6188dF605B19cFF3c4dc9b29";
const ezETH_ONE_JUMP_CHAINLINK_ORACLE = "0xa87E10C6F6DAD7af6C17f82Ce2C00FA5C64d110c";
export const ezETH = "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110";
export const vezETH = "0xA854D35664c658280fFf27B6eDC6C4195c3229B3";
const BOUND_VALIDATOR = "0x1Cd5f336A1d28Dff445619CC63d3A0329B4d8a58";
export const VTOKEN_RECEIVER = "0x1E3233E8d972cfFc7D0f83aFAE4354a0Db74e34E";
export const INITIAL_SUPPLY = parseUnits("1.41", 18);
export const SUPPLY_CAP = parseUnits("14000", 18);
export const BORROW_CAP = parseUnits("1400", 18);
const CHAINLINK_ezETH_FEED = "0x636A000262F6aA9e1F094ABF0aD8f645C44f641C";
const REDSTONE_ezETH_FEED = "0xF4a3e183F59D2599ee3DF213ff78b1B3b1923696";
const STALE_PERIOD_26H = 60 * 60 * 26; // 26 hours (pricefeeds with heartbeat of 24 hr) ;
const STALE_PERIOD_13H = 60 * 60 * 13; // 13 hours (pricefeeds with heartbeat of 12 hr) ;
const CF = parseUnits("0.8", 18);
const LT = parseUnits("0.85", 18);
export const USDT_PRIME_CONVERTER = "0x4f55cb0a24D5542a3478B0E284259A6B850B06BD";
export const USDC_PRIME_CONVERTER = "0xcEB9503f10B781E30213c0b320bCf3b3cE54216E";
export const WBTC_PRIME_CONVERTER = "0xDcCDE673Cd8988745dA384A7083B0bd22085dEA0";
export const WETH_PRIME_CONVERTER = "0xb8fD67f215117FADeF06447Af31590309750529D";
export const XVS_VAULT_CONVERTER = "0x1FD30e761C3296fE36D9067b1e398FD97B4C0407";
export const BaseAssets = [
  "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT USDTTokenConverter BaseAsset
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC USDCTokenConverter BaseAsset
  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC WBTCTokenConverter BaseAsset
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH WETHTokenConverter BaseAsset
  "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A", // XVS XVSTokenConverter BaseAsset
];

export const vip050 = () => {
  return makeProposal([
    // Configure Oracle
    {
      target: BOUND_VALIDATOR,
      signature: "setValidateConfig((address,uint256,uint256))",
      params: [[ezETH, UPPER_BOUND_RATIO, LOWER_BOUND_RATIO]],
    },
    {
      target: ethereum.REDSTONE_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[ezETH, REDSTONE_ezETH_FEED, STALE_PERIOD_13H]],
    },
    {
      target: ethereum.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[ezETH, CHAINLINK_ezETH_FEED, STALE_PERIOD_26H]],
    },
    {
      target: ethereum.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          ezETH,
          [ezETH_ONE_JUMP_REDSTONE_ORACLE, ezETH_ONE_JUMP_CHAINLINK_ORACLE, ezETH_ONE_JUMP_CHAINLINK_ORACLE],
          [true, true, true],
        ],
      ],
    },

    // Add Market
    {
      target: ethereum.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [ezETH, INITIAL_SUPPLY, ethereum.GUARDIAN],
    },
    {
      target: ezETH,
      signature: "approve(address,uint256)",
      params: [ethereum.POOL_REGISTRY, INITIAL_SUPPLY],
    },
    {
      target: vezETH,
      signature: "setProtocolSeizeShare(uint256)",
      params: [parseUnits("0.01", 18)],
    },
    {
      target: vezETH,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["7200"],
    },
    {
      target: ethereum.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [[vezETH, CF, LT, INITIAL_SUPPLY, VTOKEN_RECEIVER, SUPPLY_CAP, BORROW_CAP]],
    },

    // Conversion config
    {
      target: USDT_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[0], [ezETH], [[0, 1]]],
    },
    {
      target: USDC_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[1], [ezETH], [[0, 1]]],
    },
    {
      target: WBTC_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[2], [ezETH], [[0, 1]]],
    },
    {
      target: WETH_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[3], [ezETH], [[0, 1]]],
    },
    {
      target: XVS_VAULT_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[4], [ezETH], [[0, 1]]],
    },
  ]);
};

export default vip050;
