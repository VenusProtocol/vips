import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const XVSBridgeAdmin_Proxy = "0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21";

export const MIN_DST_GAS = "300000";
export const SINGLE_SEND_LIMIT = "10000000000000000000000";
export const MAX_DAILY_SEND_LIMIT = "50000000000000000000000";
export const SINGLE_RECEIVE_LIMIT = "10000000000000000000000";
export const MAX_DAILY_RECEIVE_LIMIT = "50000000000000000000000";
export const DEST_CHAIN_ID = 202; // OPBNBMAINNET
const TRUSTED_REMOTE = "0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2";

export const vip216 = () => {
  const meta = {
    version: "v2",
    title: "VIP to configure bsc XVS bridge for OPBNBMAINNET",
    description: ``,

    forDescription: "I agree that Venus Protocol should proceed with this configuration for XVS Bridge",
    againstDescription: "I do not think that Venus Protocol should proceed with this configuration for XVS Bridge",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this configuration for XVS Bridge",
  };

  return makeProposal(
    [
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [DEST_CHAIN_ID, TRUSTED_REMOTE], // OPBNBTESTNET
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
