import { makeProposal } from "../../../src/utils";

export const REWARD_DISTRIBUTOR_CORE_0 = "0xEA3bb4A1C6218E31e435F3c23E0E9a05A40B7F40";
export const REWARD_DISTRIBUTOR_CORE_1 = "0xAbBAe88E3E62D6Ffb23D084bDFD2A1Dc45e15879";
export const REWARD_DISTRIBUTOR_CORE_2 = "0x6B3f9BBbBC8595f9c3C8e0082E95C45F98239E1b";
export const REWARD_DISTRIBUTOR_CORE_3 = "0x5e128F6B554589D3B1E91D53Aee161A70F439062";
export const COMPTROLLER_CORE = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
const COMPTROLLER_CORE_BEACON = "0x6cE54143a88CC22500D49D744fb6535D66a8294F";
export const XVS = "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E";

export const vip007 = () => {
  return makeProposal([
    {
      target: COMPTROLLER_CORE_BEACON,
      signature: "upgradeTo(address)",
      params: ["0xffDCeA4f8E8E76CE523610AF66968C65F2325f14"],
    },
    {
      target: COMPTROLLER_CORE,
      signature: "removeRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_CORE_0],
    },
    {
      target: COMPTROLLER_CORE,
      signature: "removeRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_CORE_1],
    },
    {
      target: COMPTROLLER_CORE,
      signature: "removeRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_CORE_2],
    },
    {
      target: COMPTROLLER_CORE,
      signature: "removeRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_CORE_3],
    },
    {
      target: COMPTROLLER_CORE_BEACON,
      signature: "upgradeTo(address)",
      params: ["0x0bA3dBDb53a367e9132587c7Fc985153A2E25f08"],
    },
  ]);
};
