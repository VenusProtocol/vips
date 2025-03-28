import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const BASE_SEPOLIA_ACM = "0x724138223D8F76b519fdE715f60124E7Ce51e051";
export const OPBNB_TESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
export const OP_SEPOLIA_ACM = "0x1652E12C8ABE2f0D84466F0fc1fA4286491B3BC1";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const UNICHAIN_SEPOLIA_ACM = "0x854C064EA6b503A97980F481FA3B7279012fdeDd";
export const ZKSYNC_SEPOLIA_ACM = "0xD07f543d47c3a8997D6079958308e981AC14CD01";

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const { arbitrumsepolia, basesepolia, opbnbtestnet, opsepolia, sepolia, unichainsepolia, zksyncsepolia } =
  NETWORK_ADDRESSES;

export const vip470 = () => {
  const meta = {
    version: "v2",
    title: "VIP-470",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, arbitrumsepolia.GUARDIAN],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: BASE_SEPOLIA_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, basesepolia.GUARDIAN],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: OPBNB_TESTNET_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, opbnbtestnet.GUARDIAN],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OP_SEPOLIA_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, opsepolia.GUARDIAN],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: UNICHAIN_SEPOLIA_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, unichainsepolia.GUARDIAN],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: ZKSYNC_SEPOLIA_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, zksyncsepolia.GUARDIAN],
        dstChainId: LzChainId.zksyncsepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip470;
