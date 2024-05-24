import { LzChainId, ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const ETHEREUM_FASTTRACK_TIMELOCK = "0x9bF389b62eab4b1b5A68ba5C60a61Bb60092116a";
const ETHEREUM_CRITICAL_TIMELOCK = "0x9dDA9063D5b86CD3fa5Fa316fE0B0E9bd2f85A41";
export const ETHEREUM_OMNICHAIN_EXECUTOR_OWNER = "0xE837D75Acc0eB41D97fCe2f2613d41d6D6590855";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";

const OPBNBMAINNET_FASTTRACK_TIMELOCK = "0x48b0B21c716a6927A4a2be82e95aeF760349240D";
const OPBNBMAINNET_CRITICAL_TIMELOCK = "0xea4E5De5c5522865d7bAbF7a4C2058Dcc3424ed7";
export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER = "0xF6606cB41EbeF4D3968Be7752e0820a0cdCeF413";

const ETHEREUM_CHAIN_ID = LzChainId.ethereum;
const OPBNBMAINNET_CHAIN_ID = LzChainId.opbnbmainnet;

const vip309 = () => {
  const meta = {
    version: "v2",
    title:
      "vip309 give permission of OmnichainGovernanceExecutor to ethereum and opbnbmainnet fasttrack and critical timelock",
    description: `#### Description
    This VIP will grant permission to timelocks of OmnichainProposalExecutor on ETHEREUM & OPBNBMAINNET chains`,
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip309;
