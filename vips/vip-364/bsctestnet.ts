import { parseUnits } from "ethers/lib/utils";

import { LzChainId, ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const XVS_BRIDGE_ADMIN = "0xB164Cb262328Ca44a806bA9e3d4094931E658513";

export const MIN_DST_GAS = "300000";
export const SINGLE_SEND_LIMIT = parseUnits("10000", 18);
export const MAX_DAILY_SEND_LIMIT = parseUnits("50000", 18);
export const SINGLE_RECEIVE_LIMIT = parseUnits("10200", 18);
export const MAX_DAILY_RECEIVE_LIMIT = parseUnits("51000", 18);
export const OP_SEPOLIA_TRUSTED_REMOTE = "0x79a36dc9a43d05db4747c59c02f48ed500e47df1";

const vip364 = () => {
  const meta = {
    version: "v2",
    title: "VIP-364 Enable BSC -> OP sepolia bridge",
    description: `#### Summary Enable BSC -> ZKSYNC bridge`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.opsepolia, OP_SEPOLIA_TRUSTED_REMOTE],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMinDstGas(uint16,uint16,uint256)",
        params: [LzChainId.opsepolia, 0, MIN_DST_GAS],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [LzChainId.opsepolia, MAX_DAILY_SEND_LIMIT],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxSingleTransactionLimit(uint16,uint256)",
        params: [LzChainId.opsepolia, SINGLE_SEND_LIMIT],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxDailyReceiveLimit(uint16,uint256)",
        params: [LzChainId.opsepolia, MAX_DAILY_RECEIVE_LIMIT],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
        params: [LzChainId.opsepolia, SINGLE_RECEIVE_LIMIT],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip364;
