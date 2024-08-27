import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opbnbmainnet } = NETWORK_ADDRESSES;

export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const XVS_STORE = "0xc3279442a5aCaCF0A2EcB015d1cDDBb3E0f3F775";

const vip020 = () => {
  return makeProposal([
    {
      target: opbnbmainnet.XVS_VAULT_PROXY,
      signature: "_setPendingAdmin(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: XVS_STORE,
      signature: "setPendingAdmin(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip020;
