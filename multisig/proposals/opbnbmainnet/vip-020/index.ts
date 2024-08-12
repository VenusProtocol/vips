import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumone } = NETWORK_ADDRESSES;

export const ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const PSR = "0xA2EDD515B75aBD009161B15909C19959484B0C1e";

const vip020 = () => {
  return makeProposal([
    {
      target: PSR,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip020;