import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { zksyncmainnet } = NETWORK_ADDRESSES;

export const XVS_STORE = "0x29FB1fEe4F469641b63978d0975cDa148Cf938Ee";
export const ACM = "0x526159A92A82afE5327d37Ef446b68FD9a5cA914";

const vip003 = () => {
  return makeProposal([
    {
      target: zksyncmainnet.XVS_VAULT_PROXY,
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
      params: [zksyncmainnet.XVS_VAULT_PROXY, "pause()", zksyncmainnet.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [zksyncmainnet.XVS_VAULT_PROXY, "resume()", zksyncmainnet.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [zksyncmainnet.XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", zksyncmainnet.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [zksyncmainnet.XVS_VAULT_PROXY, "set(address,uint256,uint256)", zksyncmainnet.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        zksyncmainnet.XVS_VAULT_PROXY,
        "setRewardAmountPerBlockOrSecond(address,uint256)",
        zksyncmainnet.GUARDIAN,
      ],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        zksyncmainnet.XVS_VAULT_PROXY,
        "setWithdrawalLockingPeriod(address,uint256,uint256)",
        zksyncmainnet.GUARDIAN,
      ],
    },
    {
      target: zksyncmainnet.XVS_VAULT_PROXY,
      signature: "add(address,uint256,address,uint256,uint256)",
      params: [zksyncmainnet.XVS, 100, zksyncmainnet.XVS, "0", 604800],
    },
    {
      target: zksyncmainnet.XVS_VAULT_PROXY,
      signature: "pause()",
      params: [],
    },
  ]);
};

export default vip003;
