import { makeProposal } from "src/utils";

export const ZKSYNCSEPOLIA_ACM = "0xD07f543d47c3a8997D6079958308e981AC14CD01";
export const ZKSYNCSEPOLIA_NORMAL_TIMELOCK = "0x1730527a0f0930269313D77A317361b42971a67E";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

export const vip010 = () => {
  return makeProposal([
    {
      target: ZKSYNCSEPOLIA_ACM,
      signature: "grantRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, ZKSYNCSEPOLIA_NORMAL_TIMELOCK],
    },
  ]);
};
export default vip010;
