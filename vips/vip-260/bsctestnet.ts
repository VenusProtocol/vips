import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

// const bsctestnet.TOKEN_BRIDGE_VAI = "0x2280aCD3BE2eE270161a11A6176814C26FD747f9";
// const bsctestnet.TOKEN_BRIDGE_ADMIN_VAI = "0xfF058122378BD9AC5B572A2F7c1815E09504D859";
// const bsctestnet.TOKEN_BRIDGE_CONTROLLER_VAI = "0x91b653f7527D698320133Eb97BB55a617663e792";
// const bsctestnet.ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
// const bsctestnet.NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
// const bsctestnet.FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
// const bsctestnet.CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
const GUARDIAN = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";
const TRUSTED_REMOTE = "0xFA62BC6C0E20A507E3Ad0dF4F6b89E71953161fa";
// const bsctestnet.VAI = "0x5fFbE5302BadED40941A403228E6AD03f93752d9";
const { bsctestnet } = NETWORK_ADDRESSES;

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
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "setSendVersion(uint16)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "setReceiveVersion(uint16)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "forceResumeReceive(uint16,bytes)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "setOracle(address)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
          "setMaxSingleTransactionLimit(uint16,uint256)",
          bsctestnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "setMaxDailyLimit(uint16,uint256)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
          "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
          bsctestnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
          "setMaxDailyReceiveLimit(uint16,uint256)",
          bsctestnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "pause()", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "unpause()", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "removeTrustedRemote(uint16)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
          "dropFailedMessage(uint16,bytes,uint64)",
          bsctestnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "setPrecrime(address)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "setMinDstGas(uint16,uint16,uint256)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "setPayloadSizeLimit(uint16,uint256)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "setWhitelist(address,bool)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
          "setConfig(uint16,uint16,uint256,bytes)",
          bsctestnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "sweepToken(address,address,uint256)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "updateSendAndCallEnabled(bool)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "forceMint(uint16,address,uint256)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_CONTROLLER_VAI, "mint(address,uint256)", bsctestnet.TOKEN_BRIDGE_VAI],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)", // TokenController permission to mint tokens
        params: [bsctestnet.VAI, "rely(address)", bsctestnet.TOKEN_BRIDGE_CONTROLLER_VAI],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_CONTROLLER_VAI, "burn(address,uint256)", bsctestnet.TOKEN_BRIDGE_VAI],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
          "setTrustedRemoteAddress(uint16,bytes)",
          bsctestnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "transferBridgeOwnership(address)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.TOKEN_BRIDGE_CONTROLLER_VAI,
          "migrateMinterTokens(address,address)",
          bsctestnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_CONTROLLER_VAI, "setMintCap(address,uint256)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_CONTROLLER_VAI, "updateBlacklist(address,bool)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_CONTROLLER_VAI, "pause()", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_CONTROLLER_VAI, "unpause()", bsctestnet.NORMAL_TIMELOCK],
      },
      // FASTTRACK TIMELOCK PERMISSIONS
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "setSendVersion(uint16)", bsctestnet.FAST_TRACK_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "setReceiveVersion(uint16)", bsctestnet.FAST_TRACK_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "forceResumeReceive(uint16,bytes)", bsctestnet.FAST_TRACK_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
          "setMaxSingleTransactionLimit(uint16,uint256)",
          bsctestnet.FAST_TRACK_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "setMaxDailyLimit(uint16,uint256)", bsctestnet.FAST_TRACK_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
          "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
          bsctestnet.FAST_TRACK_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
          "setMaxDailyReceiveLimit(uint16,uint256)",
          bsctestnet.FAST_TRACK_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "pause()", bsctestnet.FAST_TRACK_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "unpause()", bsctestnet.FAST_TRACK_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "removeTrustedRemote(uint16)", bsctestnet.FAST_TRACK_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
          "setMinDstGas(uint16,uint16,uint256)",
          bsctestnet.FAST_TRACK_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
          "setPayloadSizeLimit(uint16,uint256)",
          bsctestnet.FAST_TRACK_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "setWhitelist(address,bool)", bsctestnet.FAST_TRACK_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
          "setConfig(uint16,uint16,uint256,bytes)",
          bsctestnet.FAST_TRACK_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
          "forceMint(uint16,address,uint256)",
          bsctestnet.FAST_TRACK_TIMELOCK,
        ],
      },
      // CRITICAL TIMELOCK PERMISSIONS
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "setSendVersion(uint16)", bsctestnet.CRITICAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "setReceiveVersion(uint16)", bsctestnet.CRITICAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "forceResumeReceive(uint16,bytes)", bsctestnet.CRITICAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
          "setMaxSingleTransactionLimit(uint16,uint256)",
          bsctestnet.CRITICAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "setMaxDailyLimit(uint16,uint256)", bsctestnet.CRITICAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
          "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
          bsctestnet.CRITICAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
          "setMaxDailyReceiveLimit(uint16,uint256)",
          bsctestnet.CRITICAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "pause()", bsctestnet.CRITICAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "unpause()", bsctestnet.CRITICAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "removeTrustedRemote(uint16)", bsctestnet.CRITICAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
          "setMinDstGas(uint16,uint16,uint256)",
          bsctestnet.CRITICAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
          "setPayloadSizeLimit(uint16,uint256)",
          bsctestnet.CRITICAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "setWhitelist(address,bool)", bsctestnet.CRITICAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
          "setConfig(uint16,uint16,uint256,bytes)",
          bsctestnet.CRITICAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "forceMint(uint16,address,uint256)", bsctestnet.CRITICAL_TIMELOCK],
      },
      // GUARDIAN PERMISSIONS
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "pause()", GUARDIAN],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "unpause()", GUARDIAN],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, "forceMint(uint16,address,uint256)", GUARDIAN],
      },
      { target: bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, signature: "acceptOwnership()", params: [] },
      {
        target: bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [10161, TRUSTED_REMOTE],
      },
      {
        target: bsctestnet.TOKEN_BRIDGE_CONTROLLER_VAI,
        signature: "setMintCap(address,uint256)",
        params: [bsctestnet.TOKEN_BRIDGE_VAI, "100000000000000000000000"], // 100K bsctestnet.VAI
      },
      {
        target: bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [10161, "50000000000000000000000"], // $50K
      },
      {
        target: bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
        signature: "setMaxSingleTransactionLimit(uint16,uint256)",
        params: [10161, "10000000000000000000000"], // $10K
      },
      {
        target: bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
        signature: "setMaxDailyReceiveLimit(uint16,uint256)",
        params: [10161, "50000000000000000000000"], // $50K
      },
      {
        target: bsctestnet.TOKEN_BRIDGE_ADMIN_VAI,
        signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
        params: [10161, "10000000000000000000000"], // $10K
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
