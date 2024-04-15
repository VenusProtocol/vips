import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

const XVS_BRIDGE_ADMIN_PROXY = "0x52fcE05aDbf6103d71ed2BA8Be7A317282731831";
export const OPBNB_TREASURY = "0xDDc9017F3073aa53a4A8535163b0bf7311F72C52";
export const SINGLE_SEND_LIMIT = parseUnits("10000", 18);
export const MAX_DAILY_SEND_LIMIT = parseUnits("50000", 18);
export const SINGLE_RECEIVE_LIMIT = parseUnits("10200", 18);
export const MAX_DAILY_RECEIVE_LIMIT = parseUnits("51000", 18);
export const ETHEREUM_ENDPOINT_ID = 101;
export const BNB_ENDPOINT_ID = 102;
export const ETHEREUM_TRUSTED_REMOTE = "0x888e317606b4c590bbad88653863e8b345702633";
export const MIN_DEST_GAS = "300000";

const vip012 = () => {
  return makeProposal([
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [ETHEREUM_ENDPOINT_ID, ETHEREUM_TRUSTED_REMOTE],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMinDstGas(uint16,uint16,uint256)",
      params: [ETHEREUM_ENDPOINT_ID, 0, MIN_DEST_GAS],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxDailyLimit(uint16,uint256)",
      params: [ETHEREUM_ENDPOINT_ID, MAX_DAILY_SEND_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxSingleTransactionLimit(uint16,uint256)",
      params: [ETHEREUM_ENDPOINT_ID, SINGLE_SEND_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxDailyReceiveLimit(uint16,uint256)",
      params: [ETHEREUM_ENDPOINT_ID, MAX_DAILY_RECEIVE_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
      params: [ETHEREUM_ENDPOINT_ID, SINGLE_RECEIVE_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setWhitelist(address,bool)",
      params: [OPBNB_TREASURY, true],
    },
    // BNB configuration
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxDailyReceiveLimit(uint16,uint256)",
      params: [BNB_ENDPOINT_ID, MAX_DAILY_RECEIVE_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
      params: [BNB_ENDPOINT_ID, SINGLE_RECEIVE_LIMIT],
    },
  ]);
};

export default vip012;
