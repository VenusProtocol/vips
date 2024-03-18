import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "../../../src/networkAddresses";
import { makeProposal } from "../../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const vipCallPermission = () => {
  return makeProposal([
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLastRewardingBlocks(address[],uint32[],uint32[])", sepolia.NORMAL_TIMELOCK],
    },
  ]);
};
