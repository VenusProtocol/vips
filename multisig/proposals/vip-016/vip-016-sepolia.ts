import { ethers } from "hardhat";

import { makeProposal } from "../../../src/utils";

const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
const XVS_VAULT_PROXY = "0x1129f882eAa912aE6D4f6D445b2E2b1eCbA99fd5";
const PRIME_LIQUIDITY_PROVIDER = "0x15242a55Ad1842A1aEa09c59cf8366bD2f3CE9B4";
const PRIME = "0x2Ec432F123FEbb114e6fbf9f4F14baF0B1F14AbC";
const GUARDIAN = "0x94fa6078b6b8a26F0B6EDFFBE6501B22A10470fB";
const XVS = "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E";
const COMPTROLLER = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";

const ETH = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
const BTC = "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b";
const USDC = "0x772d68929655ce7234C8C94256526ddA66Ef641E";
const USDT = "0x8d412FD0bc5d826615065B931171Eed10F5AF266";

const vETH = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";
const vBTC = "0x74E708A7F5486ed73CCCAe54B63e71B1988F1383";
const vUSDC = "0xF87bceab8DD37489015B426bA931e08A4D787616";
const vUSDT = "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff";

const POOL_REGISTRY = "0x758f5715d817e02857Ba40889251201A5aE3E186";

const PRIME_POOL_ID = 0;

export const vip016 = () => {
  return makeProposal([
    {
      target: PRIME_LIQUIDITY_PROVIDER,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: PRIME,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME_LIQUIDITY_PROVIDER, "setTokensDistributionSpeed(address[],uint256[])", GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME_LIQUIDITY_PROVIDER, "setMaxTokensDistributionSpeed(address[],uint256[])", GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME_LIQUIDITY_PROVIDER, "setMaxLoopsLimit(uint256)", GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME_LIQUIDITY_PROVIDER, "pauseFundsTransfer()", GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME_LIQUIDITY_PROVIDER, "resumeFundsTransfer()", GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "updateAlpha(uint128,uint128)", GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "updateMultipliers(address,uint256,uint256)", GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "setStakedAt(address[],uint256[])", GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "addMarket(address,address,uint256,uint256)", GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "setLimit(uint256,uint256)", GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "setMaxLoopsLimit(uint256)", GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "issue(bool,address[])", GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "burn(address)", GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "togglePause()", GUARDIAN],
    },
    {
      target: PRIME_LIQUIDITY_PROVIDER,
      signature: "setPrimeToken(address)",
      params: [PRIME],
    },
    {
      target: COMPTROLLER,
      signature: "setPrimeToken(address)",
      params: [PRIME],
    },
    {
      target: XVS_VAULT_PROXY,
      signature: "setPrimeToken(address,address,uint256)",
      params: [PRIME, XVS, PRIME_POOL_ID],
    },
    {
      target: PRIME,
      signature: "initializeV2(address)",
      params: [POOL_REGISTRY],
    },
    {
      target: PRIME,
      signature: "setLimit(uint256,uint256)",
      params: [
        0, // irrevocable
        0, // revocable
      ],
    },
    {
      target: PRIME_LIQUIDITY_PROVIDER,
      signature: "pauseFundsTransfer()",
      params: [],
    },
  ]);
};
