import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../src/utils";

export const REWARD_DISTRIBUTOR_CORE_0 = "0xEA3bb4A1C6218E31e435F3c23E0E9a05A40B7F40";
export const REWARD_DISTRIBUTOR_CORE_1 = "0xAbBAe88E3E62D6Ffb23D084bDFD2A1Dc45e15879";
export const REWARD_DISTRIBUTOR_CORE_2 = "0x6B3f9BBbBC8595f9c3C8e0082E95C45F98239E1b";
export const REWARD_DISTRIBUTOR_CORE_3 = "0x5e128F6B554589D3B1E91D53Aee161A70F439062";
const COMPTROLLER_CORE = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
const XVS = "0xDb633C11D3F9E6B8D17aC2c972C9e3B05DA59bF9";
const TREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";
const VUSDC_CORE = "0xF87bceab8DD37489015B426bA931e08A4D787616";
const VUSDT_CORE = "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff";
const VWBTC_CORE = "0x74E708A7F5486ed73CCCAe54B63e71B1988F1383";
const VWETH_CORE = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";
const XVS_VAULT_PROXY = "0xe507B30C41E9e375BCe05197c1e09fc9ee40c0f6";
const XVS_STORE = "0x4be90041D1e082EfE3613099aA3b987D9045d718";

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
