import { ethers } from "hardhat";

import { makeProposal } from "../../../../src/utils";

const COMPTROLLER_BEACON = "0x12Dcb8D9F1eE7Ad7410F5B36B07bcC7891ab4cEf";
const NEW_COMPTROLLER_IMPLEMENTATION = "0x3b8b6E96e57f0d1cD366AaCf4CcC68413aF308D0";
const ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
const MULTISIG = "0x1426A5Ae009c4443188DA8793751024E358A61C2";

const vip012 = () => {
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

export default vip012;
