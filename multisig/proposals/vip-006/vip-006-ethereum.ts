import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../src/utils";

export const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
export const ETHEREUM_TREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
export const XVS_REWARD_AMOUNT = parseUnits("22500", 18);
export const XVS_STORE = "0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B";
const XVS_VAULT_PROXY = "0xA0882C2D5DF29233A092d2887A258C2b90e9b994";
export const REWARD_DISTRIBUTOR_CORE_0 = "0x134bfDEa7e68733921Bc6A87159FB0d68aBc6Cf8";
export const REWARD_DISTRIBUTOR_CORE_1 = "0x76611EEA26aF8842281B56Bb742129E77133592F";
export const COMPTROLLER_CORE = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
export const REWARD_DISTRIBUTOR_CURVE_0 = "0x8473B767F68250F5309bae939337136a899E43F9";
export const REWARD_DISTRIBUTOR_CURVE_1 = "0x5f65A7b60b4F91229B8484F80bc2EEc52758EAf9";
export const COMPTROLLER_CURVE = "0x67aA3eCc5831a65A5Ba7be76BED3B5dc7DB60796";
export const REWARD_DISTRIBUTOR_LST_0 = "0x7A91bEd36D96E4e644d3A181c287E0fcf9E9cc98";
export const REWARD_DISTRIBUTOR_LST_1 = "0xe72Aa7BaB160eaa2605964D2379AA56Cb4b9A1BB";
export const COMPTROLLER_LST = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";
export const VUSDC_CORE = "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb";
export const VUSDT_CORE = "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E";
export const VWBTC_CORE = "0x8716554364f20BCA783cb2BAA744d39361fd1D8d";
export const VWETH_CORE = "0x7c8ff7d2A1372433726f879BD945fFb250B94c65";
export const VCRVUSD_CORE = "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202";
export const VCRV_CURVE = "0x30aD10Bd5Be62CAb37863C2BfcC6E8fb4fD85BDa";
export const VCRVUSD_CURVE = "0x2d499800239C4CD3012473Cb1EAE33562F0A6933";
export const VWETH_LST = "0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2";
export const VWSTETH_LST = "0x4a240F0ee138697726C8a3E43eFE6Ac3593432CB";
export const CRV = "0xD533a949740bb3306d119CC777fa900bA034cd52";
export const WSTETH = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";
// REWARDS TO TRANSFER FOR EACH REWARD DISTRIBUTOR
// CORE  - RD0: 51000 XVS, RD1: 125000 CRV
// CURVE - RD0: 7500 XVS, RD1: 125000 CRV
// LST   - RD0: 69400 XVS, RD1: 15.4 WSTETH

export const vip006 = () => {
  return makeProposal([
    {
      target: ETHEREUM_TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, XVS_REWARD_AMOUNT, XVS_STORE],
    },
    {
      target: XVS_VAULT_PROXY,
      signature: "setRewardAmountPerBlock(address,uint256)",
      params: [XVS, "34722222222222222"],
    },
    // CORE POOL REWARDS
    {
      target: ETHEREUM_TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, parseUnits("51000", 18), REWARD_DISTRIBUTOR_CORE_0],
    },
    {
      target: ETHEREUM_TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [CRV, parseUnits("125000", 18), REWARD_DISTRIBUTOR_CORE_1],
    },
    // CURVE POOL REWARDS
    {
      target: ETHEREUM_TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, parseUnits("7500", 18), REWARD_DISTRIBUTOR_CURVE_0],
    },
    {
      target: ETHEREUM_TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [CRV, parseUnits("125000", 18), REWARD_DISTRIBUTOR_CURVE_1],
    },

    // LIQUID STAKED ETH POOL REWARDS
    {
      target: ETHEREUM_TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, parseUnits("69400", 18), REWARD_DISTRIBUTOR_LST_0],
    },
    {
      target: ETHEREUM_TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WSTETH, parseUnits("15.4", 18), REWARD_DISTRIBUTOR_LST_1],
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
        ["2777777777777777", "8333333333333333", "8333333333333333", "8333333333333333", "3703703703703703"],
        ["4166666666666666", "12500000000000000", "12500000000000000", "12500000000000000", "5555555555555555"],
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
      params: [[VCRVUSD_CORE], ["77160493827160493"], ["115740740740740740"]],
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
        ["925925925925925", "3703703703703703"],
        ["1388888888888888", "5555555555555555"],
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
      params: [[VCRVUSD_CURVE], ["77160493827160493"], ["115740740740740740"]],
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
        ["22222222222222222", "25462962962962962"],
        ["0", "59413580246913580"],
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
      params: [[VWSTETH_LST], ["71296296296296"], ["0"]],
    },
  ]);
};
