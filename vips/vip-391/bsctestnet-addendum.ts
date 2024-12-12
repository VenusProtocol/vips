import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";

export const OPBNBTESTNET_ACM_AGGREGATOR = "0xbDd501dB1B0D6aab299CE69ef5B86C8578947AD0";
export const SEPOLIA_ACM_AGGREGATOR = "0x0653830c55035d678e1287b2d4550519fd263d0e";

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

const vip391 = () => {
  const meta = {
    version: "v2",
    title: "VIP-391: Fix Sepolia and OPBNBTestnet permissions",
    description: `### Fix chainlink permissions for sepolia and bound validator permissions for opbnbtestnet`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: OPBNBTESTNET_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OPBNBTESTNET_ACM_AGGREGATOR],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
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
        target: SEPOLIA_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, SEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [4],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, SEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.sepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip391;