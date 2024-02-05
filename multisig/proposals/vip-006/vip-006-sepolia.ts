import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../src/utils";

export const REWARD_DISTRIBUTOR_CORE_0 = "0x78d1D10F4772982B82497cA010aBFF0601B66c4a";
export const REWARD_DISTRIBUTOR_CORE_1 = "0x3cE1A4C37C6F5106F3a04B93515Ce53F26C8DAC2";
export const REWARD_DISTRIBUTOR_CORE_2 = "0xf06f1A32C3b5504E7a932d736F2d10612abC55d3";
export const REWARD_DISTRIBUTOR_CORE_3 = "0xa822b4aadc53A7641ce84c690C3109fD336440Aa";
export const COMPTROLLER_CORE = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
export const XVS = "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E";
export const VUSDC_CORE = "0xF87bceab8DD37489015B426bA931e08A4D787616";
export const VUSDT_CORE = "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff";
export const VWBTC_CORE = "0x74E708A7F5486ed73CCCAe54B63e71B1988F1383";
export const VWETH_CORE = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";
const XVS_VAULT_PROXY = "0x1129f882eAa912aE6D4f6D445b2E2b1eCbA99fd5";
const XVS_STORE = "0x03B868C7858F50900fecE4eBc851199e957b5d3D";
const TREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";

const XVS_REWARD_AMOUNT = parseUnits("1000", 18);

export const vip006 = () => {
  return makeProposal([
    {
      target: COMPTROLLER_CORE,
      signature: "addRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_CORE_0],
    },
    {
      target: COMPTROLLER_CORE,
      signature: "addRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_CORE_1],
    },
    {
      target: COMPTROLLER_CORE,
      signature: "addRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_CORE_2],
    },
    {
      target: COMPTROLLER_CORE,
      signature: "addRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_CORE_3],
    },
    {
      target: REWARD_DISTRIBUTOR_CORE_0,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: REWARD_DISTRIBUTOR_CORE_1,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: REWARD_DISTRIBUTOR_CORE_2,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: REWARD_DISTRIBUTOR_CORE_3,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, XVS_REWARD_AMOUNT, REWARD_DISTRIBUTOR_CORE_0],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, XVS_REWARD_AMOUNT, REWARD_DISTRIBUTOR_CORE_1],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, XVS_REWARD_AMOUNT, REWARD_DISTRIBUTOR_CORE_2],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, XVS_REWARD_AMOUNT, REWARD_DISTRIBUTOR_CORE_3],
    },
    {
      target: REWARD_DISTRIBUTOR_CORE_0,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[VWBTC_CORE], ["190258751902587"], ["190258751902587"]],
    },
    {
      target: REWARD_DISTRIBUTOR_CORE_1,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[VWETH_CORE], ["190258751902587"], ["190258751902587"]],
    },
    {
      target: REWARD_DISTRIBUTOR_CORE_2,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[VUSDC_CORE], ["190258751902587"], ["190258751902587"]],
    },
    {
      target: REWARD_DISTRIBUTOR_CORE_3,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[VUSDT_CORE], ["190258751902587"], ["190258751902587"]],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, XVS_REWARD_AMOUNT, XVS_STORE],
    },
    {
      target: XVS_VAULT_PROXY,
      signature: "setRewardAmountPerBlock(address,uint256)",
      params: [XVS, "380517503805175"],
    },
  ]);
};
