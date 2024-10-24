import { NETWORK_ADDRESSES } from "src/networkAddresses";

import { makeProposal } from "../../../../src/utils";

const { opsepolia } = NETWORK_ADDRESSES;

export const OPSEPOLIA_ACM = "0x1652E12C8ABE2f0D84466F0fc1fA4286491B3BC1";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

export const vip007 = () => {
  return makeProposal([
    {
      target: OPSEPOLIA_ACM,
      signature: "grantRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, opsepolia.NORMAL_TIMELOCK],
    },
  ]);
};
export default vip007;
