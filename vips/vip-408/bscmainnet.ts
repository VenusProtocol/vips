import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { basemainnet, bscmainnet } = NETWORK_ADDRESSES;
export const OMNICHAIN_PROPOSAL_SENDER = "0x36a69dE601381be7b0DcAc5D5dD058825505F8f6";

export const OMNICHAIN_EXECUTOR_OWNER = "0x8BA591f72a90fb379b9a82087b190d51b226F0a9";
export const ACM = "0x9E6CeEfDC6183e4D0DF8092A9B90cDF659687daB";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ACM_AGGREGATOR = "0xB2770DBD5146f7ee0766Dc9E3931433bb697Aa06";
export const MAX_DAILY_LIMIT = 100;
export const VENUS_STARS_TREASURY = "0xd7ca847Aa074b28A1DfeFfd3B2C3f9780cA96e1D";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDT_AMOUNT = parseUnits("19938.50", 18);

const vip408 = () => {
  const meta = {
    version: "v2",
    title: "VIP-408 Enable Multichain Governance on base mainnet",
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
        params: [LzChainId.basemainnet, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.basemainnet, basemainnet.OMNICHAIN_GOVERNANCE_EXECUTOR],
      },
      {
        target: OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [1],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_AMOUNT, VENUS_STARS_TREASURY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip408;
