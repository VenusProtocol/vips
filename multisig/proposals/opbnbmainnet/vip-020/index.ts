import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opbnbmainnet } = NETWORK_ADDRESSES;
export const BOUND_VALIDATOR = "0xd1f80C371C6E2Fa395A5574DB3E3b4dAf43dadCE";
export const vip020 = () => {
  return makeProposal([
    {
      target: opbnbmainnet.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: opbnbmainnet.BINANCE_ORACLE,
      signature: "transferOwnership(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip020;
