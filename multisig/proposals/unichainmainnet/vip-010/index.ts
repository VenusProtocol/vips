import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { unichainmainnet } = NETWORK_ADDRESSES;
const vip010 = () => {
  return makeProposal([
    {
      target: unichainmainnet.VTREASURY,
      signature: "transferOwnership(address)",
      params: [unichainmainnet.NORMAL_TIMELOCK],
    },
  ]);
};
export default vip010;
