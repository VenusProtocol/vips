import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { basemainnet } = NETWORK_ADDRESSES;

export const XVS_STORE = "0x11b084Cfa559a82AAC0CcD159dBea27899c7955A";
export const ACM = "0x9E6CeEfDC6183e4D0DF8092A9B90cDF659687daB";

const vip002 = () => {
  return makeProposal([
    {
      target: basemainnet.XVS_VAULT_PROXY,
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
      params: [basemainnet.XVS_VAULT_PROXY, "pause()", basemainnet.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basemainnet.XVS_VAULT_PROXY, "resume()", basemainnet.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basemainnet.XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", basemainnet.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basemainnet.XVS_VAULT_PROXY, "set(address,uint256,uint256)", basemainnet.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basemainnet.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", basemainnet.GUARDIAN], // func name changed from setRewardAmountPerBlock to setRewardAmountPerBlockOrSecond
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        basemainnet.XVS_VAULT_PROXY,
        "setWithdrawalLockingPeriod(address,uint256,uint256)",
        basemainnet.GUARDIAN,
      ],
    },

    {
      target: basemainnet.XVS_VAULT_PROXY,
      signature: "add(address,uint256,address,uint256,uint256)",
      params: [basemainnet.XVS, 100, basemainnet.XVS, "0", 604800],
    },
    {
      target: basemainnet.XVS_VAULT_PROXY,
      signature: "pause()",
      params: [],
    },
  ]);
};

export default vip002;
