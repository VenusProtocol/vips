import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const REWARD_DISTRIBUTORS = [
  "0xB60666395bEFeE02a28938b75ea620c7191cA77a",
  "0x341f52BfecC10115087e46eB94AA06E384b8925E",
  "0x67dA6435b35d43081c7c27685fAbb2662b7f1290",
  "0xF6D57F8e37b1cb627470b5254fAb08dE07B49A0F",
  "0x4597B9287fE0DF3c5513D66886706E0719bD270f",
  "0xec594364d2B7eB3678f351Ac632cC71E718E0F89",
  "0x92e8E3C202093A495e98C10f9fcaa5Abe288F74A",
];

const vip052 = () => {
  return makeProposal([
    ...REWARD_DISTRIBUTORS.map(rewardDistributor => {
      return {
        target: rewardDistributor,
        signature: "transferOwnership(address)",
        params: [sepolia.NORMAL_TIMELOCK],
      };
    }),

    // Revoke permissions
    ...REWARD_DISTRIBUTORS.map(rewardDistributor => {
      return {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [rewardDistributor, "setRewardTokenSpeeds(address[],uint256[],uint256[])", sepolia.GUARDIAN],
      };
    }),
    ...REWARD_DISTRIBUTORS.map(() => {
      return {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setLastRewardingBlock(address[],uint32[],uint32[])", sepolia.GUARDIAN],
      };
    }),
  ]);
};

export default vip052;
