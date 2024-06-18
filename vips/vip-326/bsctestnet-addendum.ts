import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { LzChainId, ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

export const OMNICHAIN_PROPOSAL_SENDER = "0xCfD34AEB46b1CB4779c945854d405E91D27A1899";
export const ARBITRUMSEPOLIA_NORMAL_TIMELOCK = "0x794BCA78E606f3a462C31e5Aba98653Efc1322F8";
export const ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER = "0xfCA70dd553b7dF6eB8F813CFEA6a9DD039448878";
export const ARBITRUMSEPOLIA_OMNICHAIN_GOVERNANCE_EXECUTOR = arbitrumsepolia.OMNICHAIN_GOVERNANCE_EXECUTOR;
export const ARBITRUMSEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";

export const MAX_DAILY_LIMIT = 100;

const ARBITRUMSEPOLIA_CHAIN_ID = LzChainId.arbitrumsepolia;

const vip326 = () => {
  const meta = {
    version: "v2",
    title: "vip326 configure OmnichainGovernanceExecutor on arbitrumsepolia",
    description: `#### Description
    This VIP will grant permission to timelocks and performs the necessary configuration of OmnichainProposalExecutor on ARBITRUMSEPOLIA chains`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [ARBITRUMSEPOLIA_CHAIN_ID, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [ARBITRUMSEPOLIA_CHAIN_ID, ARBITRUMSEPOLIA_OMNICHAIN_GOVERNANCE_EXECUTOR],
      },

      {
        target: ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", ARBITRUMSEPOLIA_NORMAL_TIMELOCK],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setReceiveVersion(uint16)",
          ARBITRUMSEPOLIA_NORMAL_TIMELOCK,
        ],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setMaxDailyReceiveLimit(uint256)",
          ARBITRUMSEPOLIA_NORMAL_TIMELOCK,
        ],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "pause()", ARBITRUMSEPOLIA_NORMAL_TIMELOCK],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setPrecrime(address)", ARBITRUMSEPOLIA_NORMAL_TIMELOCK],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setMinDstGas(uint16,uint16,uint256)",
          ARBITRUMSEPOLIA_NORMAL_TIMELOCK,
        ],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setPayloadSizeLimit(uint16,uint256)",
          ARBITRUMSEPOLIA_NORMAL_TIMELOCK,
        ],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setConfig(uint16,uint16,uint256,bytes)",
          ARBITRUMSEPOLIA_NORMAL_TIMELOCK,
        ],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", ARBITRUMSEPOLIA_NORMAL_TIMELOCK],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setTrustedRemoteAddress(uint16,bytes)",
          ARBITRUMSEPOLIA_NORMAL_TIMELOCK,
        ],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "setTimelockPendingAdmin(address,uint8)",
          ARBITRUMSEPOLIA_NORMAL_TIMELOCK,
        ],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
          "retryMessage(uint16,bytes,uint64,bytes)",
          ARBITRUMSEPOLIA_NORMAL_TIMELOCK,
        ],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", ARBITRUMSEPOLIA_NORMAL_TIMELOCK],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip326;
