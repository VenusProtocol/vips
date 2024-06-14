import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

export const ARBITRUM_OMNICHAIN_EXECUTOR_OWNER = "0xf72C1Aa0A1227B4bCcB28E1B1015F0616E2db7fD";
export const ARBITRUM_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const ARBITRUM_NORMAL_TIMELOCK = "0x4b94589Cc23F618687790036726f744D602c4017";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

const { arbitrumone } = NETWORK_ADDRESSES;

export const vip008 = () => {
  return makeProposal([
    {
      target: ARBITRUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", arbitrumone.GUARDIAN],
    },
    {
      target: ARBITRUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", arbitrumone.GUARDIAN],
    },
    {
      target: ARBITRUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "forceResumeReceive(uint16,bytes)", arbitrumone.GUARDIAN],
    },
    {
      target: ARBITRUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setPrecrime(address)", arbitrumone.GUARDIAN],
    },
    {
      target: ARBITRUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setMinDstGas(uint16,uint16,uint256)", arbitrumone.GUARDIAN],
    },
    {
      target: ARBITRUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setPayloadSizeLimit(uint16,uint256)", arbitrumone.GUARDIAN],
    },
    {
      target: ARBITRUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setConfig(uint16,uint16,uint256,bytes)", arbitrumone.GUARDIAN],
    },
    {
      target: ARBITRUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setMaxDailyReceiveLimit(uint256)", arbitrumone.GUARDIAN],
    },

    {
      target: ARBITRUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "pause()", arbitrumone.GUARDIAN],
    },
    {
      target: ARBITRUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "unpause()", arbitrumone.GUARDIAN],
    },
    {
      target: ARBITRUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setTrustedRemoteAddress(uint16,bytes)", arbitrumone.GUARDIAN],
    },
    {
      target: ARBITRUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", arbitrumone.GUARDIAN],
    },
    {
      target: ARBITRUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setTimelockPendingAdmin(address,uint8)", arbitrumone.GUARDIAN],
    },
    {
      target: ARBITRUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "retryMessage(uint16,bytes,uint64,bytes)", arbitrumone.GUARDIAN],
    },
    {
      target: ARBITRUM_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", arbitrumone.GUARDIAN],
    },
    {
      target: ARBITRUM_ACM,
      signature: "grantRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, ARBITRUM_NORMAL_TIMELOCK],
    },
  ]);
};
export default vip008;
