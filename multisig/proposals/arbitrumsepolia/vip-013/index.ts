import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

export const ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const PRIME = "0xadb04ac4942683bc41e27d18234c8dc884786e89";
export const PLP = "0xe82c2c10f55d3268126c29ec813dc6f086904694";

const vip013 = () => {
  return makeProposal([
    {
      target: PRIME,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: PLP,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip013;
