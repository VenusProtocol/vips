import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

export const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const XVS_STORE = "0x4e909DA6693215dC630104715c035B159dDb67Dd";

const vip010 = () => {
  return makeProposal([
    {
      target: arbitrumsepolia.XVS_VAULT_PROXY,
      signature: "_setPendingAdmin(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: XVS_STORE,
      signature: "setPendingAdmin(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },

    // Revoke permissions
    {
      target: ARBITRUM_SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [
        arbitrumsepolia.XVS_VAULT_PROXY,
        "add(address,uint256,address,uint256,uint256)",
        arbitrumsepolia.GUARDIAN,
      ],
    },
    {
      target: ARBITRUM_SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [arbitrumsepolia.XVS_VAULT_PROXY, "set(address,uint256,uint256)", arbitrumsepolia.GUARDIAN],
    },
    {
      target: ARBITRUM_SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [
        arbitrumsepolia.XVS_VAULT_PROXY,
        "setRewardAmountPerBlockOrSecond(address,uint256)",
        arbitrumsepolia.GUARDIAN,
      ],
    },
    {
      target: ARBITRUM_SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [
        arbitrumsepolia.XVS_VAULT_PROXY,
        "setWithdrawalLockingPeriod(address,uint256,uint256)",
        arbitrumsepolia.GUARDIAN,
      ],
    },
  ]);
};

export default vip010;
