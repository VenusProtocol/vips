import { ProposalType } from "../../src/types";
import { makeProposalV2 } from "../../src/utils";

const SEPOLIA_FASTTRACK_TIMELOCK = "0xB2Cd2b51919160FC57a788e1D3B15BCe2F591b0f";
const SEPOLIA_CRITICAL_TIMELOCK = "0x542bd864DCFDD6031F4EEa35C602B564f952c442";
export const SEPOLIA_OMNICHAIN_EXECUTOR_OWNER = "0x0E33024CD69530126586186C282573D8BD6783ea";
export const SEPOLIA_OMNICHAIN_GOVERNANCE_EXECUTOR = "0x92c6f22d9059d50bac82cd9eb1aa72142a76339a";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const SEPOLIA_MAX_DAILY_LIMIT = 100;
const SEPOLIA_CHAIN_ID = 10161;

export const vip303 = () => {
  const meta = {
    version: "v2",
    title: "vip303 give permission of OmnichainGovernanceExecutor to sepolia fasttrack and critical timelock",
    description: `#### Description
    This VIP will grant permission to timelocks of OmnichainProposalExecutor on SEPOLIA chain`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposalV2(
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};
