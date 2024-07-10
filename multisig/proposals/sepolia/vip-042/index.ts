import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const XVS_BRIDGE_ADMIN_PROXY = "0xd3c6bdeeadB2359F726aD4cF42EAa8B7102DAd9B";
export const XVS = "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E";

const vip042 = () => {
  return makeProposal([
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: XVS,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip042;
