import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { zksyncmainnet, opmainnet } = NETWORK_ADDRESSES;
export const OMNICHAIN_PROPOSAL_SENDER = "0x36a69dE601381be7b0DcAc5D5dD058825505F8f6";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

export const ZKSYNCMAINNET_OMNICHAIN_EXECUTOR_OWNER = "0xdfaed3E5d9707629Ed5c225b4fB980c064286771";
export const ZKSYNCMAINNET_ACM = "0x526159A92A82afE5327d37Ef446b68FD9a5cA914";
export const ZKSYNCMAINNET_ACM_AGGREGATOR = "0x88B1452e512c8fcf83889DdCfe54dF37D561Db82";

export const OP_MAINNET_OMNICHAIN_EXECUTOR_OWNER = "0xe6d9Eb3A07a1dc4496fc71417D7A7b9d5666BaA3";
export const OP_MAINNET_ACM = "0xD71b1F33f6B0259683f11174EE4Ddc2bb9cE4eD6";
export const OP_MAINNET_ACM_AGGREGATOR = "0xbbEBaF646e7a3E4064a899e68565B1b439eFdf70";

export const MAX_DAILY_LIMIT = 100;

const vip395 = () => {
  const meta = {
    version: "v2",
    title: "VIP-395 Enable Multichain Governance on zksync mainnet",
    description: `### Summary`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      // Omnichain sender configuration for zksync
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [LzChainId.zksyncmainnet, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.zksyncmainnet, zksyncmainnet.OMNICHAIN_GOVERNANCE_EXECUTOR],
      },

      // Remote commands for zksync

      {
        target: ZKSYNCMAINNET_OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ZKSYNCMAINNET_ACM_AGGREGATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ZKSYNCMAINNET_ACM_AGGREGATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },

      // Omnichain sender configuration for op mainnet
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [LzChainId.opmainnet, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.opmainnet, opmainnet.OMNICHAIN_GOVERNANCE_EXECUTOR],
      },

      // Remote commands for op mainnet

      {
        target: OP_MAINNET_OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OP_MAINNET_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OP_MAINNET_ACM_AGGREGATOR],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OP_MAINNET_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OP_MAINNET_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OP_MAINNET_ACM_AGGREGATOR],
        dstChainId: LzChainId.opmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip395;
