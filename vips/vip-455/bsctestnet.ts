import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { unichainsepolia } = NETWORK_ADDRESSES;
export const OMNICHAIN_PROPOSAL_SENDER = "0xCfD34AEB46b1CB4779c945854d405E91D27A1899";

export const OMNICHAIN_EXECUTOR_OWNER = "0xD755873C16Eaeb26993D283292d3F6C605D9BC26";
export const ACM = "0x854C064EA6b503A97980F481FA3B7279012fdeDd";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ACM_AGGREGATOR = "0xb0067C9CD83B00DE781e9b456Bf0Fec86D687Bb2";
export const MAX_DAILY_LIMIT = 100;

const vip455 = () => {
  const meta = {
    version: "v2",
    title: "VIP-455 Enable Multichain Governance on unichain sepolia",
    description: `### Summary`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [LzChainId.unichainsepolia, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.unichainsepolia, unichainsepolia.OMNICHAIN_GOVERNANCE_EXECUTOR],
      },
      {
        target: OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [1],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.unichainsepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip455;
