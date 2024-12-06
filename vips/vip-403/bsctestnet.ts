import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ZKSYNCSEPOLIA_ACM = "0xD07f543d47c3a8997D6079958308e981AC14CD01";
export const OPSEPOLIA_ACM = "0x1652E12C8ABE2f0D84466F0fc1fA4286491B3BC1";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
export const BSCTESTNET_ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";

export const ZKSYNCSEPOLIA_ACM_AGGREGATOR = "0x920Bb18c4bd4D7bc41Bf39933BCAa3D078641502";
export const OPSEPOLIA_ACM_AGGREGATOR = "0xEEeF13364fD22b8eA6932A9ed337e2638f8E0eD6";
export const ARBITRUMSEPOLIA_ACM_AGGREGATOR = "0x4fCbfE445396f31005b3Fd2F6DE2A986d6E2dCB5";
export const OPBNBTESTNET_ACM_AGGREGATOR = "0xbDd501dB1B0D6aab299CE69ef5B86C8578947AD0";
export const SEPOLIA_ACM_AGGREGATOR = "0x0653830c55035d678e1287b2d4550519fd263d0e";
export const BSCTESTNET_ACM_AGGREGATOR = "0xB59523628D92f914ec6624Be4281397E8aFD71EF";

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

const vip403 = () => {
  const meta = {
    version: "v2",
    title: "VIP-403 Multichain Governance",
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

      {
        target: SEPOLIA_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, SEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [5],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [3],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, SEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OPBNBTESTNET_ACM_AGGREGATOR],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [3],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OPBNBTESTNET_ACM_AGGREGATOR],
        dstChainId: LzChainId.opbnbtestnet,
      },

      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ARBITRUMSEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUMSEPOLIA_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [4],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUMSEPOLIA_ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [4],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ARBITRUMSEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.arbitrumsepolia,
      },

      {
        target: BSCTESTNET_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, BSCTESTNET_ACM_AGGREGATOR],
      },
      {
        target: BSCTESTNET_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [0],
      },
      {
        target: BSCTESTNET_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, BSCTESTNET_ACM_AGGREGATOR],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip403;
