import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

export const ACM = "0xD07f543d47c3a8997D6079958308e981AC14CD01";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const { zksyncsepolia } = NETWORK_ADDRESSES;

const vip021 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "renounceRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, zksyncsepolia.GUARDIAN],
    },
  ]);
};

export default vip021;
