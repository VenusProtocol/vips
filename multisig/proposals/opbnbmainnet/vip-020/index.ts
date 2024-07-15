import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opbnbmainnet } = NETWORK_ADDRESSES;
export const BOUND_VALIDATOR = "0xd1f80C371C6E2Fa395A5574DB3E3b4dAf43dadCE";
export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";

export const vip020 = () => {
  return makeProposal([
    {
      target: opbnbmainnet.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: opbnbmainnet.BINANCE_ORACLE,
      signature: "transferOwnership(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
    // Revoke unnecessary permissions from Guardian
    {
      target: OPBNBMAINNET_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [opbnbmainnet.RESILIENT_ORACLE, "setOracle(address,address,uint8)", opbnbmainnet.GUARDIAN],
    },
    {
      target: OPBNBMAINNET_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [opbnbmainnet.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", opbnbmainnet.GUARDIAN],
    },
    {
      target: OPBNBMAINNET_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", opbnbmainnet.GUARDIAN],
    },
  ]);
};

export default vip020;
