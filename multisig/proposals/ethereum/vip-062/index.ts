import { parseUnits } from "ethers/lib/utils";
import { LzChainId } from "src/types";
import { makeProposal } from "src/utils";

const XVS_BRIDGE_ADMIN = "0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96";

export const MIN_DST_GAS = "300000";
export const SINGLE_SEND_LIMIT = parseUnits("20000", 18);
export const MAX_DAILY_SEND_LIMIT = parseUnits("100000", 18);
export const SINGLE_RECEIVE_LIMIT = parseUnits("20400", 18);
export const MAX_DAILY_RECEIVE_LIMIT = parseUnits("102000", 18);
export const OP_MAINNET_TRUSTED_REMOTE = "0xbbe46baec851355c3fc4856914c47eb6cea0b8b4";

const vip062 = () => {
  return makeProposal([
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [LzChainId.opmainnet, OP_MAINNET_TRUSTED_REMOTE],
    },
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setMinDstGas(uint16,uint16,uint256)",
      params: [LzChainId.opmainnet, 0, MIN_DST_GAS],
    },
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setMaxDailyLimit(uint16,uint256)",
      params: [LzChainId.opmainnet, MAX_DAILY_SEND_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setMaxSingleTransactionLimit(uint16,uint256)",
      params: [LzChainId.opmainnet, SINGLE_SEND_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setMaxDailyReceiveLimit(uint16,uint256)",
      params: [LzChainId.opmainnet, MAX_DAILY_RECEIVE_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
      params: [LzChainId.opmainnet, SINGLE_RECEIVE_LIMIT],
    },
  ]);
};

export default vip062;
