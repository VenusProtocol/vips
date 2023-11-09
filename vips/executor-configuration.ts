import { ProposalType } from "../src/types";
import { makeProposalV2 } from "../src/utils";

const REMOTE_NORMAL_TIMELOCK = "0x3961EDAfe1d1d3AB446f1b2fc10bde476058448B";
const REMOTE_ACCESS_CONTROL_MANAGER = "0x982e066294532CDC1631Bf7c587f41976dEA9B62";
const REMOTE_FASTTRACK_TIMELOCK = "0x02A66bfB5De5c6b969cB81F00AC433bC8EeeDd4c";
const REMOTE_CRITICAL_TIMELOCK = "0xa82173F08CDFCD6fDB5505dcd37E5c6403a26DE6";
const OMNICHAIN_PROPOSAL_SENDER = "0x0852b6D4C4745A8bFEB54476A2A167DF68866c00";
const OMNICHAIN_EXECUTOR_OWNER = "0x21Faad4b28256E5C56f54fbAaceda919E707549f";
const OMNICHAIN_GOVERNANCE_EXECUTOR = "0x9B0786cD8F841D1C7B8A08a5aE6a246aEd556a42";
const ACCESS_CONTROL_MANAGER = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";

const remoteChainId = 10161;

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
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [remoteChainId, 100],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "updateValidChainId(uint16,bool)",
        params: [remoteChainId, "true"],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [remoteChainId, OMNICHAIN_GOVERNANCE_EXECUTOR],
      },
      {
        target: REMOTE_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", REMOTE_NORMAL_TIMELOCK],
        dstChainId: remoteChainId,
      },
      {
        target: REMOTE_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", REMOTE_NORMAL_TIMELOCK],
        dstChainId: remoteChainId,
      },
      {
        target: REMOTE_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "forceResumeReceive(uint16,bytes)", REMOTE_NORMAL_TIMELOCK],
        dstChainId: remoteChainId,
      },
      {
        target: REMOTE_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "setOracle(address)", REMOTE_NORMAL_TIMELOCK],
        dstChainId: remoteChainId,
      },
      {
        target: REMOTE_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "setMaxDailyReceiveLimit(uint16,uint256)", REMOTE_NORMAL_TIMELOCK],
        dstChainId: remoteChainId,
      },
      {
        target: REMOTE_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "pause()", REMOTE_NORMAL_TIMELOCK],
        dstChainId: remoteChainId,
      },
      {
        target: REMOTE_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "unpause()", REMOTE_NORMAL_TIMELOCK],
        dstChainId: remoteChainId,
      },
      {
        target: REMOTE_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "setTrustedRemoteAddress(uint16,bytes)", REMOTE_NORMAL_TIMELOCK],
        dstChainId: remoteChainId,
      },
      {
        target: REMOTE_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "setPrecrime(address)", REMOTE_NORMAL_TIMELOCK],
        dstChainId: remoteChainId,
      },
      {
        target: REMOTE_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "setMinDstGas(uint16,uint16,uint256)", REMOTE_NORMAL_TIMELOCK],
        dstChainId: remoteChainId,
      },
      {
        target: REMOTE_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "setPayloadSizeLimit(uint16,uint256)", REMOTE_NORMAL_TIMELOCK],
        dstChainId: remoteChainId,
      },
      {
        target: REMOTE_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "setConfig(uint16,uint16,uint256,bytes)", REMOTE_NORMAL_TIMELOCK],
        dstChainId: remoteChainId,
      },
      {
        target: REMOTE_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", REMOTE_NORMAL_TIMELOCK],
        dstChainId: remoteChainId,
      },
      {
        target: OMNICHAIN_EXECUTOR_OWNER,
        signature: "addTimelocks(address[])",
        params: [[REMOTE_NORMAL_TIMELOCK, REMOTE_FASTTRACK_TIMELOCK, REMOTE_CRITICAL_TIMELOCK]],
        dstChainId: remoteChainId,
      },
      {
        target: OMNICHAIN_EXECUTOR_OWNER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [10102, OMNICHAIN_PROPOSAL_SENDER],
        dstChainId: remoteChainId,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
