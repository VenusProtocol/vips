import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const VTOKEN_RECEIVER = "0x3e8734ec146c981e3ed1f6b582d447dde701d90c";
export const COMPTROLLER_CORE = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
export const sUSDe = "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497";
export const USDe = "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3";
export const VsUSDe_CORE = "0xa836ce315b7A6Bb19397Ee996551659B1D92298e";
export const VUSDe_CORE = "0xa0EE2bAA024cC3AA1BC9395522D07B7970Ca75b3";
export const sUSDe_INITIAL_SUPPLY = parseUnits("10000", 18);
export const USDe_INITIAL_SUPPLY = parseUnits("10000", 18);
export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

// converters
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
export const CONVERSION_INCENTIVE = parseUnits("3", 14);

const Actions = {
  BORROW: 2,
};

export const vip504 = () => {
  const meta = {
    version: "v2",
    title: "[ethereum] New sUSDe and USDe market in the Core pool",
    description: "",
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // Add Markets to the Core pool
      // Market configurations sUSDe
      {
        target: VsUSDe_CORE,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [sUSDe, sUSDe_INITIAL_SUPPLY, ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: sUSDe,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, 0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: sUSDe,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, sUSDe_INITIAL_SUPPLY],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VsUSDe_CORE,
            parseUnits("0.72", 18), // CF
            parseUnits("0.75", 18), // LT
            sUSDe_INITIAL_SUPPLY, // initial supply
            ethereum.NORMAL_TIMELOCK,
            parseUnits("20000000", 18), // supply cap
            parseUnits("0", 18), // borrow cap
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: VsUSDe_CORE,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, parseUnits("86", 8)], // around $100
        dstChainId: LzChainId.ethereum,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(USDe_INITIAL_SUPPLY, parseUnits("1", 28));
        const vTokensRemaining = vTokensMinted.sub(parseUnits("86", 8));
        return {
          target: VsUSDe_CORE,
          signature: "transfer(address,uint256)",
          params: [VTOKEN_RECEIVER, vTokensRemaining],
          dstChainId: LzChainId.ethereum,
        };
      })(),
      {
        target: COMPTROLLER_CORE,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[VsUSDe_CORE], [Actions.BORROW], true],
        dstChainId: LzChainId.ethereum,
      },

      // Market configurations USDe
      {
        target: VUSDe_CORE,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [USDe, USDe_INITIAL_SUPPLY, ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: USDe,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, 0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: USDe,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, USDe_INITIAL_SUPPLY],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VUSDe_CORE,
            parseUnits("0.72", 18), // CF
            parseUnits("0.75", 18), // LT
            USDe_INITIAL_SUPPLY, // initial supply
            ethereum.NORMAL_TIMELOCK,
            parseUnits("30000000", 18), // supply cap
            parseUnits("25000000", 18), // borrow cap
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: VUSDe_CORE,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, parseUnits("100", 8)], // around $100
        dstChainId: LzChainId.ethereum,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(USDe_INITIAL_SUPPLY, parseUnits("1", 28));
        const vTokensRemaining = vTokensMinted.sub(parseUnits("100", 8));
        return {
          target: VUSDe_CORE,
          signature: "transfer(address,uint256)",
          params: [VTOKEN_RECEIVER, vTokensRemaining],
          dstChainId: LzChainId.ethereum,
        };
      })(),

      // Conversion config of USDe
      {
        target: USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[0], [USDe], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[1], [USDe], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[2], [USDe], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[3], [USDe], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[4], [USDe], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip504;
