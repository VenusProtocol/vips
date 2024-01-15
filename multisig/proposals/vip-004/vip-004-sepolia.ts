import { NETWORK_ADDRESSES } from "../../../src/networkAddresses";
import { makeProposal } from "../../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;

const XVS_VAULT_PROXY = "0x1129f882eAa912aE6D4f6D445b2E2b1eCbA99fd5";
const XVS_STORE = "0x03B868C7858F50900fecE4eBc851199e957b5d3D";

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
      target: XVS_VAULT_PROXY,
      signature: "setAccessControl(address)",
      params: [sepolia.ACM],
    },

    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_VAULT_PROXY, "pause()", sepolia.NORMAL_TIMELOCK],
    },

    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_VAULT_PROXY, "resume()", sepolia.NORMAL_TIMELOCK],
    },

    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
    },

    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_VAULT_PROXY, "set(address,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
    },

    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_VAULT_PROXY, "setRewardAmountPerBlock(address,uint256)", sepolia.NORMAL_TIMELOCK],
    },

    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_VAULT_PROXY, "setWithdrawalLockingPeriod(address,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
    },

    {
      target: XVS_VAULT_PROXY,
      signature: "setXvsStore(address,address)",
      params: [sepolia.XVS, XVS_STORE],
    },

    {
      target: XVS_VAULT_PROXY,
      signature: "add(address,uint256,address,uint256,uint256)",
      params: [sepolia.XVS, 100, sepolia.XVS, "0", 604800],
    },
  ]);
};
