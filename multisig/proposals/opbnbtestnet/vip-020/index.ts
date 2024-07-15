import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opbnbtestnet } = NETWORK_ADDRESSES;

export const XVS_BRIDGE_ADMIN_PROXY = "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff";
export const XVS = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";

const vip020 = () => {
  return makeProposal([
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "transferOwnership(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: XVS,
      signature: "transferOwnership(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip020;
