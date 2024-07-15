import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const ETHEREUM_XVS_BRIDGE_ADMIN = "0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96";

export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const OPBNBMAINNET_XVS_BRIDGE_ADMIN = "0x52fcE05aDbf6103d71ed2BA8Be7A317282731831";

export const ARBITRUM_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const ARBITRUM_XVS_BRIDGE_ADMIN = "0xf5d81C6F7DAA3F97A6265C8441f92eFda22Ad784";

const ETHEREUM_CHAIN_ID = LzChainId.ethereum;
const OPBNBMAINNET_CHAIN_ID = LzChainId.opbnbmainnet;
const ARBITRUM_CHAIN_ID = LzChainId.arbitrumone;

const { arbitrumone, ethereum, opbnbmainnet } = NETWORK_ADDRESSES;

const vip333 = () => {
  const meta = {
    version: "v2",
    title: "VIP-333 XVS Bridge permissions given to all Timelocks",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      // Accept ownership of XVS bridge admin
      {
        target: ARBITRUM_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: ETHEREUM_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: ETHEREUM_CHAIN_ID,
      },

      // Permissions given to Normal Timelock
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "setSendVersion(uint16)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "setReceiveVersion(uint16)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "forceResumeReceive(uint16,bytes)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "setOracle(address)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_XVS_BRIDGE_ADMIN,
          "setMaxSingleTransactionLimit(uint16,uint256)",
          arbitrumone.NORMAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "setMaxDailyLimit(uint16,uint256)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_XVS_BRIDGE_ADMIN,
          "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
          arbitrumone.NORMAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "setMaxDailyReceiveLimit(uint16,uint256)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "pause()", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "unpause()", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "removeTrustedRemote(uint16)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "dropFailedMessage(uint16,bytes,uint64)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "setPrecrime(address)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "setMinDstGas(uint16,uint16,uint256)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "setPayloadSizeLimit(uint16,uint256)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "setWhitelist(address,bool)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "setConfig(uint16,uint16,uint256,bytes)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "sweepToken(address,address,uint256)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "updateSendAndCallEnabled(bool)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "setTrustedRemoteAddress(uint16,bytes)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS_BRIDGE_ADMIN, "transferBridgeOwnership(address)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "setSendVersion(uint16)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "setReceiveVersion(uint16)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "forceResumeReceive(uint16,bytes)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "setOracle(address)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_XVS_BRIDGE_ADMIN,
          "setMaxSingleTransactionLimit(uint16,uint256)",
          opbnbmainnet.NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "setMaxDailyLimit(uint16,uint256)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_XVS_BRIDGE_ADMIN,
          "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
          opbnbmainnet.NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_XVS_BRIDGE_ADMIN,
          "setMaxDailyReceiveLimit(uint16,uint256)",
          opbnbmainnet.NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "pause()", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "unpause()", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "removeTrustedRemote(uint16)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "dropFailedMessage(uint16,bytes,uint64)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "setPrecrime(address)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "setMinDstGas(uint16,uint16,uint256)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "setPayloadSizeLimit(uint16,uint256)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "setWhitelist(address,bool)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "setConfig(uint16,uint16,uint256,bytes)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "sweepToken(address,address,uint256)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "updateSendAndCallEnabled(bool)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "setTrustedRemoteAddress(uint16,bytes)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS_BRIDGE_ADMIN, "transferBridgeOwnership(address)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "setSendVersion(uint16)", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "setReceiveVersion(uint16)", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "forceResumeReceive(uint16,bytes)", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "setOracle(address)", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "setMaxSingleTransactionLimit(uint16,uint256)", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "setMaxDailyLimit(uint16,uint256)", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ETHEREUM_XVS_BRIDGE_ADMIN,
          "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
          ethereum.NORMAL_TIMELOCK,
        ],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "setMaxDailyReceiveLimit(uint16,uint256)", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "pause()", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "unpause()", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "removeTrustedRemote(uint16)", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "dropFailedMessage(uint16,bytes,uint64)", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "setPrecrime(address)", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "setMinDstGas(uint16,uint16,uint256)", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "setPayloadSizeLimit(uint16,uint256)", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "setWhitelist(address,bool)", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "setConfig(uint16,uint16,uint256,bytes)", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "sweepToken(address,address,uint256)", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "updateSendAndCallEnabled(bool)", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "setTrustedRemoteAddress(uint16,bytes)", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS_BRIDGE_ADMIN, "transferBridgeOwnership(address)", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },

      // Whitelist Normal Timelock
      {
        target: ARBITRUM_XVS_BRIDGE_ADMIN,
        signature: "setWhitelist(address,bool)",
        params: [arbitrumone.NORMAL_TIMELOCK, true],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_XVS_BRIDGE_ADMIN,
        signature: "setWhitelist(address,bool)",
        params: [opbnbmainnet.NORMAL_TIMELOCK, true],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: ETHEREUM_XVS_BRIDGE_ADMIN,
        signature: "setWhitelist(address,bool)",
        params: [ethereum.NORMAL_TIMELOCK, true],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip333;
