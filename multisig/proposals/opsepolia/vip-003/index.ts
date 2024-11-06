import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opsepolia } = NETWORK_ADDRESSES;

export const XVS_STORE = "0xE888FA54b32BfaD3cE0e3C7D566EFe809a6A0143";
export const ACM = "0x1652E12C8ABE2f0D84466F0fc1fA4286491B3BC1";

const vip003 = () => {
  return makeProposal([
    {
      target: opsepolia.XVS_VAULT_PROXY,
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
      params: [opsepolia.XVS_VAULT_PROXY, "pause()", opsepolia.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opsepolia.XVS_VAULT_PROXY, "resume()", opsepolia.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opsepolia.XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", opsepolia.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opsepolia.XVS_VAULT_PROXY, "set(address,uint256,uint256)", opsepolia.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opsepolia.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", opsepolia.GUARDIAN], // func name changed from setRewardAmountPerBlock to setRewardAmountPerBlockOrSecond
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opsepolia.XVS_VAULT_PROXY, "setWithdrawalLockingPeriod(address,uint256,uint256)", opsepolia.GUARDIAN],
    },

    {
      target: opsepolia.XVS_VAULT_PROXY,
      signature: "add(address,uint256,address,uint256,uint256)",
      params: [opsepolia.XVS, 100, opsepolia.XVS, "0", 604800],
    },
    {
      target: opsepolia.XVS_VAULT_PROXY,
      signature: "pause()",
      params: [],
    },
  ]);
};

export default vip003;
