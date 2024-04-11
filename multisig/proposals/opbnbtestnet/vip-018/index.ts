import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

const XVS_BRIDGE_ADMIN_PROXY = "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff";
export const SINGLE_SEND_LIMIT = parseUnits("10000", 18);
export const MAX_DAILY_SEND_LIMIT = parseUnits("50000", 18);
export const SINGLE_RECEIVE_LIMIT = parseUnits("10000", 18);
export const MAX_DAILY_RECEIVE_LIMIT = parseUnits("50000", 18);
export const MIN_DEST_GAS = "300000";

export const ARBITRUM_SEPOLIA_ENDPOINT_ID = 10231;
export const ARBITRUM_SEPOLIA_TRUSTED_REMOTE = "0xe9b66800e63888de29c4c9131faadbdbdcfae917";

const vip018 = () => {
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

export default vip018;
