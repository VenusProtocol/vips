import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;
export const BOUND_VALIDATOR = "0x60c4Aa92eEb6884a76b309Dd8B3731ad514d6f9B";
export const vip042 = () => {
  return makeProposal([
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.CHAINLINK_ORACLE,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.REDSTONE_ORACLE,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip042;
