import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

export const ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const { opbnbtestnet } = NETWORK_ADDRESSES;

const vip025 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "renounceRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, opbnbtestnet.GUARDIAN],
    },
  ]);
};

export default vip025;
