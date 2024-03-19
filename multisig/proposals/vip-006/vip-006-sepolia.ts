import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../src/utils";

export const REWARD_DISTRIBUTOR_CORE_0 = "0xf32CF5C074279bB30165D1365D8EC2132C6Ae8f3";
export const REWARD_DISTRIBUTOR_CORE_1 = "0xCE283856d0AD386991A48875294CDBD7B8D47663";
export const REWARD_DISTRIBUTOR_CORE_2 = "0x1309ac8a414E29d91504edf57851AF546bB38197";
export const REWARD_DISTRIBUTOR_CORE_3 = "0x247C3344cE23caab71D7E4Af606039bC2A02fBdE";
export const COMPTROLLER_CORE = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
export const REWARD_DISTRIBUTOR_CURVE_0 = "0x46EF252f590F7f9BaAB39553811732e5357101Fa";
export const REWARD_DISTRIBUTOR_CURVE_1 = "0x636f92eF497c96Fa53b70f076CD399984B29F9C6";
export const REWARD_DISTRIBUTOR_CURVE_2 = "0xd51a858276f9A3dc0039653ead43D8c47F66a02e";
export const COMPTROLLER_CURVE = "0xD298182D3ACb43e98e32757FF09C91F203e9E67E";
export const REWARD_DISTRIBUTOR_LST_0 = "0x97D9B4105ed0f1e3E9C20B717891623ADFBa2203";
export const REWARD_DISTRIBUTOR_LST_1 = "0xbA88ad51b65c3c74d32a28D2dF869b7131f42B2D";
export const REWARD_DISTRIBUTOR_LST_2 = "0xc93305A9448851E602535ee3533e3908c46af7a3";
export const COMPTROLLER_LST = "0xd79CeB8EF8188E44b7Eb899094e8A3A4d7A1e236";
export const VUSDC_CORE = "0xF87bceab8DD37489015B426bA931e08A4D787616";
export const VUSDT_CORE = "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff";
export const VWBTC_CORE = "0x74E708A7F5486ed73CCCAe54B63e71B1988F1383";
export const VWETH_CORE = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";
export const VCRVUSD_CORE = "0xA09cFAd2e138fe6d8FF62df803892cbCb79ED082";
export const VCRV_CURVE = "0x9Db62c5BBc6fb79416545FcCBDB2204099217b78";
export const VCRVUSD_CURVE = "0xc7be132027e191636172798B933202E0f9CAD548";
export const VWETH_LST = "0x9f6213dFa9069a5426Fe8fAE73857712E1259Ed4";
export const VWSTETH_LST = "0x0a95088403229331FeF1EB26a11F9d6C8E73f23D";
export const XVS = "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E";
export const CRV = "0x2c78EF7eab67A6e0C9cAa6f2821929351bdDF3d3";
export const WSTETH = "0x9b87Ea90FDb55e1A0f17FBEdDcF7EB0ac4d50493";
const TREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";

// REWARDS TO TRANSFER FOR EACH REWARD DISTRIBUTOR
// CORE  - RD0: 45 XVS , RD1: 405 XVS , RD2: 60 XVS,  RD3: 1250 CRV
// CURVE - RD0: 15 XVS , RD1: 60 XVS  , RD2: 1250 CRV
// LST   - RD0: 155 XVS, RD1: 550 XVS , RD2: 0.154 WSTETH

