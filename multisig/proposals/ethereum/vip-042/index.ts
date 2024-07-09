import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;
export const BOUND_VALIDATOR = "0x1Cd5f336A1d28Dff445619CC63d3A0329B4d8a58";
export const vip042 = () => {
  return makeProposal([
    {
      target: ethereum.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: ethereum.CHAINLINK_ORACLE,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: ethereum.REDSTONE_ORACLE,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip042;
