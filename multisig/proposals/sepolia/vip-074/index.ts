import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

export const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const { sepolia } = NETWORK_ADDRESSES;

const vip074 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "renounceRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, sepolia.GUARDIAN],
    },
  ]);
};

export default vip074;
