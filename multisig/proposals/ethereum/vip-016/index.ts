import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

const XVS_BRIDGE_ADMIN_PROXY = "0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96";
export const SINGLE_SEND_LIMIT = parseUnits("10000", 18);
export const MAX_DAILY_SEND_LIMIT = parseUnits("50000", 18);
export const SINGLE_RECEIVE_LIMIT = parseUnits("10000", 18);
export const MAX_DAILY_RECEIVE_LIMIT = parseUnits("50000", 18);
export const OP_BNB_ENDPOINT_ID = 202;
export const OP_BNB_TRUSTED_REMOTE = "0x100d331c1b5dcd41eacb1eced0e83dcebf3498b2";
export const MIN_DEST_GAS = "300000";

const vip016 = () => {
  return makeProposal([
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [OP_BNB_ENDPOINT_ID, OP_BNB_TRUSTED_REMOTE],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMinDstGas(uint16,uint16,uint256)",
      params: [OP_BNB_ENDPOINT_ID, 0, MIN_DEST_GAS],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxDailyLimit(uint16,uint256)",
      params: [OP_BNB_ENDPOINT_ID, MAX_DAILY_SEND_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxSingleTransactionLimit(uint16,uint256)",
      params: [OP_BNB_ENDPOINT_ID, SINGLE_SEND_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxDailyReceiveLimit(uint16,uint256)",
      params: [OP_BNB_ENDPOINT_ID, MAX_DAILY_RECEIVE_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
      params: [OP_BNB_ENDPOINT_ID, SINGLE_RECEIVE_LIMIT],
    },
  ]);
};

export default vip016;
