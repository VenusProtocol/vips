import { NETWORK_ADDRESSES } from "../../../src/networkAddresses";
import { makeProposal } from "../../../src/utils";

export const vip005 = () => {
  return makeProposal([
    {
      target: NETWORK_ADDRESSES.opbnbtestnet.VTREASURY,
      signature: "acceptOwnership()",
      params: [],
    },
  ]);
};
