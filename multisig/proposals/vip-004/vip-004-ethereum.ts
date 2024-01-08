import { makeProposal } from "../../../src/utils";

const XVS_VAULT_PROXY = "0xA0882C2D5DF29233A092d2887A258C2b90e9b994";
const XVS_STORE = "0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B";
const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
const NORMAL_TIMELOCK = "0x285960C5B22fD66A736C7136967A3eB15e93CC67";

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

    {
      target: XVS_VAULT_PROXY,
      signature: "pause()",
      params: [],
    },
  ]);
};
