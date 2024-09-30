import { ethers } from "hardhat";

import { makeProposal } from "../../../../src/utils";

export const VTOKEN_BEACON = "0xfc08aADC7a1A93857f6296C3fb78aBA1d286533a";
export const NEW_VTOKEN_IMPLEMENTATION = "0xefdf5CcC12d8cff4a7ed4e421b95F8f69Cf2F766";

export const vip063 = () => {
  return makeProposal([
    {
      target: VTOKEN_BEACON,
      signature: "upgradeTo(address)",
      params: [NEW_VTOKEN_IMPLEMENTATION],
    },
  ]);
};

export default vip063;
