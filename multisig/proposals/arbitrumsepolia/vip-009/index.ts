import { makeProposal } from "../../../../src/utils";

export const XVS_VAULT_PROXY = "0x407507DC2809D3aa31D54EcA3BEde5C5c4C8A17F";
export const REWARDS_SPEED = "31709791983764";
export const XVS = "0x877Dc896e7b13096D3827872e396927BbE704407";

const vip009 = () => {
  return makeProposal([
    {
      target: XVS_VAULT_PROXY,
      signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
      params: [XVS, REWARDS_SPEED],
    },
    {
      target: XVS_VAULT_PROXY,
      signature: "resume()",
      params: [],
    },
  ]);
};

export default vip009;
