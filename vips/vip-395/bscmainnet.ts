import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ACM,
  BaseAssets,
  CONVERTER_NETWORK,
  USDCPrimeConverterTokenOuts,
  USDC_PRIME_CONVERTER,
  USDTPrimeConverterTokenOuts,
  USDT_PRIME_CONVERTER,
  WBTCPrimeConverterTokenOuts,
  WBTC_PRIME_CONVERTER,
  WETHPrimeConverterTokenOuts,
  WETH_PRIME_CONVERTER,
  XVSVaultConverterTokenOuts,
  XVS_VAULT_CONVERTER,
} from "../../multisig/proposals/arbitrumone/vip-018/addresses";
import {
  addConverterNetworkCommands,
  incentiveAndAccessibilities,
} from "../../multisig/proposals/arbitrumone/vip-018/commands";

const { arbitrumone } = NETWORK_ADDRESSES;

export const ARBITRUM_COMPTROLLER_CORE = "0x317c1A5739F39046E20b08ac9BeEa3f10fD43326";
export const ARBITRUM_COMPTROLLER_LST = "0x52bAB1aF7Ff770551BD05b9FC2329a0Bf5E23F16";
export const ARBITRUM_PRIME = "0xFE69720424C954A2da05648a0FAC84f9bf11Ef49";
export const ARBITRUM_PLP = "0x86bf21dB200f29F21253080942Be8af61046Ec29";

export const ARBITRUM_USDT = "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9";
export const ARBITRUM_USDC = "0xaf88d065e77c8cc2239327c5edb3a432268e5831";
export const ARBITRUM_WBTC = "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f";
export const ARBITRUM_WETH = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1";

export const ARBITRUM_VUSDT_CORE = "0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD";
export const ARBITRUM_VUSDC_CORE = "0x7D8609f8da70fF9027E9bc5229Af4F6727662707";
export const ARBITRUM_VWBTC_CORE = "0xaDa57840B372D4c28623E87FC175dE8490792811";
export const ARBITRUM_VWETH_LST = "0x39D6d13Ea59548637104E40e729E4aABE27FE106";

export const ARBITRUM_XVS_VAULT_TREASURY = "0xb076D4f15c08D7A7B89466327Ba71bc7e1311b58";
export const ARBITRUM_PROTOCOL_SHARE_RESERVE_PROXY = "0xF9263eaF7eB50815194f26aCcAB6765820B13D41";
export const ARBITRUM_VTREASURY = "0x8a662ceAC418daeF956Bc0e6B2dd417c80CDA631";

const vip395 = () => {
  const meta = {
    version: "v2",
    title: "vip395 arbitrum Prime configuration",
    description: `#### Description
    This VIP will grant permission to timelocks and performs the necessary configuration of OmnichainProposalSender on BNB chain and OmnichainProposalExecutor`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: ARBITRUM_PRIME,
        signature: "addMarket(address,address,uint256,uint256)",
        params: [
          ARBITRUM_COMPTROLLER_CORE,
          ARBITRUM_VWBTC_CORE,
          ethers.utils.parseEther("2"),
          ethers.utils.parseEther("4"),
        ],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_PRIME,
        signature: "addMarket(address,address,uint256,uint256)",
        params: [
          ARBITRUM_COMPTROLLER_CORE,
          ARBITRUM_VUSDC_CORE,
          ethers.utils.parseEther("2"),
          ethers.utils.parseEther("4"),
        ],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_PRIME,
        signature: "addMarket(address,address,uint256,uint256)",
        params: [
          ARBITRUM_COMPTROLLER_CORE,
          ARBITRUM_VUSDT_CORE,
          ethers.utils.parseEther("2"),
          ethers.utils.parseEther("4"),
        ],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_PRIME,
        signature: "addMarket(address,address,uint256,uint256)",
        params: [
          ARBITRUM_COMPTROLLER_LST,
          ARBITRUM_VWETH_LST,
          ethers.utils.parseEther("2"),
          ethers.utils.parseEther("4"),
        ],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_PRIME,
        signature: "setLimit(uint256,uint256)",
        params: [
          0, // irrevocable
          500, // revocable
        ],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [CONVERTER_NETWORK, "addTokenConverter(address)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [CONVERTER_NETWORK, "removeTokenConverter(address)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_VAULT_TREASURY, "fundXVSVault(uint256)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_PROTOCOL_SHARE_RESERVE_PROXY,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            [0, 6000, ARBITRUM_VTREASURY],
            [0, 2000, XVS_VAULT_CONVERTER],
            [0, 500, USDC_PRIME_CONVERTER], // 25% of the Prime allocation
            [0, 500, USDT_PRIME_CONVERTER], // 25% of the Prime allocation
            [0, 300, WBTC_PRIME_CONVERTER], // 15% of the Prime allocation
            [0, 700, WETH_PRIME_CONVERTER], // 35% of the Prime allocation
            [1, 8000, ARBITRUM_VTREASURY],
            [1, 2000, XVS_VAULT_CONVERTER],
          ],
        ],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[0], USDTPrimeConverterTokenOuts, incentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[1], USDCPrimeConverterTokenOuts, incentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[2], WBTCPrimeConverterTokenOuts, incentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[3], WETHPrimeConverterTokenOuts, incentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[4], XVSVaultConverterTokenOuts, incentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumone,
      },
      ...addConverterNetworkCommands,
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip395;
