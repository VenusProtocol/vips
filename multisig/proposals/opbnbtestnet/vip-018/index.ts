import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
const OPBNBTESTNET_NORMAL_TIMELOCK = "0xd8aA824CCBeF8A0a3eCdF87c3523D8Fd49Dc93aE";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER = "0x233eFd8aFd8C164A8d5e54f649E948F823f0a425";
const { opbnbtestnet } = NETWORK_ADDRESSES;

export const vip018 = () => {
  return makeProposal([
    {
      target: OPBNBTESTNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", opbnbtestnet.GUARDIAN],
    },
    {
      target: OPBNBTESTNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", opbnbtestnet.GUARDIAN],
    },
    {
      target: OPBNBTESTNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "forceResumeReceive(uint16,bytes)", opbnbtestnet.GUARDIAN],
    },
    {
      target: OPBNBTESTNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "setPrecrime(address)", opbnbtestnet.GUARDIAN],
    },
    {
      target: OPBNBTESTNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "setMinDstGas(uint16,uint16,uint256)", opbnbtestnet.GUARDIAN],
    },
    {
      target: OPBNBTESTNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "setPayloadSizeLimit(uint16,uint256)", opbnbtestnet.GUARDIAN],
    },
    {
      target: OPBNBTESTNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "setConfig(uint16,uint16,uint256,bytes)", opbnbtestnet.GUARDIAN],
    },
    {
      target: OPBNBTESTNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "setMaxDailyReceiveLimit(uint256)", opbnbtestnet.GUARDIAN],
    },

    {
      target: OPBNBTESTNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "pause()", opbnbtestnet.GUARDIAN],
    },
    {
      target: OPBNBTESTNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "unpause()", opbnbtestnet.GUARDIAN],
    },
    {
      target: OPBNBTESTNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "setTrustedRemoteAddress(uint16,bytes)", opbnbtestnet.GUARDIAN],
    },
    {
      target: OPBNBTESTNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", opbnbtestnet.GUARDIAN],
    },
    {
      target: OPBNBTESTNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "setTimelockPendingAdmin(address,uint8)", opbnbtestnet.GUARDIAN],
    },
    {
      target: OPBNBTESTNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "retryMessage(uint16,bytes,uint64,bytes)", opbnbtestnet.GUARDIAN],
    },

    {
      target: OPBNBTESTNET_ACM,
      signature: "grantRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, OPBNBTESTNET_NORMAL_TIMELOCK],
    },
  ]);
};
export default vip018;
