import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { zksyncmainnet } = NETWORK_ADDRESSES;
export const OMNICHAIN_PROPOSAL_SENDER = "0x36a69dE601381be7b0DcAc5D5dD058825505F8f6";

export const ZKSYNCMAINNET_OMNICHAIN_EXECUTOR_OWNER = "0xdfaed3E5d9707629Ed5c225b4fB980c064286771";
export const ZKSYNCMAINNET_ACM = "0x526159A92A82afE5327d37Ef446b68FD9a5cA914";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ZKSYNCMAINNET_ACM_AGGREGATOR = "0x88B1452e512c8fcf83889DdCfe54dF37D561Db82";
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip395;
