import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

export const ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const { arbitrumsepolia } = NETWORK_ADDRESSES;

const vip013 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "renounceRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, arbitrumsepolia.GUARDIAN],
    },
  ]);
};

export default vip013;
