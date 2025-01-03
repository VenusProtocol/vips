import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

export const VTREASURY = "0x8a662ceAC418daeF956Bc0e6B2dd417c80CDA631";
const arbitrumone = NETWORK_ADDRESSES.arbitrumone;

const vip019 = () => {
  return makeProposal([
    {
      target: VTREASURY,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip019;
