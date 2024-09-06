import { ethers } from "hardhat";

import { makeProposal } from "../../../../src/utils";

const COMPTROLLER_BEACON = "0x11C3e19236ce17729FC66b74B537de00C54d44e7";
const NEW_COMPTROLLER_IMPLEMENTATION = "0xD3b2431c186A2bDEB61b86D9B042B75C954004F6";
const ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
const MULTISIG = "0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207";

export const vip016 = () => {
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

export default vip016;
