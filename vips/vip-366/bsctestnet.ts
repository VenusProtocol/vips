import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const ZKSYNCSEPOLIA_FASTTRACK_TIMELOCK = "0xb055e028b27d53a455a6c040a6952e44E9E615c4";
const ZKSYNCSEPOLIA_CRITICAL_TIMELOCK = "0x0E6138bE0FA1915efC73670a20A10EFd720a6Cc8";
export const ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER = "0xa34607D58146FA02aF5f920f29C3D916acAb0bC5";
export const ZKSYNCSEPOLIA_ACM = "0xD07f543d47c3a8997D6079958308e981AC14CD01";

const ZKSYNCSEPOLIA_CHAIN_ID = LzChainId.zksyncsepolia;

const vip366 = () => {
  const meta = {
    version: "v2",
    title: "VIP-366 Enable Multichain Governance on Zksync sepolia (2/2)",
    description: `### Description

Related with the VIP-366, if passed, this VIP will grant permission to Fast-track and Critical timelocks to execute privilege commands on the OmnichainProposalExecutor on Zksync sepolia. Review VIP-365 for more details.

### References
`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", ZKSYNCSEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", ZKSYNCSEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setMaxDailyReceiveLimit(uint256)",
          ZKSYNCSEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setMaxDailyReceiveLimit(uint256)",
          ZKSYNCSEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "pause()", ZKSYNCSEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },

      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "pause()", ZKSYNCSEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setConfig(uint16,uint16,uint256,bytes)",
          ZKSYNCSEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setConfig(uint16,uint16,uint256,bytes)",
          ZKSYNCSEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", ZKSYNCSEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },

      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", ZKSYNCSEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },

      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "retryMessage(uint16,bytes,uint64,bytes)",
          ZKSYNCSEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },

      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "retryMessage(uint16,bytes,uint64,bytes)",
          ZKSYNCSEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip366;
