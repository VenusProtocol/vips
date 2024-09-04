import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const DEFAULT_PROXY_ADMIN = "0x567e4cc5e085d09f66f836fa8279f38b4e5866b9";

const vip058 = () => {
  return makeProposal([
    {
      target: DEFAULT_PROXY_ADMIN,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip058;