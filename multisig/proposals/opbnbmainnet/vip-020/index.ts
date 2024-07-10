import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opbnbmainnet } = NETWORK_ADDRESSES;

export const XVS_BRIDGE_ADMIN_PROXY = "0x52fcE05aDbf6103d71ed2BA8Be7A317282731831";
export const XVS = "0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61";

const vip020 = () => {
  return makeProposal([
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "transferOwnership(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: XVS,
      signature: "transferOwnership(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip020;