export const vip006 = () => {
  return makeProposal([
    // CORE POOL REWARDS
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, parseUnits("45", 18), REWARD_DISTRIBUTOR_CORE_0],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, parseUnits("405", 18), REWARD_DISTRIBUTOR_CORE_1],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, parseUnits("60", 18), REWARD_DISTRIBUTOR_CORE_2],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [CRV, parseUnits("1250", 18), REWARD_DISTRIBUTOR_CORE_3],
    },
    // CURVE POOL REWARDS
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, parseUnits("15", 18), REWARD_DISTRIBUTOR_CURVE_0],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, parseUnits("60", 18), REWARD_DISTRIBUTOR_CURVE_1],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [CRV, parseUnits("1250", 18), REWARD_DISTRIBUTOR_CURVE_2],
    },

    // LIQUID STAKED ETH POOL REWARDS
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, parseUnits("155", 18), REWARD_DISTRIBUTOR_LST_0],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, parseUnits("550", 18), REWARD_DISTRIBUTOR_LST_1],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WSTETH, parseUnits("0.154", 18), REWARD_DISTRIBUTOR_LST_2],
    },
    // REWARDS CONFIGURATION
    { target: REWARD_DISTRIBUTOR_CORE_0, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_CORE,
      signature: "addRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_CORE_0],
    },
    {
      target: REWARD_DISTRIBUTOR_CORE_0,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[VWETH_CORE], ["27777777776000"], ["41666666664000"]],
    },
    { target: REWARD_DISTRIBUTOR_CORE_1, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_CORE,
      signature: "addRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_CORE_1],
    },
    {
      target: REWARD_DISTRIBUTOR_CORE_1,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [
        [VWBTC_CORE, VUSDT_CORE, VUSDC_CORE],
        ["83333333320000", "83333333320000", "83333333320000"],
        ["125000000000000", "125000000000000", "125000000000000"],
      ],
    },
    { target: REWARD_DISTRIBUTOR_CORE_2, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_CORE,
      signature: "addRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_CORE_2],
    },
    {
      target: REWARD_DISTRIBUTOR_CORE_2,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[VCRVUSD_CORE], ["37037037036000"], ["55555555554000"]],
    },
    { target: REWARD_DISTRIBUTOR_CORE_3, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_CORE,
      signature: "addRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_CORE_3],
    },
    {
      target: REWARD_DISTRIBUTOR_CORE_3,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[VCRVUSD_CORE], ["771604938400000"], ["1157407408000000"]],
    },
    { target: REWARD_DISTRIBUTOR_CURVE_0, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_CURVE,
      signature: "addRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_CURVE_0],
    },
    {
      target: REWARD_DISTRIBUTOR_CURVE_0,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[VCRV_CURVE], ["9259259260000"], ["13888888890000"]],
    },
    { target: REWARD_DISTRIBUTOR_CURVE_1, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_CURVE,
      signature: "addRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_CURVE_1],
    },
    {
      target: REWARD_DISTRIBUTOR_CURVE_1,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[VCRVUSD_CURVE], ["37037037036000"], ["55555555554000"]],
    },
    { target: REWARD_DISTRIBUTOR_CURVE_2, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_CURVE,
      signature: "addRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_CURVE_2],
    },
    {
      target: REWARD_DISTRIBUTOR_CURVE_2,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[VCRVUSD_CURVE], ["77160493840000000"], ["115740740800000000"]],
    },
    { target: REWARD_DISTRIBUTOR_LST_0, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_LST,
      signature: "addRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_LST_0],
    },
    {
      target: REWARD_DISTRIBUTOR_LST_0,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[VWSTETH_LST], ["222222222200000"], ["0"]],
    },
    { target: REWARD_DISTRIBUTOR_LST_1, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_LST,
      signature: "addRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_LST_1],
    },
    {
      target: REWARD_DISTRIBUTOR_LST_1,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[VWETH_LST], ["254629629600000"], ["594135802500000"]],
    },
    { target: REWARD_DISTRIBUTOR_LST_2, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_LST,
      signature: "addRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_LST_2],
    },
    {
      target: REWARD_DISTRIBUTOR_LST_2,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[VWSTETH_LST], ["712962963000"], ["0"]],
    },
    // These commands were previously executed. Just having them here for visibility
    // {
    //   target: TREASURY,
    //   signature: "withdrawTreasuryToken(address,uint256,address)",
    //   params: [XVS, XVS_REWARD_AMOUNT, XVS_STORE],
    // },
    // {
    //   target: XVS_VAULT_PROXY,
    //   signature: "setRewardAmountPerBlock(address,uint256)",
    //   params: [XVS, "380517503805175"],
    // },
  ]);
};
