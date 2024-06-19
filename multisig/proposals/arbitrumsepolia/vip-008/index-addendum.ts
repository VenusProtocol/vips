import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

export const XVS_VAULT_PROXY = "0x407507DC2809D3aa31D54EcA3BEde5C5c4C8A17F";
export const XVS_STORE = "0x4e909DA6693215dC630104715c035B159dDb67Dd";
export const REWARDS_SPEED = "31709791983764";
export const XVS = "0x877Dc896e7b13096D3827872e396927BbE704407";
export const XVS_AMOUNT = parseUnits("5000", 18);

const VTREASURY = "0x4e7ab1fD841E1387Df4c91813Ae03819C33D5bdB";

const vip008 = () => {
  return makeProposal([
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, XVS_AMOUNT, XVS_STORE],
    },
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

export default vip008;
