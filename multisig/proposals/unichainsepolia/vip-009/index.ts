import { NETWORK_ADDRESSES } from "src/networkAddresses";

import { makeProposal } from "../../../../src/utils";

const { unichainsepolia } = NETWORK_ADDRESSES;

export const ACM = "0x854C064EA6b503A97980F481FA3B7279012fdeDd";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

export const vip009 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "grantRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, unichainsepolia.NORMAL_TIMELOCK],
    },
  ]);
};
export default vip009;
