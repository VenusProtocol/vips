import { LzChainId, ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const ARBITRUMSEPOLIA_FASTTRACK_TIMELOCK = "0x75a9f1fB356705Be0b875eb66f642A766fB1a90E";
const ARBITRUMSEPOLIA_CRITICAL_TIMELOCK = "0xC7d1b39482beaf7b9ac76Ac613c4872A97949121";
export const ARBITRUMSEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER = "0x2a93A07AEfe6ae1E9F4fD901Ed14F52830E1254B";

const ARBITRUMSEPOLIA_CHAIN_ID = LzChainId.arbitrumsepolia;

const vip324 = () => {
  const meta = {
    version: "v2",
    title: "vip324 give permission of OmnichainGovernanceExecutor to arbitrum sepolia fasttrack and critical timelock",
    description: `#### Description
    This VIP will grant permission to timelocks of OmnichainProposalExecutor on ARBITRUMSEPOLIA chain`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setReceiveVersion(uint16)",
          ARBITRUMSEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setReceiveVersion(uint16)",
          ARBITRUMSEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setMaxDailyReceiveLimit(uint256)",
          ARBITRUMSEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setMaxDailyReceiveLimit(uint256)",
          ARBITRUMSEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "pause()", ARBITRUMSEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },

      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "pause()", ARBITRUMSEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setConfig(uint16,uint16,uint256,bytes)",
          ARBITRUMSEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setConfig(uint16,uint16,uint256,bytes)",
          ARBITRUMSEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "addTimelocks(address[])",
          ARBITRUMSEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },

      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "addTimelocks(address[])",
          ARBITRUMSEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setTrustedRemoteAddress(uint16,bytes)",
          ARBITRUMSEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },

      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setTrustedRemoteAddress(uint16,bytes)",
          ARBITRUMSEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setTimelockPendingAdmin(address,uint8)",
          ARBITRUMSEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },

      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setTimelockPendingAdmin(address,uint8)",
          ARBITRUMSEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "retryMessage(uint16,bytes,uint64,bytes)",
          ARBITRUMSEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },

      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "retryMessage(uint16,bytes,uint64,bytes)",
          ARBITRUMSEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", ARBITRUMSEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", ARBITRUMSEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip324;
