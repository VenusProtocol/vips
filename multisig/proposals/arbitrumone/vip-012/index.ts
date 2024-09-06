import { ethers } from "hardhat";

import { makeProposal } from "../../../../src/utils";

const COMPTROLLER_BEACON = "0x8b6c2E8672504523Ca3a29a5527EcF47fC7d43FC";
const NEW_COMPTROLLER_IMPLEMENTATION = "0x4b256a7836415e09DabA40541eE78602Bc6B24bF";
const ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
const MULTISIG = "0x14e0E151b33f9802b3e75b621c1457afc44DcAA0";

export const vip012 = () => {
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
