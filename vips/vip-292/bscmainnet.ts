import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const XVS_BRIDGE_ADMIN_PROXY = "0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21";
export const BNB_TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const SINGLE_RECEIVE_LIMIT_OP_BNB = parseUnits("10200", 18);
export const MAX_DAILY_RECEIVE_LIMIT_OP_BNB = parseUnits("51000", 18);
export const SINGLE_RECEIVE_LIMIT_ETHEREUM = parseUnits("102000", 18);
export const MAX_DAILY_RECEIVE_LIMIT_ETHEREUM = parseUnits("1020000", 18);
export const OP_BNB_ENDPOINT_ID = 202;
export const ETHEREUM_ENDPOINT_ID = 101;

const vip292 = () => {
  const meta = {
    version: "v2",
    title: "VIP-292",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "setWhitelist(address,bool)",
        params: [BNB_TREASURY, true],
      },

      // opBNB Configuration
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "setMaxDailyReceiveLimit(uint16,uint256)",
        params: [OP_BNB_ENDPOINT_ID, MAX_DAILY_RECEIVE_LIMIT_OP_BNB],
      },
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
        params: [OP_BNB_ENDPOINT_ID, SINGLE_RECEIVE_LIMIT_OP_BNB],
      },

      // Ethereum configuration
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "setMaxDailyReceiveLimit(uint16,uint256)",
        params: [ETHEREUM_ENDPOINT_ID, MAX_DAILY_RECEIVE_LIMIT_ETHEREUM],
      },
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
        params: [ETHEREUM_ENDPOINT_ID, SINGLE_RECEIVE_LIMIT_ETHEREUM],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip292;
