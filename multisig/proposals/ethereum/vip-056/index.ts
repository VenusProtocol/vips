import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

export const ACCOUNTANT_ORACLE = "0x132f91AA7afc590D591f168A780bB21B4c29f577";
export const weETHs = "0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88";
const INITIAL_SUPPLY = parseUnits("10.009201470952191487", 18);
export const SUPPLY_CAP = parseUnits("180", 18);
export const BORROW_CAP = parseUnits("0", 18);
const CF = parseUnits("0.8", 18);
const LT = parseUnits("0.85", 18);
export const vweETHs = "0xEF26C64bC06A8dE4CA5D31f119835f9A1d9433b9";
export const LIQUID_STAKED_COMPTROLLER = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";
export const VTOKEN_RECEIVER = "0x86fBaEB3D6b5247F420590D303a6ffC9cd523790";
const { ethereum } = NETWORK_ADDRESSES;
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

export const vip056 = () => {
  return makeProposal([
    // Configure Oracle
    {
      target: ethereum.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [weETHs, [ACCOUNTANT_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero], [true, false, false]],
      ],
    },

    // Add Market
    {
      target: ethereum.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [weETHs, INITIAL_SUPPLY, ethereum.GUARDIAN],
    },
    {
      target: weETHs,
      signature: "approve(address,uint256)",
      params: [ethereum.POOL_REGISTRY, 0],
    },
    {
      target: weETHs,
      signature: "approve(address,uint256)",
      params: [ethereum.POOL_REGISTRY, INITIAL_SUPPLY],
    },
    {
      target: vweETHs,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["7200"],
    },
    {
      target: ethereum.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [[vweETHs, CF, LT, INITIAL_SUPPLY, VTOKEN_RECEIVER, SUPPLY_CAP, BORROW_CAP]],
    },
    {
      target: vweETHs,
      signature: "setProtocolSeizeShare(uint256)",
      params: [parseUnits("0.01", 18)],
    },
    {
      target: LIQUID_STAKED_COMPTROLLER,
      signature: "setActionsPaused(address[],uint8[],bool)",
      params: [[vweETHs], [2], true],
    },

    // Conversion config
    {
      target: USDT_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[0], [weETHs], [[0, 1]]],
    },
    {
      target: USDC_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[1], [weETHs], [[0, 1]]],
    },
    {
      target: WBTC_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[2], [weETHs], [[0, 1]]],
    },
    {
      target: WETH_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[3], [weETHs], [[0, 1]]],
    },
    {
      target: XVS_VAULT_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[4], [weETHs], [[0, 1]]],
    },
  ]);
};

export default vip056;
