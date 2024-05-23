import { LzChainId, ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const SEPOLIA_FASTTRACK_TIMELOCK = "0xB2Cd2b51919160FC57a788e1D3B15BCe2F591b0f";
const SEPOLIA_CRITICAL_TIMELOCK = "0x542bd864DCFDD6031F4EEa35C602B564f952c442";
export const SEPOLIA_OMNICHAIN_EXECUTOR_OWNER = "0x0E33024CD69530126586186C282573D8BD6783ea";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";

const OPBNBTESTNET_FASTTRACK_TIMELOCK = "0x6F6AAB43696b6a7391F56265bA4f215114332522";
const OPBNBTESTNET_CRITICAL_TIMELOCK = "0x606f7696b39EEd74aBCB61901058F191618a5e21";
export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
export const OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER = "0x233eFd8aFd8C164A8d5e54f649E948F823f0a425";

const SEPOLIA_CHAIN_ID = LzChainId.sepolia;
const OPBNBTESTNET_CHAIN_ID = LzChainId.opbnbtestnet;

const vip309 = () => {
  const meta = {
    version: "v2",
    title:
      "vip309 give permission of OmnichainGovernanceExecutor to sepolia and opbnbtestnet fasttrack and critical timelock",
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip309;
