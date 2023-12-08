import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { ProposalType } from "../../src/types";
import { makeProposalV2 } from "../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;
const { bsctestnet } = NETWORK_ADDRESSES;

const sepoliaChainId = 10161;

export const vip217Testnet = () => {
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
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.OMNICHAIN_PROPOSAL_SENDER,
          "setTrustedRemoteAddress(uint16,bytes)",
          bsctestnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "updateValidChainId(uint16,bool)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "setMaxDailyLimit(uint16,uint256)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "execute(uint16,bytes,bytes)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "pause()", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "unpause()", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "setSendVersion(uint16)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.OMNICHAIN_PROPOSAL_SENDER,
          "setConfig(uint16,uint16,uint256,bytes)",
          bsctestnet.NORMAL_TIMELOCK,
        ],
      },

      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.OMNICHAIN_PROPOSAL_SENDER,
          "setTrustedRemoteAddress(uint16,bytes)",
          bsctestnet.FASTTRACK_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.OMNICHAIN_PROPOSAL_SENDER,
          "updateValidChainId(uint16,bool)",
          bsctestnet.FASTTRACK_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.OMNICHAIN_PROPOSAL_SENDER,
          "setMaxDailyLimit(uint16,uint256)",
          bsctestnet.FASTTRACK_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "execute(uint16,bytes,bytes)", bsctestnet.FASTTRACK_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "pause()", bsctestnet.FASTTRACK_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "unpause()", bsctestnet.FASTTRACK_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "setSendVersion(uint16)", bsctestnet.FASTTRACK_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.OMNICHAIN_PROPOSAL_SENDER,
          "setConfig(uint16,uint16,uint256,bytes)",
          bsctestnet.FASTTRACK_TIMELOCK,
        ],
      },

      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.OMNICHAIN_PROPOSAL_SENDER,
          "setTrustedRemoteAddress(uint16,bytes)",
          bsctestnet.CRITICAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "updateValidChainId(uint16,bool)", bsctestnet.CRITICAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.OMNICHAIN_PROPOSAL_SENDER,
          "setMaxDailyLimit(uint16,uint256)",
          bsctestnet.CRITICAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "execute(uint16,bytes,bytes)", bsctestnet.CRITICAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "pause()", bsctestnet.CRITICAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "unpause()", bsctestnet.CRITICAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.OMNICHAIN_PROPOSAL_SENDER, "setSendVersion(uint16)", bsctestnet.CRITICAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
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
        params: [sepoliaChainId, 100],
      },
      {
        target: bsctestnet.OMNICHAIN_PROPOSAL_SENDER,
        signature: "updateValidChainId(uint16,bool)",
        params: [sepoliaChainId, "true"],
      },
      {
        target: bsctestnet.OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [sepoliaChainId, sepolia.OMNICHAIN_GOVERNANCE_EXECUTOR],
      },
      {
        target: sepolia.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", sepolia.NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: sepolia.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", sepolia.NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: sepolia.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "forceResumeReceive(uint16,bytes)", sepolia.NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: sepolia.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "setOracle(address)", sepolia.NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: sepolia.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "setMaxDailyReceiveLimit(uint16,uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: sepolia.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "pause()", sepolia.NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: sepolia.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "unpause()", sepolia.NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: sepolia.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "setPrecrime(address)", sepolia.NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: sepolia.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "setMinDstGas(uint16,uint16,uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: sepolia.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "setPayloadSizeLimit(uint16,uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: sepolia.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "setConfig(uint16,uint16,uint256,bytes)", sepolia.NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: sepolia.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", sepolia.NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: sepolia.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "setTrustedRemoteAddress(uint16,bytes)", sepolia.NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
