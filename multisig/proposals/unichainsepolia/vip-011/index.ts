import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

export const ACM = "0x854C064EA6b503A97980F481FA3B7279012fdeDd";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const { unichainsepolia } = NETWORK_ADDRESSES;

const vip011 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "renounceRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, unichainsepolia.GUARDIAN],
    },
  ]);
};

export default vip011;
