import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

export const XVS_BRIDGE_ADMIN_PROXY = "0xc94578caCC89a29B044a0a1D54d20d48A645E5C8";
export const XVS = "0x877Dc896e7b13096D3827872e396927BbE704407";

const vip013 = () => {
  return makeProposal([
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: XVS,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip013;
