import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ACM = "0x724138223D8F76b519fdE715f60124E7Ce51e051";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ACM_AGGREGATOR = "0xd82A217713F6c61f3ed4199cdEEDfbB80e5E4562";

const vip389 = () => {
  const meta = {
    version: "v2",
    title: "VIP-389 Enable Multichain Governance on base sepolia",
    description: `### Summary`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [3],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [2],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.basesepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip389;
