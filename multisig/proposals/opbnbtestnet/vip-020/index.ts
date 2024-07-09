import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opbnbtestnet } = NETWORK_ADDRESSES;
export const vip020 = () => {
  return makeProposal([
    {
      target: opbnbtestnet.VTREASURY,
      signature: "transferOwnership(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip020;
