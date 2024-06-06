import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { LzChainId, ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;
export const OMNICHAIN_PROPOSAL_SENDER = "0xB61BA63441bE8F6cFbcA4510c78F2265aDBb05Ee";
const BSC_ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
const BSC_FASTTRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const BSC_CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const BSC_GUARDIAN = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";

const { ethereum, opbnbmainnet } = NETWORK_ADDRESSES;
export const ETHEREUM_NORMAL_TIMELOCK = "0x58427ae12C559a5376918b11ce0C88564452ecE6";
export const ETHEREUM_OMNICHAIN_EXECUTOR_OWNER = "0xE837D75Acc0eB41D97fCe2f2613d41d6D6590855";
export const ETHEREUM_OMNICHAIN_GOVERNANCE_EXECUTOR = ethereum.OMNICHAIN_GOVERNANCE_EXECUTOR;
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";

export const OPBNBMAINNET_NORMAL_TIMELOCK = "0x935a741d81e5F3decC93081f1Db1F37fd6283464";
export const OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER = "0xF6606cB41EbeF4D3968Be7752e0820a0cdCeF413";
export const OPBNBMAINNET_OMNICHAIN_GOVERNANCE_EXECUTOR = opbnbmainnet.OMNICHAIN_GOVERNANCE_EXECUTOR;
export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const MAX_DAILY_LIMIT = 100;

const ETHEREUM_CHAIN_ID = LzChainId.ethereum;
const OPBNBMAINNET_CHAIN_ID = LzChainId.opbnbmainnet;

const vip322 = () => {
  const meta = {
    version: "v2",
    title:
      "vip322 configure OmnichainProposalSender on bscmainnet and OmnichainGovernanceExecutor on ethereum and opbnbmainnet",
    description: `#### Description
    This VIP will grant permission to timelocks and performs the necessary configuration of OmnichainProposalSender on BNB chain and OmnichainProposalExecutor on ETHEREUM & OPBNBMINNET chains`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setTrustedRemoteAddress(uint16,bytes)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setMaxDailyLimit(uint16,uint256)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "execute(uint16,bytes,bytes,address)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OMNICHAIN_PROPOSAL_SENDER,
          "retryExecute(uint256,uint16,bytes,bytes,address,uint256)",
          bscmainnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "pause()", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "unpause()", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setSendVersion(uint16)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setConfig(uint16,uint16,uint256,bytes)", bscmainnet.NORMAL_TIMELOCK],
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
        params: [ETHEREUM_CHAIN_ID, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [ETHEREUM_CHAIN_ID, ETHEREUM_OMNICHAIN_GOVERNANCE_EXECUTOR],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [OPBNBMAINNET_CHAIN_ID, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [OPBNBMAINNET_CHAIN_ID, OPBNBMAINNET_OMNICHAIN_GOVERNANCE_EXECUTOR],
      },

      {
        target: ETHEREUM_OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setMaxDailyReceiveLimit(uint256)", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "pause()", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setPrecrime(address)", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setMinDstGas(uint16,uint16,uint256)", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setPayloadSizeLimit(uint16,uint256)", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setConfig(uint16,uint16,uint256,bytes)", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setTrustedRemoteAddress(uint16,bytes)", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setTimelockPendingAdmin(address,uint8)", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ETHEREUM_OMNICHAIN_EXECUTOR_OWNER,
          "retryMessage(uint16,bytes,uint64,bytes)",
          ETHEREUM_NORMAL_TIMELOCK,
        ],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", OPBNBMAINNET_NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", OPBNBMAINNET_NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "setMaxDailyReceiveLimit(uint256)",
          OPBNBMAINNET_NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "pause()", OPBNBMAINNET_NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setPrecrime(address)", OPBNBMAINNET_NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "setMinDstGas(uint16,uint16,uint256)",
          OPBNBMAINNET_NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "setPayloadSizeLimit(uint16,uint256)",
          OPBNBMAINNET_NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "setConfig(uint16,uint16,uint256,bytes)",
          OPBNBMAINNET_NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", OPBNBMAINNET_NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "setTrustedRemoteAddress(uint16,bytes)",
          OPBNBMAINNET_NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "setTimelockPendingAdmin(address,uint8)",
          OPBNBMAINNET_NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "retryMessage(uint16,bytes,uint64,bytes)",
          OPBNBMAINNET_NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", OPBNBMAINNET_NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip322;
