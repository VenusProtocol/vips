import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

export const ACM = "0x1f12014c497a9d905155eB9BfDD9FaC6885e61d0";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const { unichainmainnet } = NETWORK_ADDRESSES;

const vip011 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "renounceRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, unichainmainnet.GUARDIAN],
    },
  ]);
};

export default vip011;
