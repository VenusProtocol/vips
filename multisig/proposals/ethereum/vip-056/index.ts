import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

export const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const { ethereum } = NETWORK_ADDRESSES;

const vip056 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "renounceRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, ethereum.GUARDIAN],
    },
  ]);
};

export default vip056;
