import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opbnbmainnet } = NETWORK_ADDRESSES;

export const DEFAULT_PROXY_ADMIN = "0xF77bD1D893F67b3EB2Cd256239c98Ba3F238fb52";

const vip021 = () => {
  return makeProposal([
    {
      target: DEFAULT_PROXY_ADMIN,
      signature: "transferOwnership(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip021;
