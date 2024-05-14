import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { opbnbmainnet } = NETWORK_ADDRESSES;
const ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
const XVS_VAULT_PROXY = "0x7dc969122450749A8B0777c0e324522d67737988";
const NEW_XVS_IMPLEMENTATION = "0x5E308d3a7170f3aC0340A5D77798F77773a98F21";
const BLOCKS_PER_YEAR = 31_536_000; // 1 block per second

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
      params: [false, BLOCKS_PER_YEAR],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", opbnbmainnet.GUARDIAN],
    },
  ]);
};

export default vip020;
