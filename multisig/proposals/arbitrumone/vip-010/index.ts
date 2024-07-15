import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumone } = NETWORK_ADDRESSES;

export const XVS_BRIDGE_ADMIN_PROXY = "0xf5d81C6F7DAA3F97A6265C8441f92eFda22Ad784";
export const XVS = "0xc1Eb7689147C81aC840d4FF0D298489fc7986d52";

const vip010 = () => {
  return makeProposal([
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: XVS,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip010;
