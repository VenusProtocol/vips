import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

const XVS_STORE = "0x03B868C7858F50900fecE4eBc851199e957b5d3D";
const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";

const vip004 = () => {
  return makeProposal([
    {
      target: sepolia.XVS_VAULT_PROXY,
      signature: "_acceptAdmin()",
      params: [],
    },

    {
      target: XVS_STORE,
      signature: "acceptAdmin()",
      params: [],
    },

    {
      target: sepolia.XVS_VAULT_PROXY,
      signature: "setAccessControl(address)",
      params: [ACM],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_VAULT_PROXY, "pause()", sepolia.NORMAL_TIMELOCK],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_VAULT_PROXY, "resume()", sepolia.NORMAL_TIMELOCK],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_VAULT_PROXY, "set(address,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_VAULT_PROXY, "setRewardAmountPerBlock(address,uint256)", sepolia.NORMAL_TIMELOCK],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_VAULT_PROXY, "setWithdrawalLockingPeriod(address,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
    },

    {
      target: sepolia.XVS_VAULT_PROXY,
      signature: "setXvsStore(address,address)",
      params: [sepolia.XVS, XVS_STORE],
    },

    {
      target: sepolia.XVS_VAULT_PROXY,
      signature: "add(address,uint256,address,uint256,uint256)",
      params: [sepolia.XVS, 100, sepolia.XVS, "0", 604800],
    },
  ]);
};

export default vip004;
