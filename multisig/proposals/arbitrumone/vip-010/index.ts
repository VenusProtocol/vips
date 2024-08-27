import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumone } = NETWORK_ADDRESSES;

export const ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const REWARD_DISTRIBUTORS = ["0x53b488baA4052094495b6De9E5505FE1Ee3EAc7a"];

const vip010 = () => {
  return makeProposal([
    ...REWARD_DISTRIBUTORS.map(rewardDistributor => {
      return {
        target: rewardDistributor,
        signature: "transferOwnership(address)",
        params: [arbitrumone.NORMAL_TIMELOCK],
      };
    }),
  ]);
};

export default vip010;
