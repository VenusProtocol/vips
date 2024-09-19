import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opmainnet } = NETWORK_ADDRESSES;

export const XVS_STORE = "0xFE548630954129923f63113923eF5373E10589d3";
export const ACM = "0xD71b1F33f6B0259683f11174EE4Ddc2bb9cE4eD6";

const vip002 = () => {
  return makeProposal([
    {
      target: opmainnet.XVS_VAULT_PROXY,
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
      params: [opmainnet.XVS_VAULT_PROXY, "pause()", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opmainnet.XVS_VAULT_PROXY, "resume()", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opmainnet.XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opmainnet.XVS_VAULT_PROXY, "set(address,uint256,uint256)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opmainnet.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", opmainnet.GUARDIAN], // func name changed from setRewardAmountPerBlock to setRewardAmountPerBlockOrSecond
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opmainnet.XVS_VAULT_PROXY, "setWithdrawalLockingPeriod(address,uint256,uint256)", opmainnet.GUARDIAN],
    },
    {
      target: opmainnet.XVS_VAULT_PROXY,
      signature: "add(address,uint256,address,uint256,uint256)",
      params: [opmainnet.XVS, 100, opmainnet.XVS, "0", 604800],
    },
    {
      target: opmainnet.XVS_VAULT_PROXY,
      signature: "pause()",
      params: [],
    },
  ]);
};

export default vip002;
