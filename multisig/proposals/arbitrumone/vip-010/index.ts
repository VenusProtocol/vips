import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumone } = NETWORK_ADDRESSES;

export const ARBITRUM_ONE_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";

const vip010 = () => {
  return makeProposal([
    {
      target: arbitrumone.XVS_VAULT_PROXY,
      signature: "_setPendingAdmin(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumone.XVS_VAULT_PROXY,
      signature: "_setPendingAdmin(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },

    // Revoke permissions
    {
      target: ARBITRUM_ONE_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [arbitrumone.XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", arbitrumone.GUARDIAN],
    },
    {
      target: ARBITRUM_ONE_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [arbitrumone.XVS_VAULT_PROXY, "set(address,uint256,uint256)", arbitrumone.GUARDIAN],
    },
    {
      target: ARBITRUM_ONE_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [arbitrumone.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", arbitrumone.GUARDIAN],
    },
    {
      target: ARBITRUM_ONE_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [arbitrumone.XVS_VAULT_PROXY, "setWithdrawalLockingPeriod(address,uint256,uint256)", arbitrumone.GUARDIAN],
    },
  ]);
};

export default vip010;