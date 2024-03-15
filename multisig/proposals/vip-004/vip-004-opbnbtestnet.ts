import { makeProposal } from "../../../src/utils";

const XVS_VAULT_PROXY = "0xB14A0e72C5C202139F78963C9e89252c1ad16f01";
const XVS_STORE = "0x06473fB3f7bF11e2E8EfEcC95aC55ABEFCb2e0A0";
const XVS = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";
const ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
const NORMAL_TIMELOCK = "0xb15f6EfEbC276A3b9805df81b5FB3D50C2A62BDf";

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
      params: [XVS, 100, XVS, "0", 300],
    },
  ]);
};
