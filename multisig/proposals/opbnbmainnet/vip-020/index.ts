import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opbnbtestnet } = NETWORK_ADDRESSES;

export const ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
export const IRMs = [
  "0x8000eca36201dddf5805Aa4BeFD73d1EB4D23264",
  "0x60c4Aa92eEb6884a76b309Dd8B3731ad514d6f9B",
  "0x102F0b714E5d321187A4b6E5993358448f7261cE",
  "0x31061a662A87005E5EdbC56EBAd5422eD7952084"
];

const vip019 = () => {
  return makeProposal([
    // Revoke permissions
    ...IRMs.map(irm => {
      return {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [irm, "supdateJumpRateModel(uint256,uint256,uint256,uint256)", opbnbtestnet.GUARDIAN],
      };
    }),
  ]);
};

export default vip019;