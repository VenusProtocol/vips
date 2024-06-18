import { LzChainId, ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const ETHEREUM_FASTTRACK_TIMELOCK = "0x8764F50616B62a99A997876C2DEAaa04554C5B2E";
const ETHEREUM_CRITICAL_TIMELOCK = "0xeB9b85342c34F65af734C7bd4a149c86c472bC00";
export const ETHEREUM_OMNICHAIN_EXECUTOR_OWNER = "0x87Ed3Fd3a25d157637b955991fb1B41B566916Ba";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";

const OPBNBMAINNET_FASTTRACK_TIMELOCK = "0x55fe000003Ad403a2F740dC1D0c58B59de7A6CD9";
const OPBNBMAINNET_CRITICAL_TIMELOCK = "0x372c3318241E430CF32f59a6905841261caE7365";
export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER = "0xf19b44Bf78A5330354312Cbc236EA8984828b4E2";

const ARBITRUM_FASTTRACK_TIMELOCK = "0x2286a9B2a5246218f2fC1F380383f45BDfCE3E04";
const ARBITRUM_CRITICAL_TIMELOCK = "0x181E4f8F21D087bF02Ea2F64D5e550849FBca674";
export const ARBITRUM_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const ARBITRUM_OMNICHAIN_EXECUTOR_OWNER = "0xf72C1Aa0A1227B4bCcB28E1B1015F0616E2db7fD";

const ETHEREUM_CHAIN_ID = LzChainId.ethereum;
const OPBNBMAINNET_CHAIN_ID = LzChainId.opbnbmainnet;
const ARBITRUM_CHAIN_ID = LzChainId.arbitrumone;

const vip324 = () => {
  const meta = {
    version: "v2",
    title:
      "vip324 give permission of OmnichainGovernanceExecutor to ethereum, opbnbmainnet, & arbitrum fasttrack and critical timelock",
    description: `#### Description
    This VIP will grant permission to timelocks of OmnichainProposalExecutor on ETHEREUM & OPBNBMAINNET & ARBITRUM chains`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setMaxDailyReceiveLimit(uint256)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setMaxDailyReceiveLimit(uint256)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "pause()", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },

      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "pause()", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ETHEREUM_OMNICHAIN_EXECUTOR_OWNER,
          "setConfig(uint16,uint16,uint256,bytes)",
          ETHEREUM_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ETHEREUM_OMNICHAIN_EXECUTOR_OWNER,
          "setConfig(uint16,uint16,uint256,bytes)",
          ETHEREUM_CRITICAL_TIMELOCK,
        ],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },

      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ETHEREUM_OMNICHAIN_EXECUTOR_OWNER,
          "setTrustedRemoteAddress(uint16,bytes)",
          ETHEREUM_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ETHEREUM_CHAIN_ID,
      },

      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ETHEREUM_OMNICHAIN_EXECUTOR_OWNER,
          "setTrustedRemoteAddress(uint16,bytes)",
          ETHEREUM_CRITICAL_TIMELOCK,
        ],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ETHEREUM_OMNICHAIN_EXECUTOR_OWNER,
          "setTimelockPendingAdmin(address,uint8)",
          ETHEREUM_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ETHEREUM_CHAIN_ID,
      },

      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ETHEREUM_OMNICHAIN_EXECUTOR_OWNER,
          "setTimelockPendingAdmin(address,uint8)",
          ETHEREUM_CRITICAL_TIMELOCK,
        ],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ETHEREUM_OMNICHAIN_EXECUTOR_OWNER,
          "retryMessage(uint16,bytes,uint64,bytes)",
          ETHEREUM_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ETHEREUM_CHAIN_ID,
      },

      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ETHEREUM_OMNICHAIN_EXECUTOR_OWNER,
          "retryMessage(uint16,bytes,uint64,bytes)",
          ETHEREUM_CRITICAL_TIMELOCK,
        ],
        dstChainId: ETHEREUM_CHAIN_ID,
      },

      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", OPBNBMAINNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "setMaxDailyReceiveLimit(uint256)",
          OPBNBMAINNET_FASTTRACK_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "setMaxDailyReceiveLimit(uint256)",
          OPBNBMAINNET_CRITICAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "pause()", OPBNBMAINNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },

      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "pause()", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "setConfig(uint16,uint16,uint256,bytes)",
          OPBNBMAINNET_FASTTRACK_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "setConfig(uint16,uint16,uint256,bytes)",
          OPBNBMAINNET_CRITICAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", OPBNBMAINNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },

      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "setTrustedRemoteAddress(uint16,bytes)",
          OPBNBMAINNET_FASTTRACK_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },

      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "setTrustedRemoteAddress(uint16,bytes)",
          OPBNBMAINNET_CRITICAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "setTimelockPendingAdmin(address,uint8)",
          OPBNBMAINNET_FASTTRACK_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },

      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "setTimelockPendingAdmin(address,uint8)",
          OPBNBMAINNET_CRITICAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "retryMessage(uint16,bytes,uint64,bytes)",
          OPBNBMAINNET_FASTTRACK_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },

      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "retryMessage(uint16,bytes,uint64,bytes)",
          OPBNBMAINNET_CRITICAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", OPBNBMAINNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },

      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", ARBITRUM_FASTTRACK_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setMaxDailyReceiveLimit(uint256)", ARBITRUM_FASTTRACK_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setMaxDailyReceiveLimit(uint256)", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "pause()", ARBITRUM_FASTTRACK_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },

      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "pause()", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_OMNICHAIN_EXECUTOR_OWNER,
          "setConfig(uint16,uint16,uint256,bytes)",
          ARBITRUM_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_OMNICHAIN_EXECUTOR_OWNER,
          "setConfig(uint16,uint16,uint256,bytes)",
          ARBITRUM_CRITICAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", ARBITRUM_FASTTRACK_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },

      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_OMNICHAIN_EXECUTOR_OWNER,
          "setTrustedRemoteAddress(uint16,bytes)",
          ARBITRUM_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ARBITRUM_CHAIN_ID,
      },

      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_OMNICHAIN_EXECUTOR_OWNER,
          "setTrustedRemoteAddress(uint16,bytes)",
          ARBITRUM_CRITICAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_OMNICHAIN_EXECUTOR_OWNER,
          "setTimelockPendingAdmin(address,uint8)",
          ARBITRUM_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ARBITRUM_CHAIN_ID,
      },

      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_OMNICHAIN_EXECUTOR_OWNER,
          "setTimelockPendingAdmin(address,uint8)",
          ARBITRUM_CRITICAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_OMNICHAIN_EXECUTOR_OWNER,
          "retryMessage(uint16,bytes,uint64,bytes)",
          ARBITRUM_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ARBITRUM_CHAIN_ID,
      },

      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_OMNICHAIN_EXECUTOR_OWNER,
          "retryMessage(uint16,bytes,uint64,bytes)",
          ARBITRUM_CRITICAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", ARBITRUM_FASTTRACK_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip324;
