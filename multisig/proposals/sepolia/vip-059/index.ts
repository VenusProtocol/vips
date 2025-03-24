import { ethers } from "hardhat";

import { makeProposal } from "../../../../src/utils";

const COMPTROLLER_BEACON = "0x6cE54143a88CC22500D49D744fb6535D66a8294F";
const NEW_COMPTROLLER_IMPLEMENTATION = "0x110ca19E0549362e162F5b42Cd5F40be89F27a79";
const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
const GUARDIAN = "0x94fa6078b6b8a26F0B6EDFFBE6501B22A10470fB";

const vip059 = () => {
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

export default vip059;
