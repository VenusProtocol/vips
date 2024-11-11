import { makeProposal } from "src/utils";

export const ZKSYNCMAINNET_ACM = "0x526159A92A82afE5327d37Ef446b68FD9a5cA914";
export const ZKSYNCMAINNET_NORMAL_TIMELOCK = "0x093565Bc20AA326F4209eBaF3a26089272627613";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

export const vip016 = () => {
  return makeProposal([
    {
      target: ZKSYNCMAINNET_ACM,
      signature: "grantRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, ZKSYNCMAINNET_NORMAL_TIMELOCK],
    },
  ]);
};
export default vip016;
