import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ZKSYNC_ACM = "0x526159A92A82afE5327d37Ef446b68FD9a5cA914";
export const OPMAINNET_ACM = "0xD71b1F33f6B0259683f11174EE4Ddc2bb9cE4eD6";

export const ZKSYNC_ACM_AGGREGATOR = "0x88B1452e512c8fcf83889DdCfe54dF37D561Db82";
export const OPMAINNET_ACM_AGGREGATOR = "0xbbEBaF646e7a3E4064a899e68565B1b439eFdf70";

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
        target: ZKSYNC_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ZKSYNC_ACM_AGGREGATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNC_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [1],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNC_ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [1],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNC_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ZKSYNC_ACM_AGGREGATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },

      {
        target: OPMAINNET_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OPMAINNET_ACM_AGGREGATOR],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OPMAINNET_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [1],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OPMAINNET_ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [1],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OPMAINNET_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OPMAINNET_ACM_AGGREGATOR],
        dstChainId: LzChainId.opmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip405;
