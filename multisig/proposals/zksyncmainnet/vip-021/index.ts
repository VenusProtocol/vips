import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

export const ACM = "0x526159A92A82afE5327d37Ef446b68FD9a5cA914";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const { zksyncmainnet } = NETWORK_ADDRESSES;

const vip021 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "renounceRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, zksyncmainnet.GUARDIAN],
    },
  ]);
};

export default vip021;
