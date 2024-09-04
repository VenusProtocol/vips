import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const DEFAULT_PROXY_ADMIN = "0xe98a3110929c6650c73031756288Ec518f65e846";

const vip058 = () => {
  return makeProposal([
    {
      target: DEFAULT_PROXY_ADMIN,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip058;
