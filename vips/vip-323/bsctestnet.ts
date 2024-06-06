import { LzChainId, ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const SEPOLIA_FASTTRACK_TIMELOCK = "0x7F043F43Adb392072a3Ba0cC9c96e894C6f7e182";
const SEPOLIA_CRITICAL_TIMELOCK = "0xA24A7A65b8968a749841988Bd7d05F6a94329fDe";
export const SEPOLIA_OMNICHAIN_EXECUTOR_OWNER = "0xf964158C67439D01e5f17F0A3F39DfF46823F27A";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";

const OPBNBTESTNET_FASTTRACK_TIMELOCK = "0xB2E6268085E75817669479b22c73C2AfEaADF7A6";
const OPBNBTESTNET_CRITICAL_TIMELOCK = "0xBd06aCDEF38230F4EdA0c6FD392905Ad463e42E3";
export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
export const OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER = "0x4F570240FF6265Fbb1C79cE824De6408F1948913";

const SEPOLIA_CHAIN_ID = LzChainId.sepolia;
const OPBNBTESTNET_CHAIN_ID = LzChainId.opbnbtestnet;

const vip323 = () => {
  const meta = {
    version: "v2",
    title:
      "vip323 give permission of OmnichainGovernanceExecutor to sepolia and opbnbtestnet fasttrack and critical timelock",
    description: `#### Description
    This VIP will grant permission to timelocks of OmnichainProposalExecutor on SEPOLIA & OPBNBTESTNET chains`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setMaxDailyReceiveLimit(uint256)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setMaxDailyReceiveLimit(uint256)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "pause()", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },

      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "pause()", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          SEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setConfig(uint16,uint16,uint256,bytes)",
          SEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setConfig(uint16,uint16,uint256,bytes)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },

      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setTrustedRemoteAddress(uint16,bytes)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },

      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setTrustedRemoteAddress(uint16,bytes)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          SEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setTimelockPendingAdmin(address,uint8)",
          SEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: SEPOLIA_CHAIN_ID,
      },

      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setTimelockPendingAdmin(address,uint8)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          SEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "retryMessage(uint16,bytes,uint64,bytes)",
          SEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          SEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "retryMessage(uint16,bytes,uint64,bytes)",
          SEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },

      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER,
          "setMaxDailyReceiveLimit(uint256)",
          OPBNBTESTNET_FASTTRACK_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER,
          "setMaxDailyReceiveLimit(uint256)",
          OPBNBTESTNET_CRITICAL_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "pause()", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },

      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "pause()", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER,
          "setConfig(uint16,uint16,uint256,bytes)",
          OPBNBTESTNET_FASTTRACK_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER,
          "setConfig(uint16,uint16,uint256,bytes)",
          OPBNBTESTNET_CRITICAL_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },

      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER,
          "setTrustedRemoteAddress(uint16,bytes)",
          OPBNBTESTNET_FASTTRACK_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },

      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER,
          "setTrustedRemoteAddress(uint16,bytes)",
          OPBNBTESTNET_CRITICAL_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER,
          "setTimelockPendingAdmin(address,uint8)",
          OPBNBTESTNET_FASTTRACK_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },

      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER,
          "setTimelockPendingAdmin(address,uint8)",
          OPBNBTESTNET_CRITICAL_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER,
          "retryMessage(uint16,bytes,uint64,bytes)",
          OPBNBTESTNET_FASTTRACK_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },

      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER,
          "retryMessage(uint16,bytes,uint64,bytes)",
          OPBNBTESTNET_CRITICAL_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip323;
