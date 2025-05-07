import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { acceptOwnershipCommandsAllConverters, callPermissionCommands, setConverterNetworkCommands } from "./commands";
import { CONVERTER_NETWORK, XVS_VAULT_TREASURY } from "./testnetAddresses";

const { unichainsepolia } = NETWORK_ADDRESSES;

export const PRIME_LIQUIDITY_PROVIDER = "0xDA4dcFBdC06A9947100a757Ee0eeDe88debaD586";
export const PRIME = "0x59b95BF96D6D5FA1adf1Bfd20848A9b25814317A";
export const POOL_REGISTRY = "0x9027cF782515F3184bbF7A6cD7a33052dc52E439";
export const COMPTROLLER_CORE = "0xFeD3eAA668a6179c9E5E1A84e3A7d6883F06f7c1";
export const WETH = "0x4200000000000000000000000000000000000006";
export const USDC = "0xf16d4774893eB578130a645d5c69E9c4d183F3A5";
export const vWETH = "0x3dEAcBe87e4B6333140a46aBFD12215f4130B132";
export const vUSDC = "0x0CA7edfcCF5dbf8AFdeAFB2D918409d439E3320A";

const PRIME_POOL_ID = 0;

export const vip501 = () => {
  const meta = {
    version: "v2",
    title: "",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "initializeTokens(address[])",
        params: [[WETH, USDC]],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [WETH, USDC],
          [0, 0],
        ],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: unichainsepolia.XVS_VAULT_PROXY,
        signature: "setPrimeToken(address,address,uint256)",
        params: [PRIME, unichainsepolia.XVS, PRIME_POOL_ID],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: PRIME,
        signature: "addMarket(address,address,uint256,uint256)",
        params: [COMPTROLLER_CORE, vWETH, ethers.utils.parseEther("2"), ethers.utils.parseEther("4")],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: PRIME,
        signature: "addMarket(address,address,uint256,uint256)",
        params: [COMPTROLLER_CORE, vUSDC, ethers.utils.parseEther("2"), ethers.utils.parseEther("4")],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: PRIME,
        signature: "setLimit(uint256,uint256)",
        params: [
          0, // irrevocable
          500, // revocable
        ],
        dstChainId: LzChainId.unichainsepolia,
      },

      // Configure Converters

      ...acceptOwnershipCommandsAllConverters,
      {
        target: XVS_VAULT_TREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: CONVERTER_NETWORK,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainsepolia,
      },
      ...callPermissionCommands,
      ...setConverterNetworkCommands,
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip501;
