import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
const OPBNBMAINNET_NORMAL_TIMELOCK = "0x935a741d81e5F3decC93081f1Db1F37fd6283464";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER = "0xF6606cB41EbeF4D3968Be7752e0820a0cdCeF413";
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
      signature: "grantRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, OPBNBMAINNET_NORMAL_TIMELOCK],
    },
  ]);
};
export default vip019;
