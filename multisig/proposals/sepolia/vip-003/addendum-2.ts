import { parseUnits } from "ethers/lib/utils";
import { makeProposal } from "src/utils";

const XVSBridgeAdmin_Proxy = "0xd3c6bdeeadB2359F726aD4cF42EAa8B7102DAd9B";
const XVS = "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E";
const XVS_BRIDGE_DEST = "0xc340b7d3406502F43dC11a988E4EC5bbE536E642";
export const SINGLE_SEND_LIMIT = "10000000000000000000000";
export const MAX_DAILY_SEND_LIMIT = "50000000000000000000000";
export const SINGLE_RECEIVE_LIMIT = "10000000000000000000000";
export const MAX_DAILY_RECEIVE_LIMIT = "50000000000000000000000";
export const SRC_CHAIN_ID = 10102;
export const XVS_MINT_CAP = parseUnits("500000", 18);

const vip003 = () => {
  return makeProposal([
    {
      target: XVSBridgeAdmin_Proxy,
      signature: "setMaxDailyLimit(uint16,uint256)",
      params: [SRC_CHAIN_ID, MAX_DAILY_SEND_LIMIT],
    },
    {
      target: XVSBridgeAdmin_Proxy,
      signature: "setMaxSingleTransactionLimit(uint16,uint256)",
      params: [SRC_CHAIN_ID, SINGLE_SEND_LIMIT],
    },
    {
      target: XVSBridgeAdmin_Proxy,
      signature: "setMaxDailyReceiveLimit(uint16,uint256)",
      params: [SRC_CHAIN_ID, MAX_DAILY_RECEIVE_LIMIT],
    },
    {
      target: XVSBridgeAdmin_Proxy,
      signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
      params: [SRC_CHAIN_ID, SINGLE_RECEIVE_LIMIT],
    },
    {
      target: XVS,
      signature: "setMintCap(address,uint256)",
      params: [XVS_BRIDGE_DEST, XVS_MINT_CAP],
    },
  ]);
};

export default vip003;
