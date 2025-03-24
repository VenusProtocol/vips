import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

export const ACM = "0x1652E12C8ABE2f0D84466F0fc1fA4286491B3BC1";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const { opsepolia } = NETWORK_ADDRESSES;

const vip008 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "renounceRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, opsepolia.GUARDIAN],
    },
  ]);
};

export default vip008;
