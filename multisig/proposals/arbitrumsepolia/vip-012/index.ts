import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

export const ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER = "0xfCA70dd553b7dF6eB8F813CFEA6a9DD039448878";
export const ARBITRUMSEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const ARBITRUMSEPOLIA_NORMAL_TIMELOCK = "0x794BCA78E606f3a462C31e5Aba98653Efc1322F8";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

export const vip012 = () => {
  return makeProposal([
    {
      target: ARBITRUMSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", arbitrumsepolia.GUARDIAN],
    },
    {
      target: ARBITRUMSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", arbitrumsepolia.GUARDIAN],
    },
    {
      target: ARBITRUMSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "forceResumeReceive(uint16,bytes)", arbitrumsepolia.GUARDIAN],
    },
    {
      target: ARBITRUMSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setPrecrime(address)", arbitrumsepolia.GUARDIAN],
    },
    {
      target: ARBITRUMSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
        "setMinDstGas(uint16,uint16,uint256)",
        arbitrumsepolia.GUARDIAN,
      ],
    },
    {
      target: ARBITRUMSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
        "setPayloadSizeLimit(uint16,uint256)",
        arbitrumsepolia.GUARDIAN,
      ],
    },
    {
      target: ARBITRUMSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
        "setConfig(uint16,uint16,uint256,bytes)",
        arbitrumsepolia.GUARDIAN,
      ],
    },
    {
      target: ARBITRUMSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setMaxDailyReceiveLimit(uint256)", arbitrumsepolia.GUARDIAN],
    },

    {
      target: ARBITRUMSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "pause()", arbitrumsepolia.GUARDIAN],
    },
    {
      target: ARBITRUMSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "unpause()", arbitrumsepolia.GUARDIAN],
    },
    {
      target: ARBITRUMSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
        "setTrustedRemoteAddress(uint16,bytes)",
        arbitrumsepolia.GUARDIAN,
      ],
    },
    {
      target: ARBITRUMSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", arbitrumsepolia.GUARDIAN],
    },
    {
      target: ARBITRUMSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
        "setTimelockPendingAdmin(address,uint8)",
        arbitrumsepolia.GUARDIAN,
      ],
    },
    {
      target: ARBITRUMSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
        "retryMessage(uint16,bytes,uint64,bytes)",
        arbitrumsepolia.GUARDIAN,
      ],
    },
    {
      target: ARBITRUMSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", arbitrumsepolia.GUARDIAN],
    },
    {
      target: ARBITRUMSEPOLIA_ACM,
      signature: "grantRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, ARBITRUMSEPOLIA_NORMAL_TIMELOCK],
    },
  ]);
};
export default vip012;
