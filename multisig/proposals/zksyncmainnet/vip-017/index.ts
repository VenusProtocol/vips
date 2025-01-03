import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

export const VTREASURY = "0xB2e9174e23382f7744CebF7e0Be54cA001D95599";
const zksyncmainnet = NETWORK_ADDRESSES.zksyncmainnet;

const vip017 = () => {
  return makeProposal([
    {
      target: VTREASURY,
      signature: "transferOwnership(address)",
      params: [zksyncmainnet.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip017;
