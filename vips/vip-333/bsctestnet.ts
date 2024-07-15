import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const SEPOLIA_XVS_BRIDGE_ADMIN = "0xd3c6bdeeadB2359F726aD4cF42EAa8B7102DAd9B";

export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
export const OPBNBTESTNET_XVS_BRIDGE_ADMIN = "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff";

export const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN = "0xc94578caCC89a29B044a0a1D54d20d48A645E5C8";

const SEPOLIA_CHAIN_ID = LzChainId.sepolia;
const OPBNBTESTNET_CHAIN_ID = LzChainId.opbnbtestnet;
const ARBITRUM_SEPOLIA_CHAIN_ID = LzChainId.arbitrumsepolia;

const { arbitrumsepolia, sepolia, opbnbtestnet } = NETWORK_ADDRESSES;

const vip333 = () => {
  const meta = {
    version: "v2",
    title: "VIP-333 XVS Bridge permissions given to all Timelocks",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      // Accept ownership of XVS bridge admin
      {
        target: ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: SEPOLIA_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: SEPOLIA_CHAIN_ID,
      },

      // Permissions given to Normal Timelock
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN, "setSendVersion(uint16)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN, "setReceiveVersion(uint16)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "forceResumeReceive(uint16,bytes)",
          arbitrumsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN, "setOracle(address)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "setMaxSingleTransactionLimit(uint16,uint256)",
          arbitrumsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "setMaxDailyLimit(uint16,uint256)",
          arbitrumsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
          arbitrumsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "setMaxDailyReceiveLimit(uint16,uint256)",
          arbitrumsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN, "pause()", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN, "unpause()", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN, "removeTrustedRemote(uint16)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "dropFailedMessage(uint16,bytes,uint64)",
          arbitrumsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN, "setPrecrime(address)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "setMinDstGas(uint16,uint16,uint256)",
          arbitrumsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "setPayloadSizeLimit(uint16,uint256)",
          arbitrumsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN, "setWhitelist(address,bool)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "setConfig(uint16,uint16,uint256,bytes)",
          arbitrumsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "sweepToken(address,address,uint256)",
          arbitrumsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN, "updateSendAndCallEnabled(bool)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "setTrustedRemoteAddress(uint16,bytes)",
          arbitrumsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "transferBridgeOwnership(address)",
          arbitrumsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "setSendVersion(uint16)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "setReceiveVersion(uint16)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "forceResumeReceive(uint16,bytes)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "setOracle(address)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_XVS_BRIDGE_ADMIN,
          "setMaxSingleTransactionLimit(uint16,uint256)",
          opbnbtestnet.NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "setMaxDailyLimit(uint16,uint256)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_XVS_BRIDGE_ADMIN,
          "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
          opbnbtestnet.NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_XVS_BRIDGE_ADMIN,
          "setMaxDailyReceiveLimit(uint16,uint256)",
          opbnbtestnet.NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "pause()", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "unpause()", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "removeTrustedRemote(uint16)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "dropFailedMessage(uint16,bytes,uint64)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "setPrecrime(address)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "setMinDstGas(uint16,uint16,uint256)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "setPayloadSizeLimit(uint16,uint256)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "setWhitelist(address,bool)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "setConfig(uint16,uint16,uint256,bytes)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "sweepToken(address,address,uint256)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "updateSendAndCallEnabled(bool)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "setTrustedRemoteAddress(uint16,bytes)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "transferBridgeOwnership(address)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setSendVersion(uint16)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setReceiveVersion(uint16)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "forceResumeReceive(uint16,bytes)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setOracle(address)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setMaxSingleTransactionLimit(uint16,uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setMaxDailyLimit(uint16,uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          SEPOLIA_XVS_BRIDGE_ADMIN,
          "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
          sepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setMaxDailyReceiveLimit(uint16,uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "pause()", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "unpause()", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "removeTrustedRemote(uint16)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "dropFailedMessage(uint16,bytes,uint64)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setPrecrime(address)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setMinDstGas(uint16,uint16,uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setPayloadSizeLimit(uint16,uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setWhitelist(address,bool)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setConfig(uint16,uint16,uint256,bytes)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "sweepToken(address,address,uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "updateSendAndCallEnabled(bool)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setTrustedRemoteAddress(uint16,bytes)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "transferBridgeOwnership(address)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },

      // Whitelist Normal Timelock
      {
        target: ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
        signature: "setWhitelist(address,bool)",
        params: [arbitrumsepolia.NORMAL_TIMELOCK, true],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_XVS_BRIDGE_ADMIN,
        signature: "setWhitelist(address,bool)",
        params: [opbnbtestnet.NORMAL_TIMELOCK, true],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: SEPOLIA_XVS_BRIDGE_ADMIN,
        signature: "setWhitelist(address,bool)",
        params: [sepolia.NORMAL_TIMELOCK, true],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip333;
