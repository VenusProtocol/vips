import { makeProposal } from "../../../../src/utils";

const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
const SEPOLIA_NORMAL_TIMELOCK = "0x9952fc9A06788B0960Db88434Da43EDacDF1935e";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const vip025 = () => {
  return makeProposal([
    {
      target: SEPOLIA_ACM,
      signature: "grantRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, SEPOLIA_NORMAL_TIMELOCK],
    },
  ]);
};
export default vip025;
