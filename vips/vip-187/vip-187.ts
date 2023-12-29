import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const XVSBridgeAdmin_Proxy = "0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21";
const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const GUARDIAN = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";
const TRUSTED_REMOTE = "0x888E317606b4c590BBAD88653863e8B345702633";

export const MIN_DST_GAS = "300000";
export const SINGLE_SEND_LIMIT = "10000000000000000000000";
export const MAX_DAILY_SEND_LIMIT = "50000000000000000000000";
export const SINGLE_RECEIVE_LIMIT = "10000000000000000000000";
export const MAX_DAILY_RECEIVE_LIMIT = "50000000000000000000000";
export const DEST_CHAIN_ID = 101;

export const vip187 = () => {
  const meta = {
    version: "v2",
    title: "VIP to configure bsc XVS bridge",
    description: ``,

    forDescription: "I agree that Venus Protocol should proceed with this configuration for XVS Bridge",
    againstDescription: "I do not think that Venus Protocol should proceed with this configuration for XVS Bridge",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this configuration for XVS Bridge",
  };

  return makeProposal(
    [
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setSendVersion(uint16)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setReceiveVersion(uint16)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "forceResumeReceive(uint16,bytes)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setOracle(address)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxSingleTransactionLimit(uint16,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxDailyLimit(uint16,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxSingleReceiveTransactionLimit(uint16,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxDailyReceiveLimit(uint16,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "pause()", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "unpause()", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "removeTrustedRemote(uint16)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "dropFailedMessage(uint16,bytes)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "fallbackWithdraw(address,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "fallbackDeposit(uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setPrecrime(address)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMinDstGas(uint16,uint16,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setPayloadSizeLimit(uint16,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setWhitelist(address,bool)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setConfig(uint16,uint16,uint256,bytes)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "sweepToken(address,address,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "updateSendAndCallEnabled(bool)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setTrustedRemoteAddress(uint16,bytes)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "transferBridgeOwnership(address)", NORMAL_TIMELOCK],
      },
      // FASTTRACK TIMELOCK PERMISSIONS
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setSendVersion(uint16)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setReceiveVersion(uint16)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "forceResumeReceive(uint16,bytes)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxSingleTransactionLimit(uint16,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxDailyLimit(uint16,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxSingleReceiveTransactionLimit(uint16,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxDailyReceiveLimit(uint16,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "pause()", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "unpause()", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "removeTrustedRemote(uint16)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMinDstGas(uint16,uint16,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setPayloadSizeLimit(uint16,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setWhitelist(address,bool)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setConfig(uint16,uint16,uint256,bytes)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "updateSendAndCallEnabled(bool)", FAST_TRACK_TIMELOCK],
      },
      // CRITICAL TIMELOCK PERMISSIONS
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setSendVersion(uint16)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setReceiveVersion(uint16)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "forceResumeReceive(uint16,bytes)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxSingleTransactionLimit(uint16,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxDailyLimit(uint16,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxSingleReceiveTransactionLimit(uint16,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxDailyReceiveLimit(uint16,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "pause()", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "unpause()", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "removeTrustedRemote(uint16)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMinDstGas(uint16,uint16,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setPayloadSizeLimit(uint16,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setWhitelist(address,bool)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setConfig(uint16,uint16,uint256,bytes)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "updateSendAndCallEnabled(bool)", CRITICAL_TIMELOCK],
      },
      // GUARDIAN PERMISSIONS
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "pause()", GUARDIAN],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "unpause()", GUARDIAN],
      },
      { target: XVSBridgeAdmin_Proxy, signature: "acceptOwnership()", params: [] },
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setWhitelist(address,bool)",
        params: [NORMAL_TIMELOCK, true],
      },
      // ETHEREUM CONFIGURATION
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [DEST_CHAIN_ID, TRUSTED_REMOTE],
      },
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setMinDstGas(uint16,uint16,uint256)",
        params: [DEST_CHAIN_ID, 0, MIN_DST_GAS],
      },
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [DEST_CHAIN_ID, MAX_DAILY_SEND_LIMIT],
      },
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setMaxSingleTransactionLimit(uint16,uint256)",
        params: [DEST_CHAIN_ID, SINGLE_SEND_LIMIT],
      },
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setMaxDailyReceiveLimit(uint16,uint256)",
        params: [DEST_CHAIN_ID, MAX_DAILY_RECEIVE_LIMIT],
      },
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
        params: [DEST_CHAIN_ID, SINGLE_RECEIVE_LIMIT],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
