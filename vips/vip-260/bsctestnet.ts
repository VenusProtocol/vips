import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const GUARDIAN = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";
const TRUSTED_REMOTE = "0x69fFBFCe81c105a07916d3a8fCA205Ed1758B826";
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
        params: [bsctestnet.TOKEN_BRIDGE_VAI, "100000000000000000000000"], // 100K VAI
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
