import { ethers } from "hardhat";

import { cutParams as params } from "../../simulations/vip-192/vip-192/utils/cut-params.json";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const XVS_VAULT_PROXY = "0x051100480289e704d20e9DB4804837068f3f9204";
const XVS_VAULT_IMPL = "0xEA456C6a52c36Ae021D93cf69812260149Ec39c2";
const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
const PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";
const GUARDIAN = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B"
const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";

const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const BTC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const USDT = "0x55d398326f99059fF775485246999027B3197955";

const vETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
const vBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";

const PRIME_POOL_ID = 0;

const cutParams = params;

export default [
  {
    target: UNITROLLER,
    signature: "diamondCut((address,uint8,bytes4[])[])",
    params: [cutParams],
  },
  {
    target: XVS_VAULT_PROXY,
    signature: "_setPendingImplementation(address)",
    params: [XVS_VAULT_IMPL],
  },
  {
    target: XVS_VAULT_IMPL,
    signature: "_become(address)",
    params: [XVS_VAULT_PROXY],
  },
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
    params: [PRIME_LIQUIDITY_PROVIDER, "setTokensDistributionSpeed(address[],uint256[])", NORMAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME_LIQUIDITY_PROVIDER, "setMaxTokensDistributionSpeed(address[],uint256[])", NORMAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME_LIQUIDITY_PROVIDER, "setMaxLoopsLimit(uint256)", NORMAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME_LIQUIDITY_PROVIDER, "pauseFundsTransfer()", NORMAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME_LIQUIDITY_PROVIDER, "pauseFundsTransfer()", GUARDIAN],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME_LIQUIDITY_PROVIDER, "resumeFundsTransfer()", NORMAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME_LIQUIDITY_PROVIDER, "resumeFundsTransfer()", GUARDIAN],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME_LIQUIDITY_PROVIDER, "setTokensDistributionSpeed(address[],uint256[])", FAST_TRACK_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME_LIQUIDITY_PROVIDER, "setMaxTokensDistributionSpeed(address[],uint256[])", FAST_TRACK_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME_LIQUIDITY_PROVIDER, "setMaxLoopsLimit(uint256)", FAST_TRACK_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME_LIQUIDITY_PROVIDER, "pauseFundsTransfer()", FAST_TRACK_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME_LIQUIDITY_PROVIDER, "resumeFundsTransfer()", FAST_TRACK_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME_LIQUIDITY_PROVIDER, "setTokensDistributionSpeed(address[],uint256[])", CRITICAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME_LIQUIDITY_PROVIDER, "setMaxTokensDistributionSpeed(address[],uint256[])", CRITICAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME_LIQUIDITY_PROVIDER, "setMaxLoopsLimit(uint256)", CRITICAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME_LIQUIDITY_PROVIDER, "pauseFundsTransfer()", CRITICAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME_LIQUIDITY_PROVIDER, "resumeFundsTransfer()", CRITICAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "updateAlpha(uint128,uint128)", NORMAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "updateMultipliers(address,uint256,uint256)", NORMAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "setStakedAt(address[],uint256[])", NORMAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "addMarket(address,uint256,uint256)", NORMAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "setLimit(uint256,uint256)", NORMAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "setMaxLoopsLimit(uint256)", NORMAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "issue(bool,address[])", NORMAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "burn(address)", NORMAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "togglePause()", NORMAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "togglePause()", GUARDIAN],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "updateAlpha(uint128,uint128)", FAST_TRACK_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "updateMultipliers(address,uint256,uint256)", FAST_TRACK_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "setStakedAt(address[],uint256[])", FAST_TRACK_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "addMarket(address,uint256,uint256)", FAST_TRACK_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "setLimit(uint256,uint256)", FAST_TRACK_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "setMaxLoopsLimit(uint256)", FAST_TRACK_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "issue(bool,address[])", FAST_TRACK_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "burn(address)", FAST_TRACK_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "togglePause()", FAST_TRACK_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "updateAlpha(uint128,uint128)", CRITICAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "updateMultipliers(address,uint256,uint256)", CRITICAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "setStakedAt(address[],uint256[])", CRITICAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "addMarket(address,uint256,uint256)", CRITICAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "setLimit(uint256,uint256)", CRITICAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "setMaxLoopsLimit(uint256)", CRITICAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "issue(bool,address[])", CRITICAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "burn(address)", CRITICAL_TIMELOCK],
  },
  {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [PRIME, "togglePause()", CRITICAL_TIMELOCK],
  },
  {
    target: PRIME_LIQUIDITY_PROVIDER,
    signature: "setPrimeToken(address)",
    params: [PRIME],
  },
  {
    target: UNITROLLER,
    signature: "_setPrimeToken(address)",
    params: [PRIME],
  },
  {
    target: PRIME_LIQUIDITY_PROVIDER,
    signature: "initializeTokens(address[])",
    params: [[ETH, BTC, USDC, USDT]],
  },
  {
    target: PRIME_LIQUIDITY_PROVIDER,
    signature: "setTokensDistributionSpeed(address[],uint256[])",
    params: [
      [ETH, BTC, USDC, USDT],
      [0, 0, 0, 0],
    ],
  },
  {
    target: PRIME,
    signature: "addMarket(address,uint256,uint256)",
    params: [vETH, ethers.utils.parseEther("2"), ethers.utils.parseEther("4")],
  },
  {
    target: PRIME,
    signature: "addMarket(address,uint256,uint256)",
    params: [vBTC, ethers.utils.parseEther("2"), ethers.utils.parseEther("4")],
  },
  {
    target: PRIME,
    signature: "addMarket(address,uint256,uint256)",
    params: [vUSDC, ethers.utils.parseEther("2"), ethers.utils.parseEther("4")],
  },
  {
    target: PRIME,
    signature: "addMarket(address,uint256,uint256)",
    params: [vUSDT, ethers.utils.parseEther("2"), ethers.utils.parseEther("4")],
  },
  {
    target: PRIME,
    signature: "setLimit(uint256,uint256)",
    params: [
      0, // irrevocable
      500, // revocable
    ],
  },
  {
    target: PRIME_LIQUIDITY_PROVIDER,
    signature: "pauseFundsTransfer()",
    params: [],
  },
  {
    target: XVS_VAULT_PROXY,
    signature: "setPrimeToken(address,address,uint256)",
    params: [PRIME, XVS, PRIME_POOL_ID],
  }
];
