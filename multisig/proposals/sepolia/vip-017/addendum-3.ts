import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;

const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";

const vip017 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLastRewardingBlocks(address[],uint32[],uint32[])", sepolia.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip017;
