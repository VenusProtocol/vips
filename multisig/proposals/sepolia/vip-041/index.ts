import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
const SEPOLIA_NORMAL_TIMELOCK = "0xc332F7D8D5eA72cf760ED0E1c0485c8891C6E0cF";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const SEPOLIA_OMNICHAIN_EXECUTOR_OWNER = "0xf964158C67439D01e5f17F0A3F39DfF46823F27A";
const { sepolia } = NETWORK_ADDRESSES;

export const vip041 = () => {
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
      signature: "giveCallPermission(address,string,address)",
      params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", sepolia.GUARDIAN],
    },
    {
      target: SEPOLIA_ACM,
      signature: "grantRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, SEPOLIA_NORMAL_TIMELOCK],
    },
  ]);
};
export default vip041;
