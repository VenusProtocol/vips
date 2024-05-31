import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

export const XVS_VAULT_PROXY = "0x8b79692AAB2822Be30a6382Eb04763A74752d5B4";
export const XVS_STORE = "0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e";
export const REWARDS_SPEED = 0; // to be decided
export const XVS = "0xc1Eb7689147C81aC840d4FF0D298489fc7986d52";
export const XVS_AMOUNT = parseUnits("5000", 18);

const VTREASURY = "0x8a662ceAC418daeF956Bc0e6B2dd417c80CDA631";

const vip009 = () => {
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

export default vip009;
