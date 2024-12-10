import { NETWORK_ADDRESSES } from "src/networkAddresses";

import { makeProposal } from "../../../../src/utils";

const { basemainnet } = NETWORK_ADDRESSES;

export const ACM = "0x9E6CeEfDC6183e4D0DF8092A9B90cDF659687daB";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

export const vip006 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "grantRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, basemainnet.NORMAL_TIMELOCK],
    },
  ]);
};
export default vip006;
