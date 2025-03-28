import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ARBITRUM_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const BASE_ACM = "0x9E6CeEfDC6183e4D0DF8092A9B90cDF659687daB";
export const OPBNB_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const OP_ACM = "0xD71b1F33f6B0259683f11174EE4Ddc2bb9cE4eD6";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const UNICHAIN_ACM = "0x1f12014c497a9d905155eB9BfDD9FaC6885e61d0";
export const ZKSYNC_ACM = "0x526159A92A82afE5327d37Ef446b68FD9a5cA914";

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const { arbitrumone, basemainnet, opbnbmainnet, opmainnet, ethereum, unichainmainnet, zksyncmainnet } =
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
        target: ARBITRUM_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: BASE_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, basemainnet.GUARDIAN],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: OPBNB_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, opbnbmainnet.GUARDIAN],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OP_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, opmainnet.GUARDIAN],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: UNICHAIN_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, unichainmainnet.GUARDIAN],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ZKSYNC_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, zksyncmainnet.GUARDIAN],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip470;
