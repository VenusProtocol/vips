import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { zksyncsepolia } = NETWORK_ADDRESSES;

export const XVS_STORE = "0xf0DaEFE5f5df4170426F88757EcdF45430332d88";
export const ACM = "0xD07f543d47c3a8997D6079958308e981AC14CD01";

const vip003 = () => {
  return makeProposal([
    {
      target: zksyncsepolia.XVS_VAULT_PROXY,
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
      params: [zksyncsepolia.XVS_VAULT_PROXY, "pause()", zksyncsepolia.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [zksyncsepolia.XVS_VAULT_PROXY, "resume()", zksyncsepolia.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [zksyncsepolia.XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", zksyncsepolia.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [zksyncsepolia.XVS_VAULT_PROXY, "set(address,uint256,uint256)", zksyncsepolia.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        zksyncsepolia.XVS_VAULT_PROXY,
        "setRewardAmountPerBlockOrSecond(address,uint256)",
        zksyncsepolia.GUARDIAN,
      ],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        zksyncsepolia.XVS_VAULT_PROXY,
        "setWithdrawalLockingPeriod(address,uint256,uint256)",
        zksyncsepolia.GUARDIAN,
      ],
    },
    {
      target: zksyncsepolia.XVS_VAULT_PROXY,
      signature: "add(address,uint256,address,uint256,uint256)",
      params: [zksyncsepolia.XVS, 100, zksyncsepolia.XVS, "0", 300],
    },
    {
      target: zksyncsepolia.XVS_VAULT_PROXY,
      signature: "pause()",
      params: [],
    },
  ]);
};

export default vip003;
