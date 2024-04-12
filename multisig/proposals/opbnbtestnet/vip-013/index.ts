import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

const XVS_BRIDGE_ADMIN_PROXY = "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff";
export const OPBNB_TREASURY = "0x3370915301E8a6A6baAe6f461af703e2498409F3";
export const SINGLE_SEND_LIMIT = parseUnits("10000", 18);
export const MAX_DAILY_SEND_LIMIT = parseUnits("50000", 18);
export const SINGLE_RECEIVE_LIMIT = parseUnits("10000", 18);
export const MAX_DAILY_RECEIVE_LIMIT = parseUnits("50000", 18);
export const SEPOLIA_ENDPOINT_ID = 10161;
export const SEPOLIA_TRUSTED_REMOTE = "0xc340b7d3406502f43dc11a988e4ec5bbe536e642";
export const MIN_DEST_GAS = "300000";

const vip013 = () => {
  return makeProposal([
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [SEPOLIA_ENDPOINT_ID, SEPOLIA_TRUSTED_REMOTE],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMinDstGas(uint16,uint16,uint256)",
      params: [SEPOLIA_ENDPOINT_ID, 0, MIN_DEST_GAS],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxDailyLimit(uint16,uint256)",
      params: [SEPOLIA_ENDPOINT_ID, MAX_DAILY_SEND_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxSingleTransactionLimit(uint16,uint256)",
      params: [SEPOLIA_ENDPOINT_ID, SINGLE_SEND_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxDailyReceiveLimit(uint16,uint256)",
      params: [SEPOLIA_ENDPOINT_ID, MAX_DAILY_RECEIVE_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
      params: [SEPOLIA_ENDPOINT_ID, SINGLE_RECEIVE_LIMIT],
    },
    { target: XVS_BRIDGE_ADMIN_PROXY, signature: "setWhitelist(address,bool)", params: [OPBNB_TREASURY, true] },
  ]);
};

export default vip013;
