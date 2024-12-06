import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ZKSYNC_ACM = "0x526159A92A82afE5327d37Ef446b68FD9a5cA914";
export const OPMAINNET_ACM = "0xD71b1F33f6B0259683f11174EE4Ddc2bb9cE4eD6";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const OPBNB_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const ARBITRUM_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const BSC_ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";

export const OPBNB_ACM_AGGREGATOR = "0x6dB5e303289fea2E83F7d442470210045592AD93";
export const ARBITRUM_ACM_AGGREGATOR = "0x74AFeA28456a683b8fF907699Ff77138edef00f3";
export const ETHEREUM_ACM_AGGREGATOR = "0xb78772bed6995551b64e54Cdb8e09800d86C73ee";
export const ZKSYNC_ACM_AGGREGATOR = "0x88B1452e512c8fcf83889DdCfe54dF37D561Db82";
export const OPMAINNET_ACM_AGGREGATOR = "0xbbEBaF646e7a3E4064a899e68565B1b439eFdf70";
export const BSC_ACM_AGGREGATOR = "0x8b443Ea6726E56DF4C4F62f80F0556bB9B2a7c64";

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

const vip403 = () => {
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
        params: [0],
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
        params: [0],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OPMAINNET_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OPMAINNET_ACM_AGGREGATOR],
        dstChainId: LzChainId.opmainnet,
      },

      {
        target: ETHEREUM_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ETHEREUM_ACM_AGGREGATOR],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [2],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [1],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ETHEREUM_ACM_AGGREGATOR],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: OPBNB_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OPBNB_ACM_AGGREGATOR],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNB_ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [1],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNB_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OPBNB_ACM_AGGREGATOR],
        dstChainId: LzChainId.opbnbmainnet,
      },

      {
        target: ARBITRUM_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ARBITRUM_ACM_AGGREGATOR],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [1],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [1],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ARBITRUM_ACM_AGGREGATOR],
        dstChainId: LzChainId.arbitrumone,
      },

      {
        target: BSC_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, BSC_ACM_AGGREGATOR],
      },
      {
        target: BSC_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [0],
      },
      {
        target: BSC_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, BSC_ACM_AGGREGATOR],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip403;
