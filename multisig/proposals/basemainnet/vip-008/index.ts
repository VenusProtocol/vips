import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

export const ACM = "0x9E6CeEfDC6183e4D0DF8092A9B90cDF659687daB";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const { basemainnet } = NETWORK_ADDRESSES;

const vip008 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "renounceRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, basemainnet.GUARDIAN],
    },
  ]);
};

export default vip008;
