import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { opbnbtestnet } = NETWORK_ADDRESSES;
const ACM = "0x049f77f7046266d27c3bc96376f53c17ef09c986";

const vip017 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLastRewardingBlocks(address[],uint32[],uint32[])", opbnbtestnet.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip017;
