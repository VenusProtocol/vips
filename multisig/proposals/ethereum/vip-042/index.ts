import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;
export const vip042 = () => {
  return makeProposal([
    {
      target: ethereum.VTREASURY,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip042;
