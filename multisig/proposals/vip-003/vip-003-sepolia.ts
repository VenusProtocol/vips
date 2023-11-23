import { NETWORK_ADDRESSES } from "../../../src/networkAddresses";
import { makeProposal } from "../../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const vip003 = () => {
  return makeProposal([
    {
      target: sepolia.XVS_VAULT_PROXY,
      signature: "_acceptAdmin()",
      params: [],
    },

    {
      target: sepolia.XVS_STORE,
      signature: "acceptAdmin()",
      params: [],
    },

    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_VAULT_PROXY, "pause()", sepolia.NORMAL_TIMELOCK],
    },

    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_VAULT_PROXY, "resume()", sepolia.NORMAL_TIMELOCK],
    },

    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
    },

    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_VAULT_PROXY, "set(address,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
    },

    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_VAULT_PROXY, "setRewardAmountPerBlock(address,uint256)", sepolia.NORMAL_TIMELOCK],
    },

    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_VAULT_PROXY, "setWithdrawalLockingPeriod(address,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
    },

    {
      target: sepolia.XVS_VAULT_PROXY,
      signature: "add(address,uint256,address,uint256,uint256)",
      params: [sepolia.XVS, 100, sepolia.XVS, "61805555555555555", 604800],
    },
  ]);
};
