import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opbnbtestnet } = NETWORK_ADDRESSES;

export const ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
export const PSR = "0xc355dEb1A9289f8C58CFAa076EEdBf51F3A8Da7F";

const vip019 = () => {
  return makeProposal([
    {
      target: PSR,
      signature: "transferOwnership(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip019;