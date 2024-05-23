import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
const SEPOLIA_NORMAL_TIMELOCK = "0xeF9B3f8330352C7d09B7CD29A5A72f0410e901D1";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const SEPOLIA_OMNICHAIN_EXECUTOR_OWNER = "0xe85116507D5F3f3B42e7b6a01a98d33FD3943ceC";
const { sepolia } = NETWORK_ADDRESSES;

export const vip030 = () => {
  return makeProposal([
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", sepolia.GUARDIAN],
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", sepolia.GUARDIAN],
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "forceResumeReceive(uint16,bytes)", sepolia.GUARDIAN],
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setPrecrime(address)", sepolia.GUARDIAN],
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setMinDstGas(uint16,uint16,uint256)", sepolia.GUARDIAN],
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setPayloadSizeLimit(uint16,uint256)", sepolia.GUARDIAN],
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setConfig(uint16,uint16,uint256,bytes)", sepolia.GUARDIAN],
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setMaxDailyReceiveLimit(uint256)", sepolia.GUARDIAN],
    },

    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "pause()", sepolia.GUARDIAN],
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "unpause()", sepolia.GUARDIAN],
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setTrustedRemoteAddress(uint16,bytes)", sepolia.GUARDIAN],
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", sepolia.GUARDIAN],
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setTimelockPendingAdmin(address,uint8)", sepolia.GUARDIAN],
    },
    {
      target: SEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "retryMessage(uint16,bytes,uint64,bytes)", sepolia.GUARDIAN],
    },

    {
      target: SEPOLIA_ACM,
      signature: "grantRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, SEPOLIA_NORMAL_TIMELOCK],
    },
  ]);
};
export default vip030;
