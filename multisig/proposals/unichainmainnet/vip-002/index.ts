import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { unichainmainnet } = NETWORK_ADDRESSES;

export const XVS_STORE = "0x0ee4b35c2cEAb19856Bf35505F81608d12B2a7Bb";
export const ACM = "0x1f12014c497a9d905155eB9BfDD9FaC6885e61d0";

const vip002 = () => {
  return makeProposal([
    {
      target: unichainmainnet.XVS_VAULT_PROXY,
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
      params: [unichainmainnet.XVS_VAULT_PROXY, "pause()", unichainmainnet.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [unichainmainnet.XVS_VAULT_PROXY, "resume()", unichainmainnet.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        unichainmainnet.XVS_VAULT_PROXY,
        "add(address,uint256,address,uint256,uint256)",
        unichainmainnet.GUARDIAN,
      ],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [unichainmainnet.XVS_VAULT_PROXY, "set(address,uint256,uint256)", unichainmainnet.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        unichainmainnet.XVS_VAULT_PROXY,
        "setRewardAmountPerBlockOrSecond(address,uint256)",
        unichainmainnet.GUARDIAN,
      ],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        unichainmainnet.XVS_VAULT_PROXY,
        "setWithdrawalLockingPeriod(address,uint256,uint256)",
        unichainmainnet.GUARDIAN,
      ],
    },
    {
      target: unichainmainnet.XVS_VAULT_PROXY,
      signature: "add(address,uint256,address,uint256,uint256)",
      params: [unichainmainnet.XVS, 100, unichainmainnet.XVS, "0", 604800],
    },
    {
      target: unichainmainnet.XVS_VAULT_PROXY,
      signature: "pause()",
      params: [],
    },
  ]);
};

export default vip002;
