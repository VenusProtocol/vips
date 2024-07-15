import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const XVS_BRIDGE_ADMIN_PROXY = "0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96";
export const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";

const vip042 = () => {
  return makeProposal([
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: XVS,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip042;
