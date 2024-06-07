import { ethers } from "hardhat";

import { makeProposal } from "../../../../src/utils";

const COMPTROLLER_BEACON = "0x12Dcb8D9F1eE7Ad7410F5B36B07bcC7891ab4cEf";
const NEW_COMPTROLLER_IMPLEMENTATION = "0x3cE617FCeb5e9Ed622F73b483aC7c94053795197";
const ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
const MULTISIG = "0x1426A5Ae009c4443188DA8793751024E358A61C2";

export const vip002 = () => {
  return makeProposal([
    {
      target: COMPTROLLER_BEACON,
      signature: "upgradeTo(address)",
      params: [NEW_COMPTROLLER_IMPLEMENTATION],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ethers.constants.AddressZero, "unlistMarket(address)", MULTISIG],
    },
  ]);
};
