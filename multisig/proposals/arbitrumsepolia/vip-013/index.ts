import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumone } = NETWORK_ADDRESSES;

export const ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const PSR = "0x09267d30798B59c581ce54E861A084C6FC298666";

const vip013 = () => {
  return makeProposal([
    {
      target: PSR,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip013;