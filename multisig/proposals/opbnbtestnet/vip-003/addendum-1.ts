import { parseUnits } from "ethers/lib/utils";
import { makeProposal } from "src/utils";

const XVS_BRIDGE_ADMIN = "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff";
const XVS_BRIDGE = "0xA03205bC635A772E533E7BE36b5701E331a70ea3";
const XVS = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";

export const SINGLE_SEND_LIMIT = "10000000000000000000000";
export const MAX_DAILY_SEND_LIMIT = "50000000000000000000000";
export const SINGLE_RECEIVE_LIMIT = "10000000000000000000000";
export const MAX_DAILY_RECEIVE_LIMIT = "50000000000000000000000";
export const SRC_CHAIN_ID = 10102;
export const XVS_MINT_CAP = parseUnits("500000", 18);

const vip003 = () => {
  return makeProposal([
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setMaxDailyLimit(uint16,uint256)",
      params: [SRC_CHAIN_ID, MAX_DAILY_SEND_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setMaxSingleTransactionLimit(uint16,uint256)",
      params: [SRC_CHAIN_ID, SINGLE_SEND_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setMaxDailyReceiveLimit(uint16,uint256)",
      params: [SRC_CHAIN_ID, MAX_DAILY_RECEIVE_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
      params: [SRC_CHAIN_ID, SINGLE_RECEIVE_LIMIT],
    },
    {
      target: XVS,
      signature: "setMintCap(address,uint256)",
      params: [XVS_BRIDGE, XVS_MINT_CAP],
    },
  ]);
};

export default vip003;
