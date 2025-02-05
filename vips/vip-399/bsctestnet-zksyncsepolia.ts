import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { zksyncsepolia } = NETWORK_ADDRESSES;
export const OMNICHAIN_PROPOSAL_SENDER = "0xCfD34AEB46b1CB4779c945854d405E91D27A1899";

export const ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER = "0xa34607D58146FA02aF5f920f29C3D916acAb0bC5";
export const ZKSYNCSEPOLIA_ACM = "0xD07f543d47c3a8997D6079958308e981AC14CD01";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ZKSYNCSEPOLIA_ACM_AGGREGATOR = "0x920Bb18c4bd4D7bc41Bf39933BCAa3D078641502";
export const MAX_DAILY_LIMIT = 100;

const vip399 = () => {
  const meta = {
    version: "v2",
    title: "VIP-399 Enable Multichain Governance on zksync sepolia",
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
        params: [LzChainId.zksyncsepolia, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.zksyncsepolia, zksyncsepolia.OMNICHAIN_GOVERNANCE_EXECUTOR],
      },
      {
        target: ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ZKSYNCSEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ZKSYNCSEPOLIA_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ZKSYNCSEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.zksyncsepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip399;
