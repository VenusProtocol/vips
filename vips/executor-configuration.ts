import { ProposalType } from "../src/types";
import { makeRemoteAndLocalProposal } from "../src/utils";

const REMOTE_NORMAL_TIMELOCK = "0x73595df97ed491475bbcA4fd0D15b047c2f65191";
const REMOTE_ACCESS_CONTROL_MANAGER = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
const REMOTE_FASTTRACK_TIMELOCK = "0xf6BA63893355E0b8690CA2c5D6252a542f8CC754";
const REMOTE_CRITICAL_TIMELOCK = "0xD011c53e5470EAA819Dbdfa3596DA17d720CCF08";
const OMNICHAIN_PROPOSAL_SENDER = "0x972166BdE240c71828d1e8c39a0fA8F3Ed6c8d38";
const OMNICHAIN_EXECUTOR_OWNER = "0xF1Aae92e97f7A0700983b512d7Eb5B509db43Bc5";
const OMNICHAIN_GOVERNANCE_EXECUTOR = "0x171B468b52d7027F12cEF90cd065d6776a25E24e";
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

  return await makeRemoteAndLocalProposal(
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
        params: [OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(TimelockInterface[])", REMOTE_NORMAL_TIMELOCK],
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
