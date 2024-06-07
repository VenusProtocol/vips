import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const OPBNBMAINNET_NORMAL_TIMELOCK = "0x372044f837eBBec77e64a449173732f8955c75bA";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER = "0xf19b44Bf78A5330354312Cbc236EA8984828b4E2";
const { opbnbmainnet } = NETWORK_ADDRESSES;

export const vip019 = () => {
  return makeProposal([
    {
      target: OPBNBMAINNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", opbnbmainnet.GUARDIAN],
    },
    {
      target: OPBNBMAINNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", opbnbmainnet.GUARDIAN],
    },
    {
      target: OPBNBMAINNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "forceResumeReceive(uint16,bytes)", opbnbmainnet.GUARDIAN],
    },
    {
      target: OPBNBMAINNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setPrecrime(address)", opbnbmainnet.GUARDIAN],
    },
    {
      target: OPBNBMAINNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setMinDstGas(uint16,uint16,uint256)", opbnbmainnet.GUARDIAN],
    },
    {
      target: OPBNBMAINNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setPayloadSizeLimit(uint16,uint256)", opbnbmainnet.GUARDIAN],
    },
    {
      target: OPBNBMAINNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setConfig(uint16,uint16,uint256,bytes)", opbnbmainnet.GUARDIAN],
    },
    {
      target: OPBNBMAINNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setMaxDailyReceiveLimit(uint256)", opbnbmainnet.GUARDIAN],
    },

    {
      target: OPBNBMAINNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "pause()", opbnbmainnet.GUARDIAN],
    },
    {
      target: OPBNBMAINNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "unpause()", opbnbmainnet.GUARDIAN],
    },
    {
      target: OPBNBMAINNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setTrustedRemoteAddress(uint16,bytes)", opbnbmainnet.GUARDIAN],
    },
    {
      target: OPBNBMAINNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", opbnbmainnet.GUARDIAN],
    },
    {
      target: OPBNBMAINNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setTimelockPendingAdmin(address,uint8)", opbnbmainnet.GUARDIAN],
    },
    {
      target: OPBNBMAINNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "retryMessage(uint16,bytes,uint64,bytes)", opbnbmainnet.GUARDIAN],
    },
    {
      target: OPBNBMAINNET_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", opbnbmainnet.GUARDIAN],
    },
    {
      target: OPBNBMAINNET_ACM,
      signature: "grantRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, OPBNBMAINNET_NORMAL_TIMELOCK],
    },
  ]);
};
export default vip019;
