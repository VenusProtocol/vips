import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

export const ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const { arbitrumone } = NETWORK_ADDRESSES;

const vip021 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "renounceRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, arbitrumone.GUARDIAN],
    },
  ]);
};

export default vip021;
