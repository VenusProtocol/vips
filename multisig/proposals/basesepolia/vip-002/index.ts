import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { basesepolia } = NETWORK_ADDRESSES;

export const XVS_STORE = "0x059f1eA3973738C649d63bF4dA18221ecA418cDC";
export const ACM = "0x724138223D8F76b519fdE715f60124E7Ce51e051";

const vip002 = () => {
  return makeProposal([
    {
      target: basesepolia.XVS_VAULT_PROXY,
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
      params: [basesepolia.XVS_VAULT_PROXY, "pause()", basesepolia.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.XVS_VAULT_PROXY, "resume()", basesepolia.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", basesepolia.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.XVS_VAULT_PROXY, "set(address,uint256,uint256)", basesepolia.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", basesepolia.GUARDIAN], // func name changed from setRewardAmountPerBlock to setRewardAmountPerBlockOrSecond
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        basesepolia.XVS_VAULT_PROXY,
        "setWithdrawalLockingPeriod(address,uint256,uint256)",
        basesepolia.GUARDIAN,
      ],
    },

    {
      target: basesepolia.XVS_VAULT_PROXY,
      signature: "add(address,uint256,address,uint256,uint256)",
      params: [basesepolia.XVS, 100, basesepolia.XVS, "0", 300],
    },
    {
      target: basesepolia.XVS_VAULT_PROXY,
      signature: "pause()",
      params: [],
    },
  ]);
};

export default vip002;
