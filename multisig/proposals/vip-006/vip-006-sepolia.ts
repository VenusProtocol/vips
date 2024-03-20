import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../src/utils";

export const REWARD_DISTRIBUTOR_CORE_0 = "0xB60666395bEFeE02a28938b75ea620c7191cA77a";
export const REWARD_DISTRIBUTOR_CORE_1 = "0x341f52BfecC10115087e46eB94AA06E384b8925E";
export const COMPTROLLER_CORE = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
export const REWARD_DISTRIBUTOR_CURVE_0 = "0x67dA6435b35d43081c7c27685fAbb2662b7f1290";
export const REWARD_DISTRIBUTOR_CURVE_1 = "0xF6D57F8e37b1cb627470b5254fAb08dE07B49A0F";
export const COMPTROLLER_CURVE = "0xD298182D3ACb43e98e32757FF09C91F203e9E67E";
export const REWARD_DISTRIBUTOR_LST_0 = "0x4597B9287fE0DF3c5513D66886706E0719bD270f";
export const REWARD_DISTRIBUTOR_LST_1 = "0xec594364d2B7eB3678f351Ac632cC71E718E0F89";
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
// CORE  - RD0: 510 XVS, RD1: 1250 CRV
// CURVE - RD0: 75 XVS, RD1: 1250 CRV
// LST   - RD0: 705 XVS, RD1: 0.154 WSTETH

export const vip006 = () => {
  return makeProposal([
    // CORE POOL REWARDS
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, parseUnits("510", 18), REWARD_DISTRIBUTOR_CORE_0],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [CRV, parseUnits("1250", 18), REWARD_DISTRIBUTOR_CORE_1],
    },
    // CURVE POOL REWARDS
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, parseUnits("75", 18), REWARD_DISTRIBUTOR_CURVE_0],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [CRV, parseUnits("1250", 18), REWARD_DISTRIBUTOR_CURVE_1],
    },

    // LIQUID STAKED ETH POOL REWARDS
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, parseUnits("705", 18), REWARD_DISTRIBUTOR_LST_0],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WSTETH, parseUnits("0.154", 18), REWARD_DISTRIBUTOR_LST_1],
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
      params: [
        [VWETH_CORE, VWBTC_CORE, VUSDT_CORE, VUSDC_CORE, VCRVUSD_CORE],
        ["27777777777777", "83333333333333", "83333333333333", "83333333333333", "37037037037036"],
        ["41666666666666", "125000000000000", "125000000000000", "125000000000000", "55555555555555"],
      ],
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
      params: [[VCRVUSD_CORE], ["771604938271604"], ["1157407407407407"]],
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
      params: [
        [VCRV_CURVE, VCRVUSD_CURVE],
        ["9259259259259", "37037037037037"],
        ["13888888888888", "55555555555555"],
      ],
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
      params: [[VCRVUSD_CURVE], ["771604938271604"], ["1157407407407407"]],
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
      params: [
        [VWSTETH_LST, VWETH_LST],
        ["222222222222222", "254629629629629"],
        ["0", "594135802469135"],
      ],
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
      params: [[VWSTETH_LST], ["712962962962"], ["0"]],
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
