import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opbnbtestnet } = NETWORK_ADDRESSES;
export const BOUND_VALIDATOR = "0x049537Bb065e6253e9D8D08B45Bf6b753657A746";
export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";

export const vip020 = () => {
  return makeProposal([
    {
      target: opbnbtestnet.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: opbnbtestnet.BINANCE_ORACLE,
      signature: "transferOwnership(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip020;
