import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumone } = NETWORK_ADDRESSES;

export const ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const PSR = "0xF9263eaF7eB50815194f26aCcAB6765820B13D41";

const vip010 = () => {
  return makeProposal([
    {
      target: PSR,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip010;