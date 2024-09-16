import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { zksyncsepolia } = NETWORK_ADDRESSES;
export const OMNICHAIN_PROPOSAL_SENDER = "0xCfD34AEB46b1CB4779c945854d405E91D27A1899";

export const ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER = "0xa34607D58146FA02aF5f920f29C3D916acAb0bC5";
export const ZKSYNCSEPOLIA_ACM = "0xD07f543d47c3a8997D6079958308e981AC14CD01";

export const MAX_DAILY_LIMIT = 100;

const ZKSYNCSEPOLIA_CHAIN_ID = LzChainId.zksyncsepolia;

const vip365 = () => {
  const meta = {
    version: "v2",
    title: "VIP-365 Enable Multichain Governance on zksync sepolia (1/2)",
    description: `### Summary

`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [ZKSYNCSEPOLIA_CHAIN_ID, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [ZKSYNCSEPOLIA_CHAIN_ID, zksyncsepolia.OMNICHAIN_GOVERNANCE_EXECUTOR],
      },

      {
        target: ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setSrcChainId(uint16)", zksyncsepolia.NORMAL_TIMELOCK],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "transferBridgeOwnership(address)",
          zksyncsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },

      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", zksyncsepolia.NORMAL_TIMELOCK],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", zksyncsepolia.NORMAL_TIMELOCK],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setMaxDailyReceiveLimit(uint256)",
          zksyncsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "pause()", zksyncsepolia.NORMAL_TIMELOCK],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setPrecrime(address)", zksyncsepolia.NORMAL_TIMELOCK],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setMinDstGas(uint16,uint16,uint256)",
          zksyncsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setPayloadSizeLimit(uint16,uint256)",
          zksyncsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setConfig(uint16,uint16,uint256,bytes)",
          zksyncsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", zksyncsepolia.NORMAL_TIMELOCK],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setTrustedRemoteAddress(uint16,bytes)",
          zksyncsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setTimelockPendingAdmin(address,uint8)",
          zksyncsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "retryMessage(uint16,bytes,uint64,bytes)",
          zksyncsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
      {
        target: ZKSYNCSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZKSYNCSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", zksyncsepolia.NORMAL_TIMELOCK],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip365;
