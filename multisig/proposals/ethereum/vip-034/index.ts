import { parseUnits } from "ethers/lib/utils";
import { makeProposal } from "src/utils";

const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
const NORMAL_TIMELOCK = "0x285960C5B22fD66A736C7136967A3eB15e93CC67";

const XVS_BRIDGE_ADMIN_PROXY = "0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96";
export const MAX_DAILY_SEND_LIMIT = parseUnits("100000", 18);
export const MAX_DAILY_RECEIVE_LIMIT = parseUnits("102000", 18);
export const SINGLE_SEND_LIMIT = parseUnits("20000", 18);
export const SINGLE_RECEIVE_LIMIT = parseUnits("20400", 18);
export const MIN_DEST_GAS = "300000";

export const ARBITRUM_ONE_CHAIN_ID = 110;
export const ARBITRUM_ONE_TRUSTED_REMOTE = "0x20cea49b5f7a6dbd78cae772ca5973ef360aa1e6";

const vip034 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "dropFailedMessage(uint16,bytes)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "dropFailedMessage(uint16,bytes,uint64)", NORMAL_TIMELOCK],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [ARBITRUM_ONE_CHAIN_ID, ARBITRUM_ONE_TRUSTED_REMOTE],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMinDstGas(uint16,uint16,uint256)",
      params: [ARBITRUM_ONE_CHAIN_ID, 0, MIN_DEST_GAS],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxDailyLimit(uint16,uint256)",
      params: [ARBITRUM_ONE_CHAIN_ID, MAX_DAILY_SEND_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxSingleTransactionLimit(uint16,uint256)",
      params: [ARBITRUM_ONE_CHAIN_ID, SINGLE_SEND_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxDailyReceiveLimit(uint16,uint256)",
      params: [ARBITRUM_ONE_CHAIN_ID, MAX_DAILY_RECEIVE_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
      params: [ARBITRUM_ONE_CHAIN_ID, SINGLE_RECEIVE_LIMIT],
    },
  ]);
};

export default vip034;
