import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

const XVSBridgeAdmin_Proxy = "0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96";
export const SINGLE_SEND_LIMIT = parseUnits("100000", 18);
export const MAX_DAILY_SEND_LIMIT = parseUnits("1000000", 18);
export const SINGLE_RECEIVE_LIMIT = parseUnits("100000", 18);
export const MAX_DAILY_RECEIVE_LIMIT = parseUnits("1000000", 18);
export const SRC_CHAIN_ID = 102;

const vip014 = () => {
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
  ]);
};

export default vip014;
