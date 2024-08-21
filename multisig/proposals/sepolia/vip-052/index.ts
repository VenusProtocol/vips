import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const XVS_STORE = "0x03B868C7858F50900fecE4eBc851199e957b5d3D";

const vip053 = () => {
  return makeProposal([
    {
      target: sepolia.XVS_VAULT_PROXY,
      signature: "_setPendingAdmin(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: XVS_STORE,
      signature: "setPendingAdmin(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },

    // Revoke permissions
    {
      target: SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [sepolia.XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", sepolia.GUARDIAN],
    },
    {
      target: SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [sepolia.XVS_VAULT_PROXY, "set(address,uint256,uint256)", sepolia.GUARDIAN],
    },
    {
      target: SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [sepolia.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", sepolia.GUARDIAN],
    },
    {
      target: SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [sepolia.XVS_VAULT_PROXY, "setWithdrawalLockingPeriod(address,uint256,uint256)", sepolia.GUARDIAN],
    },
  ]);
};

export default vip053;
