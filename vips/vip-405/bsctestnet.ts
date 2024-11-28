import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ZKSYNCSEPOLIA_ACM = "0xD07f543d47c3a8997D6079958308e981AC14CD01";
export const OPSEPOLIA_ACM = "0x1652E12C8ABE2f0D84466F0fc1fA4286491B3BC1";

export const ZKSYNCSEPOLIA_ACM_AGGREGATOR = "0x920Bb18c4bd4D7bc41Bf39933BCAa3D078641502";
export const OPSEPOLIA_ACM_AGGREGATOR = "0xEEeF13364fD22b8eA6932A9ed337e2638f8E0eD6";

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

const vip405 = () => {
  const meta = {
    version: "v2",
    title: "VIP-405 Multichain Governance - Permissions on Optimism and Zksync",
    description: `#### Summary`,

    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ZKSYNCSEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ZKSYNCSEPOLIA_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [1],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ZKSYNCSEPOLIA_ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ZKSYNCSEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.zksyncsepolia,
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
        params: [1],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: OPSEPOLIA_ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
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
export default vip405;
