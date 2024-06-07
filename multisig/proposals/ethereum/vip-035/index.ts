import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const ETHEREUM_NORMAL_TIMELOCK = "0xd969E79406c35E80750aAae061D402Aab9325714";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ETHEREUM_OMNICHAIN_EXECUTOR_OWNER = "0x87Ed3Fd3a25d157637b955991fb1B41B566916Ba";
const { ethereum } = NETWORK_ADDRESSES;

export const vip035 = () => {
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
export default vip035;
