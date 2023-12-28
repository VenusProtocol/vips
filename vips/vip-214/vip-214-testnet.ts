import { ProposalType } from "../../src/types";
import { makeProposalV2 } from "../../src/utils";

const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const ACCESS_CONTROL_MANAGER = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const FASTTRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
const OMNICHAIN_PROPOSAL_SENDER = "0xb601a67eb6a5f3f7cc8ce184a8ee38333a1f4a5e";
const OMNICHAIN_EXECUTOR_OWNER = "0x4dFb9FF22e5cb2FA998c395E9e1BcD7c0fb25A86";
const OMNICHAIN_GOVERNANCE_EXECUTOR = "0xb0ab719aed3bc55196862337d18dc4e3ee142e30";
const SEPOLIA_NORMAL_TIMELOCK = "0x64F3843d6E83be07d06A2E2f0596cA6765b5839B";
const SEPOLIA_ACCESS_CONTROL_MANAGER = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
const SEPOLIA_CHAIN_ID = 10161;

export const vip214Testnet = () => {
  const meta = {
    version: "v2",
    title: "vip215 configure OmnichainProposalSender on bsctestnet and OmnichainGovernanceExecutor on sepolia",
    description: `#### Description

    This VIP will grant permission to timelocks and performs the necessary configuration of OmnichainProposalSender on local chain and OmnichainProposalExecutor on remote chain`,

    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposalV2(
    [
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setTrustedRemoteAddress(uint16,bytes)", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "updateValidChainId(uint16,bool)", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setMaxDailyLimit(uint16,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "execute(uint16,bytes,bytes)", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "pause()", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "unpause()", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setSendVersion(uint16)", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setConfig(uint16,uint16,uint256,bytes)", NORMAL_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setTrustedRemoteAddress(uint16,bytes)", FASTTRACK_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "updateValidChainId(uint16,bool)", FASTTRACK_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setMaxDailyLimit(uint16,uint256)", FASTTRACK_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "execute(uint16,bytes,bytes)", FASTTRACK_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "pause()", FASTTRACK_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "unpause()", FASTTRACK_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setSendVersion(uint16)", FASTTRACK_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setConfig(uint16,uint16,uint256,bytes)", FASTTRACK_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setTrustedRemoteAddress(uint16,bytes)", CRITICAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "updateValidChainId(uint16,bool)", CRITICAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setMaxDailyLimit(uint16,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "execute(uint16,bytes,bytes)", CRITICAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "pause()", CRITICAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "unpause()", CRITICAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setSendVersion(uint16)", CRITICAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setConfig(uint16,uint16,uint256,bytes)", CRITICAL_TIMELOCK],
      },

      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [SEPOLIA_CHAIN_ID, 100],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "updateValidChainId(uint16,bool)",
        params: [SEPOLIA_CHAIN_ID, "true"],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [SEPOLIA_CHAIN_ID, OMNICHAIN_GOVERNANCE_EXECUTOR],
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "forceResumeReceive(uint16,bytes)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "setOracle(address)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "setMaxDailyReceiveLimit(uint16,uint256)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "pause()", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "unpause()", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "setPrecrime(address)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "setMinDstGas(uint16,uint16,uint256)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "setPayloadSizeLimit(uint16,uint256)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "setConfig(uint16,uint16,uint256,bytes)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "setTrustedRemoteAddress(uint16,bytes)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
