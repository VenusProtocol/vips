import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

export const ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const { opbnbmainnet } = NETWORK_ADDRESSES;

const vip025 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "renounceRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, opbnbmainnet.GUARDIAN],
    },
  ]);
};

export default vip025;
