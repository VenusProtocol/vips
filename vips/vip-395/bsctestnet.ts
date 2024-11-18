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
} from "../../multisig/proposals/arbitrumsepolia/vip-019/Addresses";
import {
  addConverterNetworkCommands,
  incentiveAndAccessibilities,
} from "../../multisig/proposals/arbitrumsepolia/vip-019/commands";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

export const ARBITRUM_SEPOLIA_COMPTROLLER_CORE = "0x006D44b6f5927b3eD83bD0c1C36Fb1A3BaCaC208";
export const ARBITRUM_SEPOLIA_COMPTROLLER_LST = "0x3D04F926b2a165BBa17FBfccCCB61513634fa5e4";
export const ARBITRUM_SEPOLIA_PRIME = "0xAdB04AC4942683bc41E27d18234C8DC884786E89";
export const ARBITRUM_SEPOLIA_PLP = "0xE82c2c10F55D3268126C29ec813dC6F086904694";

export const ARBITRUM_SEPOLIA_USDT = "0xf3118a17863996B9F2A073c9A66Faaa664355cf8";
export const ARBITRUM_SEPOLIA_USDC = "0x86f096B1D970990091319835faF3Ee011708eAe8";
export const ARBITRUM_SEPOLIA_WBTC = "0xFb8d93FD3Cf18386a5564bb5619cD1FdB130dF7D";
export const ARBITRUM_SEPOLIA_WETH = "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73";

export const ARBITRUM_SEPOLIA_VUSDT_CORE = "0xdEFbf0F9Ab6CdDd0a1FdDC894b358D0c0a39B052";
export const ARBITRUM_SEPOLIA_VUSDC_CORE = "0xd9d1e754464eFc7493B177d2c7be04816E089b4C";
export const ARBITRUM_SEPOLIA_VWBTC_CORE = "0x49FB90A5815904649C44B87001a160C1301D6a2C";
export const ARBITRUM_SEPOLIA_VWETH_LST = "0xd7057250b439c0849377bB6C3263eb8f9cf49d98";

export const ARBITRUM_SEPOLIA_XVS_VAULT_TREASURY = "0x309b71a417dA9CfA8aC47e6038000B1739d9A3A6";
export const ARBITRUM_SEPOLIA_PROTOCOL_SHARE_RESERVE_PROXY = "0x09267d30798B59c581ce54E861A084C6FC298666";
export const ARBITRUM_SEPOLIA_VTREASURY = "0x4e7ab1fD841E1387Df4c91813Ae03819C33D5bdB";

const vip395 = () => {
  const meta = {
    version: "v2",
    title: "vip395 arbitrum sepolia Prime configuration",
    description: `#### Description
    This VIP will grant permission to timelocks and performs the necessary configuration of OmnichainProposalSender on BNB chain and OmnichainProposalExecutor on SEPOLIA & OPBNBTESTNET chains`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: ARBITRUM_SEPOLIA_PRIME,
        signature: "addMarket(address,address,uint256,uint256)",
        params: [
          ARBITRUM_SEPOLIA_COMPTROLLER_CORE,
          ARBITRUM_SEPOLIA_VWBTC_CORE,
          ethers.utils.parseEther("2"),
          ethers.utils.parseEther("4"),
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_PRIME,
        signature: "addMarket(address,address,uint256,uint256)",
        params: [
          ARBITRUM_SEPOLIA_COMPTROLLER_CORE,
          ARBITRUM_SEPOLIA_VUSDC_CORE,
          ethers.utils.parseEther("2"),
          ethers.utils.parseEther("4"),
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_PRIME,
        signature: "addMarket(address,address,uint256,uint256)",
        params: [
          ARBITRUM_SEPOLIA_COMPTROLLER_CORE,
          ARBITRUM_SEPOLIA_VUSDT_CORE,
          ethers.utils.parseEther("2"),
          ethers.utils.parseEther("4"),
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_PRIME,
        signature: "addMarket(address,address,uint256,uint256)",
        params: [
          ARBITRUM_SEPOLIA_COMPTROLLER_LST,
          ARBITRUM_SEPOLIA_VWETH_LST,
          ethers.utils.parseEther("2"),
          ethers.utils.parseEther("4"),
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_PRIME,
        signature: "setLimit(uint256,uint256)",
        params: [
          0, // irrevocable
          500, // revocable
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [CONVERTER_NETWORK, "addTokenConverter(address)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [CONVERTER_NETWORK, "removeTokenConverter(address)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS_VAULT_TREASURY, "fundXVSVault(uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_PROTOCOL_SHARE_RESERVE_PROXY,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            [0, 6000, ARBITRUM_SEPOLIA_VTREASURY],
            [0, 2000, XVS_VAULT_CONVERTER],
            [0, 500, USDC_PRIME_CONVERTER], // 25% of the Prime allocation
            [0, 500, USDT_PRIME_CONVERTER], // 25% of the Prime allocation
            [0, 300, WBTC_PRIME_CONVERTER], // 15% of the Prime allocation
            [0, 700, WETH_PRIME_CONVERTER], // 35% of the Prime allocation
            [1, 8000, ARBITRUM_SEPOLIA_VTREASURY],
            [1, 2000, XVS_VAULT_CONVERTER],
          ],
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[0], USDTPrimeConverterTokenOuts, incentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[1], USDCPrimeConverterTokenOuts, incentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[2], WBTCPrimeConverterTokenOuts, incentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[3], WETHPrimeConverterTokenOuts, incentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[4], XVSVaultConverterTokenOuts, incentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      ...addConverterNetworkCommands,
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip395;
