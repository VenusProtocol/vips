import { parseUnits } from "ethers/lib/utils";
import { LzChainId } from "src/types";
import { makeProposal } from "src/utils";

const XVS_BRIDGE_ADMIN = "0xf5d81C6F7DAA3F97A6265C8441f92eFda22Ad784";
export const SINGLE_SEND_LIMIT = parseUnits("20000", 18);
export const MAX_DAILY_SEND_LIMIT = parseUnits("100000", 18);
export const SINGLE_RECEIVE_LIMIT = parseUnits("20400", 18);
export const MAX_DAILY_RECEIVE_LIMIT = parseUnits("102000", 18);

const vip015 = () => {
  return makeProposal([
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setMaxDailyLimit(uint16,uint256)",
      params: [LzChainId.zksyncmainnet, MAX_DAILY_SEND_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setMaxSingleTransactionLimit(uint16,uint256)",
      params: [LzChainId.zksyncmainnet, SINGLE_SEND_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setMaxDailyReceiveLimit(uint16,uint256)",
      params: [LzChainId.zksyncmainnet, MAX_DAILY_RECEIVE_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
      params: [LzChainId.zksyncmainnet, SINGLE_RECEIVE_LIMIT],
    },
  ]);
};
export default vip015;
