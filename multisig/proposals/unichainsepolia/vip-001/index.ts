import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { unichainsepolia } = NETWORK_ADDRESSES;

export const XVS_STORE = "0xeE012BeFEa825a21b6346EF0f78249740ca2569b";
export const ACM = "0x854C064EA6b503A97980F481FA3B7279012fdeDd";

const vip003 = () => {
  return makeProposal([
    {
      target: unichainsepolia.XVS_VAULT_PROXY,
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
      params: [unichainsepolia.XVS_VAULT_PROXY, "pause()", unichainsepolia.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [unichainsepolia.XVS_VAULT_PROXY, "resume()", unichainsepolia.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        unichainsepolia.XVS_VAULT_PROXY,
        "add(address,uint256,address,uint256,uint256)",
        unichainsepolia.GUARDIAN,
      ],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [unichainsepolia.XVS_VAULT_PROXY, "set(address,uint256,uint256)", unichainsepolia.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        unichainsepolia.XVS_VAULT_PROXY,
        "setRewardAmountPerBlockOrSecond(address,uint256)",
        unichainsepolia.GUARDIAN,
      ],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        unichainsepolia.XVS_VAULT_PROXY,
        "setWithdrawalLockingPeriod(address,uint256,uint256)",
        unichainsepolia.GUARDIAN,
      ],
    },
    {
      target: unichainsepolia.XVS_VAULT_PROXY,
      signature: "add(address,uint256,address,uint256,uint256)",
      params: [unichainsepolia.XVS, 100, unichainsepolia.XVS, "0", 300],
    },
    {
      target: unichainsepolia.XVS_VAULT_PROXY,
      signature: "pause()",
      params: [],
    },
  ]);
};

export default vip003;
