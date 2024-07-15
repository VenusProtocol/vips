import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const ETHEREUM_CRITICAL_TIMELOCK = "0xeB9b85342c34F65af734C7bd4a149c86c472bC00";
const OPBNBMAINNET_CRITICAL_TIMELOCK = "0xA7DD2b15B24377296F11c702e758cd9141AB34AA";
const ARBITRUM_CRITICAL_TIMELOCK = "0x181E4f8F21D087bF02Ea2F64D5e550849FBca674";

export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const ETHEREUM_XVS_BRIDGE_ADMIN = "0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96";

export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const OPBNBMAINNET_XVS_BRIDGE_ADMIN = "0x52fcE05aDbf6103d71ed2BA8Be7A317282731831";

export const ARBITRUM_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const ARBITRUM_XVS_BRIDGE_ADMIN = "0xf5d81C6F7DAA3F97A6265C8441f92eFda22Ad784";

const ETHEREUM_CHAIN_ID = LzChainId.ethereum;
const OPBNBMAINNET_CHAIN_ID = LzChainId.opbnbmainnet;
const ARBITRUM_CHAIN_ID = LzChainId.arbitrumone;

const vip335 = () => {
  const meta = {
    version: "v2",
    title: "VIP-335 XVS Bridge permissions given to Critical Timelock",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "setSendVersion(uint16)", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "setReceiveVersion(uint16)", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "forceResumeReceive(uint16,bytes)", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "setMaxSingleTransactionLimit(uint16,uint256)", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "setMaxDailyLimit(uint16,uint256)", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_XVS_BRIDGE_ADMIN,
          "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
          ARBITRUM_CRITICAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "setMaxDailyReceiveLimit(uint16,uint256)", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "pause()", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "unpause()", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "removeTrustedRemote(uint16)", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "dropFailedMessage(uint16,bytes,uint64)", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "setMinDstGas(uint16,uint16,uint256)", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "setPayloadSizeLimit(uint16,uint256)", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "setWhitelist(address,bool)", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "setConfig(uint16,uint16,uint256,bytes)", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "updateSendAndCallEnabled(bool)", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "setSendVersion(uint16)", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "setReceiveVersion(uint16)", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "forceResumeReceive(uint16,bytes)", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_XVS_BRIDGE_ADMIN,
          "setMaxSingleTransactionLimit(uint16,uint256)",
          OPBNBMAINNET_CRITICAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "setMaxDailyLimit(uint16,uint256)", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_XVS_BRIDGE_ADMIN,
          "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
          OPBNBMAINNET_CRITICAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_XVS_BRIDGE_ADMIN,
          "setMaxDailyReceiveLimit(uint16,uint256)",
          OPBNBMAINNET_CRITICAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "pause()", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "unpause()", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "removeTrustedRemote(uint16)", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_XVS_BRIDGE_ADMIN,
          "dropFailedMessage(uint16,bytes,uint64)",
          OPBNBMAINNET_CRITICAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "setMinDstGas(uint16,uint16,uint256)", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "setPayloadSizeLimit(uint16,uint256)", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "setWhitelist(address,bool)", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_XVS_BRIDGE_ADMIN,
          "setConfig(uint16,uint16,uint256,bytes)",
          OPBNBMAINNET_CRITICAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "updateSendAndCallEnabled(bool)", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "setSendVersion(uint16)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "setReceiveVersion(uint16)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "forceResumeReceive(uint16,bytes)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "setMaxSingleTransactionLimit(uint16,uint256)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "setMaxDailyLimit(uint16,uint256)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ETHEREUM_XVS_BRIDGE_ADMIN,
          "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
          ETHEREUM_CRITICAL_TIMELOCK,
        ],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "setMaxDailyReceiveLimit(uint16,uint256)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "pause()", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "unpause()", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "removeTrustedRemote(uint16)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "dropFailedMessage(uint16,bytes,uint64)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "setMinDstGas(uint16,uint16,uint256)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "setPayloadSizeLimit(uint16,uint256)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "setWhitelist(address,bool)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "setConfig(uint16,uint16,uint256,bytes)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "updateSendAndCallEnabled(bool)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip335;
