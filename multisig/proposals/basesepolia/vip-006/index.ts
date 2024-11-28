import { NETWORK_ADDRESSES } from "src/networkAddresses";

import { makeProposal } from "../../../../src/utils";

const { basesepolia } = NETWORK_ADDRESSES;

export const ACM = "0x724138223D8F76b519fdE715f60124E7Ce51e051";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

export const vip007 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "grantRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, basesepolia.NORMAL_TIMELOCK],
    },
  ]);
};
export default vip007;
