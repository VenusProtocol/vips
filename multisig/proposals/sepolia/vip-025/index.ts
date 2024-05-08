import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal, networkChainIds } from "../../../../src/utils";

const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
const SEPOLIA_NORMAL_TIMELOCK = "0x9952fc9A06788B0960Db88434Da43EDacDF1935e";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const SEPOLIA_OMNICHAIN_EXECUTOR_OWNER = "0x0E33024CD69530126586186C282573D8BD6783ea";
const SEPOLIA_CHAIN_ID = networkChainIds["sepolia"];
const { sepolia } = NETWORK_ADDRESSES;

export const vip025 = () => {
  return makeProposal([
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", sepolia.GUARDIAN],
      dstChainId: SEPOLIA_CHAIN_ID,
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", sepolia.GUARDIAN],
      dstChainId: SEPOLIA_CHAIN_ID,
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "forceResumeReceive(uint16,bytes)", sepolia.GUARDIAN],
      dstChainId: SEPOLIA_CHAIN_ID,
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setPrecrime(address)", sepolia.GUARDIAN],
      dstChainId: SEPOLIA_CHAIN_ID,
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setMinDstGas(uint16,uint16,uint256)", sepolia.GUARDIAN],
      dstChainId: SEPOLIA_CHAIN_ID,
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setPayloadSizeLimit(uint16,uint256)", sepolia.GUARDIAN],
      dstChainId: SEPOLIA_CHAIN_ID,
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setConfig(uint16,uint16,uint256,bytes)", sepolia.GUARDIAN],
      dstChainId: SEPOLIA_CHAIN_ID,
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setMaxDailyReceiveLimit(uint256)", sepolia.GUARDIAN],
      dstChainId: SEPOLIA_CHAIN_ID,
    },

    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "pause()", sepolia.GUARDIAN],
      dstChainId: SEPOLIA_CHAIN_ID,
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "unpause()", sepolia.GUARDIAN],
      dstChainId: SEPOLIA_CHAIN_ID,
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setTrustedRemoteAddress(uint16,bytes)", sepolia.GUARDIAN],
      dstChainId: SEPOLIA_CHAIN_ID,
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", sepolia.GUARDIAN],
      dstChainId: SEPOLIA_CHAIN_ID,
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setTimelockPendingAdmin(address,uint8)", sepolia.GUARDIAN],
      dstChainId: SEPOLIA_CHAIN_ID,
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "retryMessage(uint16,bytes,uint64,bytes)", sepolia.GUARDIAN],
      dstChainId: SEPOLIA_CHAIN_ID,
    },

    {
      target: SEPOLIA_ACM,
      signature: "grantRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, SEPOLIA_NORMAL_TIMELOCK],
    },
  ]);
};
export default vip025;
