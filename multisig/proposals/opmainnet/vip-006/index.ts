import { makeProposal } from "src/utils";

export const OPMAINNET_ACM = "0xD71b1F33f6B0259683f11174EE4Ddc2bb9cE4eD6";
export const OPMAINNET_NORMAL_TIMELOCK = "0x0C6f1E6B4fDa846f63A0d5a8a73EB811E0e0C04b";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

export const vip006 = () => {
  return makeProposal([
    {
      target: OPMAINNET_ACM,
      signature: "grantRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, OPMAINNET_NORMAL_TIMELOCK],
    },
  ]);
};
export default vip006;
