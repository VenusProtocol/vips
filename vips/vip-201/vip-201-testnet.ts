import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const NormalTimelock = "0xce10739590001705F7FF231611ba4A48B2820327";
const FastTrackTimelock = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CriticalTimelock = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
const AccessControlManager = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const OmnichainProposalSender = "0xa11d68CDe7BB1Add75af209580E99B2e0566CB74";
const OmnichainGovernanceExecutor = "0xBAaDdb276ACC9D1b5e1B09254b45Cb0ccDddF748";
const remoteChainId = 10161;

export const vip201Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-190 give access permission and configuration of cross chain governance sender on binance chain",
    description: `#### Description
    
    This VIP will grant permission to timelocks and perform the necessary configuration of OmnichainProposalSender`,

    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "setTrustedRemote(uint16,bytes)", NormalTimelock],
      },

      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "setTrustedRemoteAddress(uint16,bytes)", NormalTimelock],
      },

      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "updateValidChainId(uint16,bool)", NormalTimelock],
      },

      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "setMaxDailyLimit(uint16,uint256)", NormalTimelock],
      },
      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "execute(uint16,bytes,bytes)", NormalTimelock],
      },
      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "pause()", NormalTimelock],
      },
      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "unpause()", NormalTimelock],
      },
      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "setSendVersion(uint16)", NormalTimelock],
      },
      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "setConfig(uint16,uint16,uint256,bytes)", NormalTimelock],
      },
      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "setTrustedRemote(uint16,bytes)", FastTrackTimelock],
      },

      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "setTrustedRemoteAddress(uint16,bytes)", FastTrackTimelock],
      },

      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "updateValidChainId(uint16,bool)", FastTrackTimelock],
      },

      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "setMaxDailyLimit(uint16,uint256)", FastTrackTimelock],
      },
      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "execute(uint16,bytes,bytes)", FastTrackTimelock],
      },
      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "pause()", FastTrackTimelock],
      },
      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "unpause()", FastTrackTimelock],
      },
      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "setSendVersion(uint16)", FastTrackTimelock],
      },
      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "setConfig(uint16,uint16,uint256,bytes)", FastTrackTimelock],
      },
      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "setTrustedRemote(uint16,bytes)", CriticalTimelock],
      },

      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "setTrustedRemoteAddress(uint16,bytes)", CriticalTimelock],
      },

      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "updateValidChainId(uint16,bool)", CriticalTimelock],
      },

      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "setMaxDailyLimit(uint16,uint256)", CriticalTimelock],
      },
      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "execute(uint16,bytes,bytes)", CriticalTimelock],
      },
      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "pause()", CriticalTimelock],
      },
      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "unpause()", CriticalTimelock],
      },
      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "setSendVersion(uint16)", CriticalTimelock],
      },
      {
        target: AccessControlManager,
        signature: "giveCallPermission(address,string,address)",
        params: [OmnichainProposalSender, "setConfig(uint16,uint16,uint256,bytes)", CriticalTimelock],
      },
      {
        target: OmnichainProposalSender,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [remoteChainId, 100],
      },
      {
        target: OmnichainProposalSender,
        signature: "updateValidChainId(uint16,bool)",
        params: [remoteChainId, "true"],
      },
      {
        target: OmnichainProposalSender,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [remoteChainId, OmnichainGovernanceExecutor],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
