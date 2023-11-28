import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const XVSBridgeAdmin_Proxy = "0x5D08D49A2e43aC4c72C60754d1550BA12e846d66";
const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";

export const MIN_DST_GAS = "200000";
export const SINGLE_SEND_LIMIT = "10000000000000000000";
export const MAX_DAILY_SEND_LIMIT = "500000000000000000000";
export const SINGLE_RECEIVE_LIMIT = "10000000000000000000";
export const MAX_DAILY_RECEIVE_LIMIT = "500000000000000000000";
export const DEST_CHAIN_ID = 10161;

export const vip187Testnet = () => {
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
        params: [XVSBridgeAdmin_Proxy, "setTrustedRemoteAddress(uint16,bytes)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "transferBridgeOwnership(address)", NORMAL_TIMELOCK],
      },
      { target: XVSBridgeAdmin_Proxy, signature: "acceptOwnership()", params: [] },
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [DEST_CHAIN_ID, "0x307C77D8606d7E486aC5D73d309e16996A336dbd"],
      },
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setMinDstGas(uint16,uint16,uint256)",
        params: [DEST_CHAIN_ID, 0, "200000"],
      },
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [DEST_CHAIN_ID, MAX_DAILY_SEND_LIMIT],
      },
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setMaxSingleTransactionLimit(uint16,uint256)",
        params: [DEST_CHAIN_ID, "10000000000000000000"],
      },
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setMaxDailyReceiveLimit(uint16,uint256)",
        params: [DEST_CHAIN_ID, MAX_DAILY_RECEIVE_LIMIT],
      },
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
        params: [DEST_CHAIN_ID, "10000000000000000000"],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
