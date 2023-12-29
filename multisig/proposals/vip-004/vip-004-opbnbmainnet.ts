import { makeProposal } from "../../../src/utils";

const XVS_VAULT_PROXY = "0x7dc969122450749A8B0777c0e324522d67737988";
const XVS_STORE = "0xc3279442a5aCaCF0A2EcB015d1cDDBb3E0f3F775";
const XVS = "0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61";
const ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
const NORMAL_TIMELOCK = "0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207";

export const vip004 = () => {
  return makeProposal([
    {
      target: XVS_VAULT_PROXY,
      signature: "_acceptAdmin()",
      params: [],
    },

    {
      target: XVS_STORE,
      signature: "acceptAdmin()",
      params: [],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_VAULT_PROXY, "pause()", NORMAL_TIMELOCK],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_VAULT_PROXY, "resume()", NORMAL_TIMELOCK],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", NORMAL_TIMELOCK],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_VAULT_PROXY, "set(address,uint256,uint256)", NORMAL_TIMELOCK],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_VAULT_PROXY, "setRewardAmountPerBlock(address,uint256)", NORMAL_TIMELOCK],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_VAULT_PROXY, "setWithdrawalLockingPeriod(address,uint256,uint256)", NORMAL_TIMELOCK],
    },

    {
      target: XVS_VAULT_PROXY,
      signature: "add(address,uint256,address,uint256,uint256)",
      params: [XVS, 100, XVS, "0", 604800],
    },
  ]);
};
