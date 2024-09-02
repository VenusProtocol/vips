import { parseUnits } from "ethers/lib/utils";
import { LzChainId } from "src/types";
import { makeProposal } from "src/utils";

const XVS_BRIDGE_ADMIN = "0xd3c6bdeeadB2359F726aD4cF42EAa8B7102DAd9B";

export const MIN_DST_GAS = "300000";
export const SINGLE_SEND_LIMIT = parseUnits("10000", 18);
export const MAX_DAILY_SEND_LIMIT = parseUnits("50000", 18);
export const SINGLE_RECEIVE_LIMIT = parseUnits("10200", 18);
export const MAX_DAILY_RECEIVE_LIMIT = parseUnits("51000", 18);
export const ZKSYNC_SEPOLIA_TRUSTED_REMOTE = "0x760461ccb2508caaa2ece0c28af3a4707b853043";

const vip057 = () => {
  return makeProposal([
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [LzChainId.zksyncsepolia, ZKSYNC_SEPOLIA_TRUSTED_REMOTE],
    },
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setMinDstGas(uint16,uint16,uint256)",
      params: [LzChainId.zksyncsepolia, 0, MIN_DST_GAS],
    },
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setMaxDailyLimit(uint16,uint256)",
      params: [LzChainId.zksyncsepolia, MAX_DAILY_SEND_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setMaxSingleTransactionLimit(uint16,uint256)",
      params: [LzChainId.zksyncsepolia, SINGLE_SEND_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setMaxDailyReceiveLimit(uint16,uint256)",
      params: [LzChainId.zksyncsepolia, MAX_DAILY_RECEIVE_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
      params: [LzChainId.zksyncsepolia, SINGLE_RECEIVE_LIMIT],
    },
  ]);
};

export default vip057;
