import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { berachainbartio } = NETWORK_ADDRESSES;

export const OMNICHAIN_PROPOSAL_SENDER = "0xCfD34AEB46b1CB4779c945854d405E91D27A1899";
export const MAX_DAILY_LIMIT = 100;
export const OMNICHAIN_EXECUTOR_OWNER = "0x94ba324b639F2C4617834dFcF45EA23188a17124";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ACM_AGGREGATOR = "0x1ba10ca9a744131aD8428D719767816A693c3b71";
export const ACM = "0xEf368e4c1f9ACC9241E66CD67531FEB195fF7536";
export const TREASURY = "0xF2f878a9cF9a43409F673CfA17B4F1E9D8169211";
export const BOUND_VALIDATOR = "0x24C815d92f5F084E3679ceD7c51c2033784AaC06";

const vip452 = () => {
  const meta = {
    version: "v2",
    title: "VIP-452",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [LzChainId.berachainbartio, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.berachainbartio, berachainbartio.OMNICHAIN_GOVERNANCE_EXECUTOR],
      },
      {
        target: OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [3],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: TREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: berachainbartio.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: berachainbartio.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: berachainbartio.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip452;
