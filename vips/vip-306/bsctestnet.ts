import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { LzChainId, ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;
export const OMNICHAIN_PROPOSAL_SENDER = "0x24b4A647B005291e97AdFf7078b912A39C905091";
const BSC_ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const BSC_FASTTRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const BSC_CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
const BSC_GUARDIAN = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";

const { sepolia, opbnbtestnet } = NETWORK_ADDRESSES;
export const SEPOLIA_NORMAL_TIMELOCK = "0x9952fc9A06788B0960Db88434Da43EDacDF1935e";
export const SEPOLIA_OMNICHAIN_EXECUTOR_OWNER = "0x0E33024CD69530126586186C282573D8BD6783ea";
export const SEPOLIA_OMNICHAIN_GOVERNANCE_EXECUTOR = sepolia.OMNICHAIN_GOVERNANCE_EXECUTOR;
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";

export const OPBNBTESTNET_NORMAL_TIMELOCK = "0xd8aA824CCBeF8A0a3eCdF87c3523D8Fd49Dc93aE";
export const OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER = "0x233eFd8aFd8C164A8d5e54f649E948F823f0a425";
export const OPBNBTESTNET_OMNICHAIN_GOVERNANCE_EXECUTOR = opbnbtestnet.OMNICHAIN_GOVERNANCE_EXECUTOR;
export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
export const MAX_DAILY_LIMIT = 100;

const SEPOLIA_CHAIN_ID = LzChainId.sepolia;
const OPBNBTESTNET_CHAIN_ID = LzChainId.opbnbtestnet;

export const vip306 = () => {
  const meta = {
    version: "v2",
    title:
      "vip306 configure OmnichainProposalSender on bsctestnet and OmnichainGovernanceExecutor on sepolia and opbnbtestnet",
    description: `#### Description
    This VIP will grant permission to timelocks and performs the necessary configuration of OmnichainProposalSender on BNB chain and OmnichainProposalExecutor on SEPOLIA & OPBNBTESTNET chains`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setTrustedRemoteAddress(uint16,bytes)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setMaxDailyLimit(uint16,uint256)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "execute(uint16,bytes,bytes,address)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OMNICHAIN_PROPOSAL_SENDER,
          "retryExecute(uint256,uint16,bytes,bytes,address,uint256)",
          bsctestnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "pause()", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "unpause()", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setSendVersion(uint16)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setConfig(uint16,uint16,uint256,bytes)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setMaxDailyLimit(uint16,uint256)", BSC_FASTTRACK_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "execute(uint16,bytes,bytes,address)", BSC_FASTTRACK_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OMNICHAIN_PROPOSAL_SENDER,
          "retryExecute(uint256,uint16,bytes,bytes,address,uint256)",
          BSC_FASTTRACK_TIMELOCK,
        ],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "pause()", BSC_FASTTRACK_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "unpause()", BSC_FASTTRACK_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setSendVersion(uint16)", BSC_FASTTRACK_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setConfig(uint16,uint16,uint256,bytes)", BSC_FASTTRACK_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setMaxDailyLimit(uint16,uint256)", BSC_CRITICAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "execute(uint16,bytes,bytes,address)", BSC_CRITICAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OMNICHAIN_PROPOSAL_SENDER,
          "retryExecute(uint256,uint16,bytes,bytes,address,uint256)",
          BSC_CRITICAL_TIMELOCK,
        ],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "pause()", BSC_CRITICAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "unpause()", BSC_CRITICAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setSendVersion(uint16)", BSC_CRITICAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setConfig(uint16,uint16,uint256,bytes)", BSC_CRITICAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "retryExecute(uint256,uint16,bytes,bytes,address,uint256)", BSC_GUARDIAN],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setMaxDailyLimit(uint16,uint256)", BSC_GUARDIAN],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "pause()", BSC_GUARDIAN],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "unpause()", BSC_GUARDIAN],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [SEPOLIA_CHAIN_ID, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [SEPOLIA_CHAIN_ID, SEPOLIA_OMNICHAIN_GOVERNANCE_EXECUTOR],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [OPBNBTESTNET_CHAIN_ID, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [OPBNBTESTNET_CHAIN_ID, OPBNBTESTNET_OMNICHAIN_GOVERNANCE_EXECUTOR],
      },

      {
        target: SEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setMaxDailyReceiveLimit(uint256)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "pause()", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setPrecrime(address)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setMinDstGas(uint16,uint16,uint256)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setPayloadSizeLimit(uint16,uint256)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setConfig(uint16,uint16,uint256,bytes)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setTrustedRemoteAddress(uint16,bytes)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setTimelockPendingAdmin(address,uint8)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "retryMessage(uint16,bytes,uint64,bytes)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", OPBNBTESTNET_NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", OPBNBTESTNET_NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER,
          "setMaxDailyReceiveLimit(uint256)",
          OPBNBTESTNET_NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "pause()", OPBNBTESTNET_NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "setPrecrime(address)", OPBNBTESTNET_NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER,
          "setMinDstGas(uint16,uint16,uint256)",
          OPBNBTESTNET_NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER,
          "setPayloadSizeLimit(uint16,uint256)",
          OPBNBTESTNET_NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER,
          "setConfig(uint16,uint16,uint256,bytes)",
          OPBNBTESTNET_NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", OPBNBTESTNET_NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER,
          "setTrustedRemoteAddress(uint16,bytes)",
          OPBNBTESTNET_NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER,
          "setTimelockPendingAdmin(address,uint8)",
          OPBNBTESTNET_NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER,
          "retryMessage(uint16,bytes,uint64,bytes)",
          OPBNBTESTNET_NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
