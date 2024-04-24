import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

const XVS_BRIDGE_ADMIN_PROXY = "0xd3c6bdeeadB2359F726aD4cF42EAa8B7102DAd9B";
export const SINGLE_SEND_LIMIT = parseUnits("10000", 18);
export const MAX_DAILY_SEND_LIMIT = parseUnits("50000", 18);
export const SINGLE_RECEIVE_LIMIT = parseUnits("10200", 18);
export const MAX_DAILY_RECEIVE_LIMIT = parseUnits("51000", 18);
export const MIN_DEST_GAS = "300000";

export const ARBITRUM_SEPOLIA_ENDPOINT_ID = 10231;
export const ARBITRUM_SEPOLIA_TRUSTED_REMOTE = "0xfdc5cec63fd167da46cf006585b30d03b104efd4";

const vip019 = () => {
  return makeProposal([
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [ARBITRUM_SEPOLIA_ENDPOINT_ID, ARBITRUM_SEPOLIA_TRUSTED_REMOTE],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMinDstGas(uint16,uint16,uint256)",
      params: [ARBITRUM_SEPOLIA_ENDPOINT_ID, 0, MIN_DEST_GAS],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxDailyLimit(uint16,uint256)",
      params: [ARBITRUM_SEPOLIA_ENDPOINT_ID, MAX_DAILY_SEND_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxSingleTransactionLimit(uint16,uint256)",
      params: [ARBITRUM_SEPOLIA_ENDPOINT_ID, SINGLE_SEND_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxDailyReceiveLimit(uint16,uint256)",
      params: [ARBITRUM_SEPOLIA_ENDPOINT_ID, MAX_DAILY_RECEIVE_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
      params: [ARBITRUM_SEPOLIA_ENDPOINT_ID, SINGLE_RECEIVE_LIMIT],
    },
  ]);
};

export default vip019;
