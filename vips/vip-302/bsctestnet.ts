import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { ProposalType } from "../../src/types";
import { makeProposalV2 } from "../../src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;
export const OMNICHAIN_PROPOSAL_SENDER = "0x24b4A647B005291e97AdFf7078b912A39C905091";
const BSC_ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const BSC_FASTTRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const BSC_CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";

export const SEPOLIA_NORMAL_TIMELOCK = "0x9952fc9A06788B0960Db88434Da43EDacDF1935e";
export const SEPOLIA_OMNICHAIN_EXECUTOR_OWNER = "0x0E33024CD69530126586186C282573D8BD6783ea";
export const SEPOLIA_OMNICHAIN_GOVERNANCE_EXECUTOR = "0x92c6f22d9059d50bac82cd9eb1aa72142a76339a";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const SEPOLIA_MAX_DAILY_LIMIT = 100;
const SEPOLIA_CHAIN_ID = 10161;

export const vip302 = () => {
  const meta = {
    version: "v2",
    title: "vip302 configure OmnichainProposalSender on bsctestnet and OmnichainGovernanceExecutor on sepolia",
    description: `#### Description
    This VIP will grant permission to timelocks and performs the necessary configuration of OmnichainProposalSender on local chain and OmnichainProposalExecutor on remote chain`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposalV2(
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
        params: [OMNICHAIN_PROPOSAL_SENDER, "setTrustedRemoteAddress(uint16,bytes)", BSC_FASTTRACK_TIMELOCK],
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
        params: [OMNICHAIN_PROPOSAL_SENDER, "setTrustedRemoteAddress(uint16,bytes)", BSC_CRITICAL_TIMELOCK],
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
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [SEPOLIA_CHAIN_ID, SEPOLIA_MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [SEPOLIA_CHAIN_ID, SEPOLIA_OMNICHAIN_GOVERNANCE_EXECUTOR],
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};
