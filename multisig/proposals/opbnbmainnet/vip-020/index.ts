import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { opbnbmainnet } = NETWORK_ADDRESSES;
const ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
const XVS_VAULT_PROXY = "0x7dc969122450749A8B0777c0e324522d67737988";
const NEW_XVS_IMPLEMENTATION = "0x5C0594564e6067AdF13a9A89e5f759Cb73C2E645";

const vip020 = () => {
  return makeProposal([
    {
      target: XVS_VAULT_PROXY,
      signature: "_setPendingImplementation(address)",
      params: [NEW_XVS_IMPLEMENTATION],
    },
    {
      target: NEW_XVS_IMPLEMENTATION,
      signature: "_become(address)",
      params: [XVS_VAULT_PROXY],
    },
    {
      target: XVS_VAULT_PROXY,
      signature: "initializeTimeManager(bool,uint256)",
      params: [true, 0],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", opbnbmainnet.GUARDIAN],
    },
  ]);
};

export default vip020;
