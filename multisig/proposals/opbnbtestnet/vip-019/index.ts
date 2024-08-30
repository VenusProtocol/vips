import { ethers } from "hardhat";

import { makeProposal } from "../../../../src/utils";

const COMPTROLLER_BEACON = "0x2020BDa1F931E07B14C9d346E2f6D5943b4cd56D";
const NEW_COMPTROLLER_IMPLEMENTATION = "0x0012875a7395a293Adfc9b5cDC2Cfa352C4cDcD3";
const ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
const OPBNBTESTNET_MULTISIG = "0xb15f6EfEbC276A3b9805df81b5FB3D50C2A62BDf";

export const vip019 = () => {
  return makeProposal([
    {
      target: COMPTROLLER_BEACON,
      signature: "upgradeTo(address)",
      params: [NEW_COMPTROLLER_IMPLEMENTATION],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ethers.constants.AddressZero, "unlistMarket(address)", OPBNBTESTNET_MULTISIG],
    },
  ]);
};
