import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

const XVS_STORE = "0x3c49eB8FaDD3FdB0a4Bbb40F8A7e3ce821298607";
export const ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";

const vip004 = () => {
  return makeProposal([
    {
      target: arbitrumsepolia.XVS_VAULT_PROXY,
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
      params: [arbitrumsepolia.XVS_VAULT_PROXY, "pause()", arbitrumsepolia.NORMAL_TIMELOCK],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumsepolia.XVS_VAULT_PROXY, "resume()", arbitrumsepolia.NORMAL_TIMELOCK],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        arbitrumsepolia.XVS_VAULT_PROXY,
        "add(address,uint256,address,uint256,uint256)",
        arbitrumsepolia.NORMAL_TIMELOCK,
      ],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumsepolia.XVS_VAULT_PROXY, "set(address,uint256,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        arbitrumsepolia.XVS_VAULT_PROXY,
        "setRewardAmountPerBlockOrSecond(address,uint256)",
        arbitrumsepolia.NORMAL_TIMELOCK,
      ], // func name changed from setRewardAmountPerBlock to setRewardAmountPerBlockOrSecond
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        arbitrumsepolia.XVS_VAULT_PROXY,
        "setWithdrawalLockingPeriod(address,uint256,uint256)",
        arbitrumsepolia.NORMAL_TIMELOCK,
      ],
    },

    {
      target: arbitrumsepolia.XVS_VAULT_PROXY,
      signature: "add(address,uint256,address,uint256,uint256)",
      params: [arbitrumsepolia.XVS, 100, arbitrumsepolia.XVS, "0", 604800],
    },
  ]);
};

export default vip004;
