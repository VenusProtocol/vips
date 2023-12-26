import { NETWORK_ADDRESSES } from "../../../src/networkAddresses";
import { makeProposal } from "../../../src/utils";

const { opbnbtestnet } = NETWORK_ADDRESSES;

export const vip004 = () => {
  return makeProposal([
    {
      target: opbnbtestnet.XVS_VAULT_PROXY,
      signature: "_acceptAdmin()",
      params: [],
    },

    {
      target: opbnbtestnet.XVS_STORE,
      signature: "acceptAdmin()",
      params: [],
    },

    {
      target: opbnbtestnet.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opbnbtestnet.XVS_VAULT_PROXY, "pause()", opbnbtestnet.NORMAL_TIMELOCK],
    },

    {
      target: opbnbtestnet.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opbnbtestnet.XVS_VAULT_PROXY, "resume()", opbnbtestnet.NORMAL_TIMELOCK],
    },

    {
      target: opbnbtestnet.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        opbnbtestnet.XVS_VAULT_PROXY,
        "add(address,uint256,address,uint256,uint256)",
        opbnbtestnet.NORMAL_TIMELOCK,
      ],
    },

    {
      target: opbnbtestnet.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opbnbtestnet.XVS_VAULT_PROXY, "set(address,uint256,uint256)", opbnbtestnet.NORMAL_TIMELOCK],
    },

    {
      target: opbnbtestnet.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opbnbtestnet.XVS_VAULT_PROXY, "setRewardAmountPerBlock(address,uint256)", opbnbtestnet.NORMAL_TIMELOCK],
    },

    {
      target: opbnbtestnet.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        opbnbtestnet.XVS_VAULT_PROXY,
        "setWithdrawalLockingPeriod(address,uint256,uint256)",
        opbnbtestnet.NORMAL_TIMELOCK,
      ],
    },

    {
      target: opbnbtestnet.XVS_VAULT_PROXY,
      signature: "add(address,uint256,address,uint256,uint256)",
      params: [opbnbtestnet.XVS, 100, opbnbtestnet.XVS, "0", 604800],
    },
  ]);
};
