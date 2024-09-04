import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opbnbtestnet } = NETWORK_ADDRESSES;

export const DEFAULT_PROXY_ADMIN = "0xB1281ADC816fba7df64B798D7A0BC4bd2a6d42f4";

const vip021 = () => {
  return makeProposal([
    {
      target: DEFAULT_PROXY_ADMIN,
      signature: "transferOwnership(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip021;