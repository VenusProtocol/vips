import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { ProposalType } from "../../src/types";
import { makeProposalV2 } from "../../src/utils";

const { bsctestnet, sepolia } = NETWORK_ADDRESSES;
const SEPOLIA_CHAIN_ID = 10161;
export const vip214Testnet = () => {
  const meta = {
    version: "v2",
    title: "vip214 configure OmnichainProposalSender on bsctestnet and OmnichainGovernanceExecutor on sepolia",
    description: `#### Description
    This VIP will grant permission to timelocks and performs the necessary configuration of OmnichainProposalSender on local chain and OmnichainProposalExecutor on remote chain`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposalV2(
    [
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.OMNICHAIN_PROPOSAL_SENDER,
          "setTrustedRemoteAddress(uint16,bytes)",
          bsctestnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "setMaxDailyLimit(uint16,uint256)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "execute(uint16,bytes,bytes)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.OMNICHAIN_PROPOSAL_SENDER,
          "retryExecute(uint256,uint16,bytes,bytes,uint256)",
          bsctestnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "pause()", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "unpause()", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "setSendVersion(uint16)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.OMNICHAIN_PROPOSAL_SENDER,
          "setConfig(uint16,uint16,uint256,bytes)",
          bsctestnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.OMNICHAIN_PROPOSAL_SENDER,
          "setTrustedRemoteAddress(uint16,bytes)",
          bsctestnet.FASTTRACK_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.OMNICHAIN_PROPOSAL_SENDER,
          "setMaxDailyLimit(uint16,uint256)",
          bsctestnet.FASTTRACK_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "execute(uint16,bytes,bytes)", bsctestnet.FASTTRACK_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.OMNICHAIN_PROPOSAL_SENDER,
          "retryExecute(uint256,uint16,bytes,bytes,uint256)",
          bsctestnet.FASTTRACK_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "pause()", bsctestnet.FASTTRACK_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "unpause()", bsctestnet.FASTTRACK_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "setSendVersion(uint16)", bsctestnet.FASTTRACK_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.OMNICHAIN_PROPOSAL_SENDER,
          "setConfig(uint16,uint16,uint256,bytes)",
          bsctestnet.FASTTRACK_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.OMNICHAIN_PROPOSAL_SENDER,
          "setTrustedRemoteAddress(uint16,bytes)",
          bsctestnet.CRITICAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.OMNICHAIN_PROPOSAL_SENDER,
          "setMaxDailyLimit(uint16,uint256)",
          bsctestnet.CRITICAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "execute(uint16,bytes,bytes)", bsctestnet.CRITICAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.OMNICHAIN_PROPOSAL_SENDER,
          "retryExecute(uint256,uint16,bytes,bytes,uint256)",
          bsctestnet.CRITICAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "pause()", bsctestnet.CRITICAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "unpause()", bsctestnet.CRITICAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "setSendVersion(uint16)", bsctestnet.CRITICAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.OMNICHAIN_PROPOSAL_SENDER,
          "setConfig(uint16,uint16,uint256,bytes)",
          bsctestnet.CRITICAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [SEPOLIA_CHAIN_ID, 100],
      },
      {
        target: bsctestnet.OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [SEPOLIA_CHAIN_ID, sepolia.OMNICHAIN_GOVERNANCE_EXECUTOR],
      },
      {
        target: sepolia.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: sepolia.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: sepolia.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "forceResumeReceive(uint16,bytes)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: sepolia.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "setOracle(address)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: sepolia.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "setMaxDailyReceiveLimit(uint16,uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: sepolia.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "pause()", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: sepolia.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "pause()", sepolia.GUARDIAN],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: sepolia.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "unpause()", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: sepolia.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "unpause()", sepolia.GUARDIAN],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: sepolia.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "setPrecrime(address)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: sepolia.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "setMinDstGas(uint16,uint16,uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: sepolia.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "setPayloadSizeLimit(uint16,uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: sepolia.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "setConfig(uint16,uint16,uint256,bytes)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: sepolia.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: sepolia.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "setTrustedRemoteAddress(uint16,bytes)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
