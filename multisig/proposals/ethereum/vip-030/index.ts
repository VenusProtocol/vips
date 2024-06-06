import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
const ETHEREUM_NORMAL_TIMELOCK = "0x58427ae12C559a5376918b11ce0C88564452ecE6";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const ETHEREUM_OMNICHAIN_EXECUTOR_OWNER = "0xE837D75Acc0eB41D97fCe2f2613d41d6D6590855";
const { ethereum } = NETWORK_ADDRESSES;

export const vip030 = () => {
  return makeProposal([
    {
      target: ETHEREUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", ethereum.GUARDIAN],
    },
    {
      target: ETHEREUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", ethereum.GUARDIAN],
    },
    {
      target: ETHEREUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "forceResumeReceive(uint16,bytes)", ethereum.GUARDIAN],
    },
    {
      target: ETHEREUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setPrecrime(address)", ethereum.GUARDIAN],
    },
    {
      target: ETHEREUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setMinDstGas(uint16,uint16,uint256)", ethereum.GUARDIAN],
    },
    {
      target: ETHEREUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setPayloadSizeLimit(uint16,uint256)", ethereum.GUARDIAN],
    },
    {
      target: ETHEREUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setConfig(uint16,uint16,uint256,bytes)", ethereum.GUARDIAN],
    },
    {
      target: ETHEREUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setMaxDailyReceiveLimit(uint256)", ethereum.GUARDIAN],
    },

    {
      target: ETHEREUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "pause()", ethereum.GUARDIAN],
    },
    {
      target: ETHEREUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "unpause()", ethereum.GUARDIAN],
    },
    {
      target: ETHEREUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setTrustedRemoteAddress(uint16,bytes)", ethereum.GUARDIAN],
    },
    {
      target: ETHEREUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", ethereum.GUARDIAN],
    },
    {
      target: ETHEREUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setTimelockPendingAdmin(address,uint8)", ethereum.GUARDIAN],
    },
    {
      target: ETHEREUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "retryMessage(uint16,bytes,uint64,bytes)", ethereum.GUARDIAN],
    },
    {
      target: ETHEREUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", ethereum.GUARDIAN],
    },
    {
      target: ETHEREUM_ACM,
      signature: "grantRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, ETHEREUM_NORMAL_TIMELOCK],
    },
  ]);
};
export default vip030;
