import { parseUnits } from "ethers/lib/utils";
import { LzChainId } from "src/types";
import { makeProposal } from "src/utils";

const XVS_BRIDGE_ADMIN = "0x2471043F05Cc41A6051dd6714DC967C7BfC8F902";
export const SINGLE_SEND_LIMIT = parseUnits("20000", 18);
export const MAX_DAILY_SEND_LIMIT = parseUnits("100000", 18);
export const SINGLE_RECEIVE_LIMIT = parseUnits("20400", 18);
export const MAX_DAILY_RECEIVE_LIMIT = parseUnits("102000", 18);

const vip012 = () => {
  return makeProposal([
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setMaxDailyLimit(uint16,uint256)",
      params: [LzChainId.bscmainnet, MAX_DAILY_SEND_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setMaxSingleTransactionLimit(uint16,uint256)",
      params: [LzChainId.bscmainnet, SINGLE_SEND_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setMaxDailyReceiveLimit(uint16,uint256)",
      params: [LzChainId.bscmainnet, MAX_DAILY_RECEIVE_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
      params: [LzChainId.bscmainnet, SINGLE_RECEIVE_LIMIT],
    },
  ]);
};
export default vip012;
