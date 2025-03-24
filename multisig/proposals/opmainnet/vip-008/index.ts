import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

export const ACM = "0xD71b1F33f6B0259683f11174EE4Ddc2bb9cE4eD6";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const { opmainnet } = NETWORK_ADDRESSES;

const vip008 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "renounceRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, opmainnet.GUARDIAN],
    },
  ]);
};

export default vip008;
