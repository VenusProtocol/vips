import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { basesepolia } = NETWORK_ADDRESSES;
export const OMNICHAIN_PROPOSAL_SENDER = "0xCfD34AEB46b1CB4779c945854d405E91D27A1899";

export const OMNICHAIN_EXECUTOR_OWNER = "0xe3fb08B8817a0c88d39A4DA4eFFD586D3326b73b";
export const ACM = "0x724138223D8F76b519fdE715f60124E7Ce51e051";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ACM_AGGREGATOR = "0xEEeF13364fD22b8eA6932A9ed337e2638f8E0eD6";
export const MAX_DAILY_LIMIT = 100;

const vip389 = () => {
  const meta = {
    version: "v2",
    title: "VIP-389 Enable Multichain Governance on op sepolia",
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
        params: [LzChainId.basesepolia, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.basesepolia, basesepolia.OMNICHAIN_GOVERNANCE_EXECUTOR],
      },
      {
        target: OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basesepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip389;