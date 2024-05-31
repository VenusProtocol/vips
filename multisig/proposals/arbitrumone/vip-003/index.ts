import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { arbitrumone } = NETWORK_ADDRESSES;

export const XVS_STORE = "0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e";
export const ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";

const vip003 = () => {
  return makeProposal([
    {
      target: arbitrumone.XVS_VAULT_PROXY,
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
      params: [arbitrumone.XVS_VAULT_PROXY, "pause()", arbitrumone.NORMAL_TIMELOCK],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumone.XVS_VAULT_PROXY, "resume()", arbitrumone.NORMAL_TIMELOCK],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        arbitrumone.XVS_VAULT_PROXY,
        "add(address,uint256,address,uint256,uint256)",
        arbitrumone.NORMAL_TIMELOCK,
      ],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumone.XVS_VAULT_PROXY, "set(address,uint256,uint256)", arbitrumone.NORMAL_TIMELOCK],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        arbitrumone.XVS_VAULT_PROXY,
        "setRewardAmountPerBlockOrSecond(address,uint256)",
        arbitrumone.NORMAL_TIMELOCK,
      ], // func name changed from setRewardAmountPerBlock to setRewardAmountPerBlockOrSecond
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        arbitrumone.XVS_VAULT_PROXY,
        "setWithdrawalLockingPeriod(address,uint256,uint256)",
        arbitrumone.NORMAL_TIMELOCK,
      ],
    },

    {
      target: arbitrumone.XVS_VAULT_PROXY,
      signature: "add(address,uint256,address,uint256,uint256)",
      params: [arbitrumone.XVS, 100, arbitrumone.XVS, "0", 604800],
    },
    {
      target: arbitrumone.XVS_VAULT_PROXY,
      signature: "pause()",
      params: [],
    },
  ]);
};

export default vip003;
