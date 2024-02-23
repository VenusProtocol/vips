import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const TOKEN_BRIDGE_VAI = "0x2280aCD3BE2eE270161a11A6176814C26FD747f9";
const TOKEN_BRIDGE_ADMIN_VAI = "0xfF058122378BD9AC5B572A2F7c1815E09504D859";
const TOKEN_BRIDGE_CONTROLLER_VAI = "0x91b653f7527D698320133Eb97BB55a617663e792";
const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
const GUARDIAN = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";
const TRUSTED_REMOTE = "0xFA62BC6C0E20A507E3Ad0dF4F6b89E71953161fa";
const VAI = "0x5fFbE5302BadED40941A403228E6AD03f93752d9";

export const vip260Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-260Testnet VIA bridge BSC Testnet - Sepolia",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setSendVersion(uint16)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setReceiveVersion(uint16)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "forceResumeReceive(uint16,bytes)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setOracle(address)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setMaxSingleTransactionLimit(uint16,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setMaxDailyLimit(uint16,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setMaxSingleReceiveTransactionLimit(uint16,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setMaxDailyReceiveLimit(uint16,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "pause()", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "unpause()", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "removeTrustedRemote(uint16)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "dropFailedMessage(uint16,bytes,uint64)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setPrecrime(address)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setMinDstGas(uint16,uint16,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setPayloadSizeLimit(uint16,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setWhitelist(address,bool)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setConfig(uint16,uint16,uint256,bytes)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "sweepToken(address,address,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "updateSendAndCallEnabled(bool)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "forceMint(uint16,address,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_CONTROLLER_VAI, "mint(address,uint256)", TOKEN_BRIDGE_VAI],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)", // TokenController permission to mint tokens
        params: [VAI, "rely(address)", TOKEN_BRIDGE_CONTROLLER_VAI],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_CONTROLLER_VAI, "burn(address,uint256)", TOKEN_BRIDGE_VAI],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setTrustedRemoteAddress(uint16,bytes)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "transferBridgeOwnership(address)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_CONTROLLER_VAI, "migrateMinterTokens(address,address)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_CONTROLLER_VAI, "setMintCap(address,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_CONTROLLER_VAI, "updateBlacklist(address,bool)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_CONTROLLER_VAI, "pause()", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_CONTROLLER_VAI, "unpause()", NORMAL_TIMELOCK],
      },
      // FASTTRACK TIMELOCK PERMISSIONS
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setSendVersion(uint16)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setReceiveVersion(uint16)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "forceResumeReceive(uint16,bytes)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setMaxSingleTransactionLimit(uint16,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setMaxDailyLimit(uint16,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setMaxSingleReceiveTransactionLimit(uint16,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setMaxDailyReceiveLimit(uint16,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "pause()", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "unpause()", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "removeTrustedRemote(uint16)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setMinDstGas(uint16,uint16,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setPayloadSizeLimit(uint16,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setWhitelist(address,bool)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setConfig(uint16,uint16,uint256,bytes)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "forceMint(uint16,address,uint256)", FAST_TRACK_TIMELOCK],
      },
      // CRITICAL TIMELOCK PERMISSIONS
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setSendVersion(uint16)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setReceiveVersion(uint16)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "forceResumeReceive(uint16,bytes)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setMaxSingleTransactionLimit(uint16,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setMaxDailyLimit(uint16,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setMaxSingleReceiveTransactionLimit(uint16,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setMaxDailyReceiveLimit(uint16,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "pause()", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "unpause()", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "removeTrustedRemote(uint16)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setMinDstGas(uint16,uint16,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setPayloadSizeLimit(uint16,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setWhitelist(address,bool)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "setConfig(uint16,uint16,uint256,bytes)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "forceMint(uint16,address,uint256)", CRITICAL_TIMELOCK],
      },
      // GUARDIAN PERMISSIONS
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "pause()", GUARDIAN],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "unpause()", GUARDIAN],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TOKEN_BRIDGE_ADMIN_VAI, "forceMint(uint16,address,uint256)", GUARDIAN],
      },
      { target: TOKEN_BRIDGE_ADMIN_VAI, signature: "acceptOwnership()", params: [] },
      {
        target: TOKEN_BRIDGE_ADMIN_VAI,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [10161, TRUSTED_REMOTE],
      },
      {
        target: TOKEN_BRIDGE_CONTROLLER_VAI,
        signature: "setMintCap(address,uint256)",
        params: [TOKEN_BRIDGE_VAI, "100000000000000000000000"], // 100K VAI
      },
      {
        target: TOKEN_BRIDGE_ADMIN_VAI,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [10161, "50000000000000000000000"], // $50K
      },
      {
        target: TOKEN_BRIDGE_ADMIN_VAI,
        signature: "setMaxSingleTransactionLimit(uint16,uint256)",
        params: [10161, "10000000000000000000000"], // $10K
      },
      {
        target: TOKEN_BRIDGE_ADMIN_VAI,
        signature: "setMaxDailyReceiveLimit(uint16,uint256)",
        params: [10161, "50000000000000000000000"], // $50K
      },
      {
        target: TOKEN_BRIDGE_ADMIN_VAI,
        signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
        params: [10161, "10000000000000000000000"], // $10K
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
