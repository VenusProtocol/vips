import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ethers } from "hardhat";

const { ethereum } = NETWORK_ADDRESSES;

export const EIGEN = "0xec53bF9167f50cDEB3Ae105f56099aaaB9061F83";
const INITIAL_SUPPLY = parseUnits("500", 18);
export const SUPPLY_CAP = parseUnits("3000000", 18);
export const BORROW_CAP = parseUnits("1500000", 18);
const CF = parseUnits("0.5", 18);
const LT = parseUnits("0.6", 18);
export const vEIGEN = "0x256AdDBe0a387c98f487e44b85c29eb983413c5e";
export const CORE_COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";

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
const CONVERSION_INCENTIVE = parseUnits("0.0001", 18);
const CHAINLINK_FEED = "0xf2917e602C2dCa458937fad715bb1E465305A4A1";
const MAX_STALE_PERIOD =  30 * 3600; 

export const vip067 = () => {
  return makeProposal([
    {
      target: ethereum.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[EIGEN, CHAINLINK_FEED, MAX_STALE_PERIOD]],
    },
    {
      target: ethereum.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          EIGEN,
          [ethereum.CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
          [true, false, false],
        ],
      ],
    },

    // Add Market
    {
      target: ethereum.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [EIGEN, INITIAL_SUPPLY, ethereum.GUARDIAN],
    },
    {
      target: EIGEN,
      signature: "approve(address,uint256)",
      params: [ethereum.POOL_REGISTRY, 0],
    },
    {
      target: EIGEN,
      signature: "approve(address,uint256)",
      params: [ethereum.POOL_REGISTRY, INITIAL_SUPPLY],
      
    },
    {
      target: vEIGEN,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["7200"],
      
    },
    {
      target: ethereum.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [[vEIGEN, CF, LT, INITIAL_SUPPLY, ethereum.VTREASURY, SUPPLY_CAP, BORROW_CAP]],
    },
    {
      target: vEIGEN,
      signature: "setProtocolSeizeShare(uint256)",
      params: [parseUnits("0.01", 18)],
      
    },

    // Conversion config
    {
      target: USDT_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[0], [EIGEN], [[CONVERSION_INCENTIVE, 1]]],
      
    },
    {
      target: USDC_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[1], [EIGEN], [[CONVERSION_INCENTIVE, 1]]],
      
    },
    {
      target: WBTC_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[2], [EIGEN], [[CONVERSION_INCENTIVE, 1]]],
      
    },
    {
      target: WETH_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[3], [EIGEN], [[CONVERSION_INCENTIVE, 1]]],
      
    },
    {
      target: XVS_VAULT_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[4], [EIGEN], [[CONVERSION_INCENTIVE, 1]]],
      
    },
  ]);
};

export default vip067;
