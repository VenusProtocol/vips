import { ethers } from "hardhat";

import { makeProposal } from "../../../../src/utils";

const COMPTROLLER_BEACON = "0xAE2C3F21896c02510aA187BdA0791cDA77083708";
const NEW_COMPTROLLER_IMPLEMENTATION = "0xC910F2B196C516253e88b2097ba5D7d5fC9fa84e";
const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
const GUARDIAN = "0x285960C5B22fD66A736C7136967A3eB15e93CC67";

export const vip059 = () => {
  return makeProposal([
    {
      target: COMPTROLLER_BEACON,
      signature: "upgradeTo(address)",
      params: [NEW_COMPTROLLER_IMPLEMENTATION],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ethers.constants.AddressZero, "unlistMarket(address)", GUARDIAN],
    },
  ]);
};
