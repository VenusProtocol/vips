import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opbnbtestnet } = NETWORK_ADDRESSES;

export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";

const vip019 = () => {
  return makeProposal([
    {
      target: opbnbtestnet.XVS_VAULT_PROXY,
      signature: "_setPendingAdmin(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },

    // Revoke permissions
    {
      target: OPBNBTESTNET_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [opbnbtestnet.XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", opbnbtestnet.GUARDIAN],
    },
    {
      target: OPBNBTESTNET_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [opbnbtestnet.XVS_VAULT_PROXY, "set(address,uint256,uint256)", opbnbtestnet.GUARDIAN],
    },
    {
      target: OPBNBTESTNET_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [opbnbtestnet.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", opbnbtestnet.GUARDIAN],
    },
    {
      target: OPBNBTESTNET_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [
        opbnbtestnet.XVS_VAULT_PROXY,
        "setWithdrawalLockingPeriod(address,uint256,uint256)",
        opbnbtestnet.GUARDIAN,
      ],
    },
  ]);
};

export default vip019;
