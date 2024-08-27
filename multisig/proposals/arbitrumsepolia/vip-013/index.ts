import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;
export const BOUND_VALIDATOR = "0xfe6bc1545Cc14C131bacA97476D6035ffcC0b889";
const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";

export const vip013 = () => {
  return makeProposal([
    {
      target: arbitrumsepolia.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.CHAINLINK_ORACLE,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.REDSTONE_ORACLE,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip013;
