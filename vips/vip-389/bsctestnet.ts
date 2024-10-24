import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { opsepolia } = NETWORK_ADDRESSES;
export const OMNICHAIN_PROPOSAL_SENDER = "0xCfD34AEB46b1CB4779c945854d405E91D27A1899";

export const OPSEPOLIA_OMNICHAIN_EXECUTOR_OWNER = "0xE92E31df479BC1031B866063F65CF71B6bAC4FC6";
export const OPSEPOLIA_ACM = "0x1652E12C8ABE2f0D84466F0fc1fA4286491B3BC1";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const OPSEPOLIA_ACM_AGGREGATOR = "0xEEeF13364fD22b8eA6932A9ed337e2638f8E0eD6";
export const MAX_DAILY_LIMIT = 100;

const vip389 = () => {
  const meta = {
    version: "v2",
    title: "VIP-389 Enable Multichain Governance on op sepolia",
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
        params: [LzChainId.opsepolia, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.opsepolia, opsepolia.OMNICHAIN_GOVERNANCE_EXECUTOR],
      },
      {
        target: OPSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: OPSEPOLIA_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OPSEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: OPSEPOLIA_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: OPSEPOLIA_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OPSEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.opsepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip389;
