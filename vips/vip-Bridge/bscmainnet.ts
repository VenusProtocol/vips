import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const XVS_BRIDGE_ADMIN = "0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21";

export const MIN_DST_GAS = "300000";
export const SINGLE_SEND_LIMIT = parseUnits("10000", 18);
export const MAX_DAILY_SEND_LIMIT = parseUnits("50000", 18);
export const SINGLE_RECEIVE_LIMIT = parseUnits("10200", 18);
export const MAX_DAILY_RECEIVE_LIMIT = parseUnits("51000", 18);
export const ARBITRUM_ONE_CHAIN_ID = 110;
const ARBITRUM_ONE_TRUSTED_REMOTE = "0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6";

const vipBridge = () => {
  const meta = {
    version: "v2",
    title: "VIP-Bridge XVS bridge Bnb Mainnet -> Arbitrum One",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [ARBITRUM_ONE_CHAIN_ID, ARBITRUM_ONE_TRUSTED_REMOTE],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMinDstGas(uint16,uint16,uint256)",
        params: [ARBITRUM_ONE_CHAIN_ID, 0, MIN_DST_GAS],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [ARBITRUM_ONE_CHAIN_ID, MAX_DAILY_SEND_LIMIT],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxSingleTransactionLimit(uint16,uint256)",
        params: [ARBITRUM_ONE_CHAIN_ID, SINGLE_SEND_LIMIT],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxDailyReceiveLimit(uint16,uint256)",
        params: [ARBITRUM_ONE_CHAIN_ID, MAX_DAILY_RECEIVE_LIMIT],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
        params: [ARBITRUM_ONE_CHAIN_ID, SINGLE_RECEIVE_LIMIT],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vipBridge;
