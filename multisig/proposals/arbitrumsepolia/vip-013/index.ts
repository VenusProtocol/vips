import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

export const ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const IRMs = ["0xBbb522fCA8f5955942515D8EAa2222251a070a17", "0x50e8FF8748684F5DbDAEc5554c7FE3E82Cdc19e1"];

const vip013 = () => {
  return makeProposal([
    // Revoke permissions
    ...IRMs.map(irm => {
      return {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [irm, "updateJumpRateModel(uint256,uint256,uint256,uint256)", arbitrumsepolia.GUARDIAN],
      };
    }),
  ]);
};

export default vip013;
