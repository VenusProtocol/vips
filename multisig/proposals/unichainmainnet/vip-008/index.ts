import { NETWORK_ADDRESSES } from "src/networkAddresses";

import { makeProposal } from "../../../../src/utils";

const { unichainmainnet } = NETWORK_ADDRESSES;

export const ACM = "0x1f12014c497a9d905155eB9BfDD9FaC6885e61d0";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

export const vip008 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "grantRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, unichainmainnet.NORMAL_TIMELOCK],
    },
  ]);
};
export default vip008;
