import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { VTREASURY, NORMAL_TIMELOCK } = NETWORK_ADDRESSES.ethereum;

export const vip071 = () => {
  return makeProposal([
    {
      target: VTREASURY,
      signature: "transferOwnership(address)",
      params: [NORMAL_TIMELOCK],
    },
  ]);
};

export default vip071;
