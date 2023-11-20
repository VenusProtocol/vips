import { NETWORK_ADDRESSES } from "../src/networkAddresses";
import { ProposalType } from "../src/types";
import { makeProposalV2 } from "../src/utils";

const { sepolia } = NETWORK_ADDRESSES;
const { bsctestnet } = NETWORK_ADDRESSES;
const { arbitrum_goerli } = NETWORK_ADDRESSES;

const sepoliaChainId = 10161;
const arbitrumChainId = 10143;

export const executor_configuration = async () => {
  const meta = {
    version: "v2",
    title:
      "executor_configuration give access permission and configuration of cross chain governance executor on remote chain",
    description: `#### Description

    This VIP will grant permission to timelocks and performs the necessary configuration of OmnichainProposalExecutor on remote chain`,

    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return await makeProposalV2(
    [
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          sepolia.OMNICHAIN_PROPOSAL_SENDER,
          "setTrustedRemoteAddress(uint16,bytes)",
          bsctestnet.NORMAL_TIMELOCK,
        ],
      },

      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_PROPOSAL_SENDER, "updateValidChainId(uint16,bool)", bsctestnet.NORMAL_TIMELOCK],
      },

      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_PROPOSAL_SENDER, "setMaxDailyLimit(uint16,uint256)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.OMNICHAIN_PROPOSAL_SENDER, "execute(uint16,bytes,bytes)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: sepolia.OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [sepoliaChainId, 100],
      },
      {
        target: sepolia.OMNICHAIN_PROPOSAL_SENDER,
        signature: "updateValidChainId(uint16,bool)",
        params: [sepoliaChainId, "true"],
      },
      {
        target: sepolia.OMNICHAIN_PROPOSAL_SENDER,
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
        params: [sepolia.OMNICHAIN_EXECUTOR_OWNER, "setTrustedRemoteAddress(uint16,bytes)", sepolia.NORMAL_TIMELOCK],
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
        target: sepolia.OMNICHAIN_EXECUTOR_OWNER,
        signature: "addTimelocks(address[])",
        params: [[sepolia.NORMAL_TIMELOCK, sepolia.FASTTRACK_TIMELOCK, sepolia.CRITICAL_TIMELOCK]],
        dstChainId: sepoliaChainId,
      },
      {
        target: sepolia.OMNICHAIN_EXECUTOR_OWNER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [10102, sepolia.OMNICHAIN_PROPOSAL_SENDER],
        dstChainId: sepoliaChainId,
      },

      {
        target: arbitrum_goerli.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrum_goerli.OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", arbitrum_goerli.NORMAL_TIMELOCK],
        dstChainId: arbitrumChainId,
      },
      {
        target: arbitrum_goerli.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          arbitrum_goerli.OMNICHAIN_EXECUTOR_OWNER,
          "setReceiveVersion(uint16)",
          arbitrum_goerli.NORMAL_TIMELOCK,
        ],
        dstChainId: arbitrumChainId,
      },
      {
        target: arbitrum_goerli.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          arbitrum_goerli.OMNICHAIN_EXECUTOR_OWNER,
          "forceResumeReceive(uint16,bytes)",
          arbitrum_goerli.NORMAL_TIMELOCK,
        ],
        dstChainId: arbitrumChainId,
      },
      {
        target: arbitrum_goerli.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrum_goerli.OMNICHAIN_EXECUTOR_OWNER, "setOracle(address)", arbitrum_goerli.NORMAL_TIMELOCK],
        dstChainId: arbitrumChainId,
      },
      {
        target: arbitrum_goerli.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          arbitrum_goerli.OMNICHAIN_EXECUTOR_OWNER,
          "setMaxDailyReceiveLimit(uint16,uint256)",
          arbitrum_goerli.NORMAL_TIMELOCK,
        ],
        dstChainId: arbitrumChainId,
      },
      {
        target: arbitrum_goerli.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrum_goerli.OMNICHAIN_EXECUTOR_OWNER, "pause()", arbitrum_goerli.NORMAL_TIMELOCK],
        dstChainId: arbitrumChainId,
      },
      {
        target: arbitrum_goerli.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrum_goerli.OMNICHAIN_EXECUTOR_OWNER, "unpause()", arbitrum_goerli.NORMAL_TIMELOCK],
        dstChainId: arbitrumChainId,
      },
      {
        target: arbitrum_goerli.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          arbitrum_goerli.OMNICHAIN_EXECUTOR_OWNER,
          "setTrustedRemoteAddress(uint16,bytes)",
          arbitrum_goerli.NORMAL_TIMELOCK,
        ],
        dstChainId: arbitrumChainId,
      },
      {
        target: arbitrum_goerli.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrum_goerli.OMNICHAIN_EXECUTOR_OWNER, "setPrecrime(address)", arbitrum_goerli.NORMAL_TIMELOCK],
        dstChainId: arbitrumChainId,
      },
      {
        target: arbitrum_goerli.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          arbitrum_goerli.OMNICHAIN_EXECUTOR_OWNER,
          "setMinDstGas(uint16,uint16,uint256)",
          arbitrum_goerli.NORMAL_TIMELOCK,
        ],
        dstChainId: arbitrumChainId,
      },
      {
        target: arbitrum_goerli.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          arbitrum_goerli.OMNICHAIN_EXECUTOR_OWNER,
          "setPayloadSizeLimit(uint16,uint256)",
          arbitrum_goerli.NORMAL_TIMELOCK,
        ],
        dstChainId: arbitrumChainId,
      },
      {
        target: arbitrum_goerli.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          arbitrum_goerli.OMNICHAIN_EXECUTOR_OWNER,
          "setConfig(uint16,uint16,uint256,bytes)",
          arbitrum_goerli.NORMAL_TIMELOCK,
        ],
        dstChainId: arbitrumChainId,
      },
      {
        target: arbitrum_goerli.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrum_goerli.OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", arbitrum_goerli.NORMAL_TIMELOCK],
        dstChainId: arbitrumChainId,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
