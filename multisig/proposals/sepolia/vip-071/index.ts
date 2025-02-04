import { NETWORK_ADDRESSES } from "src/networkAddresses";

import { makeProposal } from "../../../../src/utils";

export const vUSDS = "0x459C6a6036e2094d1764a9ca32939b9820b2C8e0";
export const vsUSDS = "0x083a24648614df4b72EFD4e4C81141C044dBB253";

export const vip071 = () => {
  return makeProposal([
    {
      target: vUSDS,
      signature: "transferOwnership(address)",
      params: [NETWORK_ADDRESSES.sepolia.NORMAL_TIMELOCK],
    },
    {
      target: vsUSDS,
      signature: "transferOwnership(address)",
      params: [NETWORK_ADDRESSES.sepolia.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip071;
