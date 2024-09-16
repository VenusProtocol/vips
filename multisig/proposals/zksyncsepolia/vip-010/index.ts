import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

export const ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER = "0xa34607D58146FA02aF5f920f29C3D916acAb0bC5";
export const ZKSYNCSEPOLIA_ACM = "0xD07f543d47c3a8997D6079958308e981AC14CD01";
export const ZKSYNCSEPOLIA_NORMAL_TIMELOCK = "0x1730527a0f0930269313D77A317361b42971a67E";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

const { zksyncsepolia } = NETWORK_ADDRESSES;

export const vip010 = () => {
  return makeProposal([
    {
      target: ZKSYNCSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "forceResumeReceive(uint16,bytes)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ZKSYNCSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setMaxDailyReceiveLimit(uint256)", zksyncsepolia.GUARDIAN],
    },

    {
      target: ZKSYNCSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "pause()", zksyncsepolia.GUARDIAN],
    },
    {
      target: ZKSYNCSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "unpause()", zksyncsepolia.GUARDIAN],
    },
    {
      target: ZKSYNCSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setTrustedRemoteAddress(uint16,bytes)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ZKSYNCSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", zksyncsepolia.GUARDIAN],
    },
    {
      target: ZKSYNCSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
        "setTimelockPendingAdmin(address,uint8)",
        zksyncsepolia.GUARDIAN,
      ],
    },
    {
      target: ZKSYNCSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
        "retryMessage(uint16,bytes,uint64,bytes)",
        zksyncsepolia.GUARDIAN,
      ],
    },
    {
      target: ZKSYNCSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setSrcChainId(uint16)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ZKSYNCSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ZKSYNCSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
        "setConfig(uint16,uint16,uint256,bytes)",
        zksyncsepolia.GUARDIAN,
      ],
    },
    {
      target: ZKSYNCSEPOLIA_ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "transferBridgeOwnership(address)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ZKSYNCSEPOLIA_ACM,
      signature: "grantRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, ZKSYNCSEPOLIA_NORMAL_TIMELOCK],
    },
  ]);
};
export default vip010;
