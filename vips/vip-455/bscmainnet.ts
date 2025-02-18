import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { unichainmainnet } = NETWORK_ADDRESSES;
export const OMNICHAIN_PROPOSAL_SENDER = "0x36a69dE601381be7b0DcAc5D5dD058825505F8f6";

export const OMNICHAIN_EXECUTOR_OWNER = "0x6E78a0d96257F8F2615d72F3ee48cb6fb2c970bd";
export const ACM = "0x1f12014c497a9d905155eB9BfDD9FaC6885e61d0";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ACM_AGGREGATOR = "0x904D11b00bdB2740d16176cc00DE139d0d626115";
export const MAX_DAILY_LIMIT = 100;

const vip455 = () => {
  const meta = {
    version: "v2",
    title: "VIP-455 Enable Multichain Governance on unichain mainnet",
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
        params: [LzChainId.unichainmainnet, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.unichainmainnet, unichainmainnet.OMNICHAIN_GOVERNANCE_EXECUTOR],
      },
      {
        target: OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [2],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [3],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [1],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.unichainmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip455;
