import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumone } = NETWORK_ADDRESSES;

export const DEFAULT_PROXY_ADMIN = "0xF6fF3e9459227f0cDE8B102b90bE25960317b216";

const vip012 = () => {
  return makeProposal([
    {
      target: DEFAULT_PROXY_ADMIN,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip012;
