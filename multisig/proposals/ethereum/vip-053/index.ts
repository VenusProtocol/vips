import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";

const vip053 = () => {
  return makeProposal([
    {
      target: ethereum.XVS_VAULT_PROXY,
      signature: "_setPendingAdmin(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },

    // Revoke permissions
    {
      target: ETHEREUM_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [ethereum.XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", ethereum.GUARDIAN],
    },
    {
      target: ETHEREUM_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [ethereum.XVS_VAULT_PROXY, "set(address,uint256,uint256)", ethereum.GUARDIAN],
    },
    {
      target: ETHEREUM_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [ethereum.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", ethereum.GUARDIAN],
    },
    {
      target: ETHEREUM_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [ethereum.XVS_VAULT_PROXY, "setWithdrawalLockingPeriod(address,uint256,uint256)", ethereum.GUARDIAN],
    },
  ]);
};

export default vip053;
