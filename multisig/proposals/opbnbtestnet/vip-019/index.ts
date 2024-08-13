import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opbnbmainnet } = NETWORK_ADDRESSES;

export const ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const IRMs = [
  "0x0E43acCbe2f38A0e98C6979bE5b803f813ce8be5",
  "0x0b7cdC617bFE8e63D7861AbC1139811b61DbC869",
  "0x48C8a6A591f8f0943bF5FeEFB5E1Cbc803Eda89e",
  "0xaf6862b20280818FA24fA6D17097517608Fe65d4"
];

const vip020 = () => {
  return makeProposal([
    // Revoke permissions
    ...IRMs.map(irm => {
      return {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [irm, "supdateJumpRateModel(uint256,uint256,uint256,uint256)", opbnbmainnet.GUARDIAN],
      };
    }),
  ]);
};

export default vip020;