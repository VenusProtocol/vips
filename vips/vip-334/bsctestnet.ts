import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const SEPOLIA_FASTTRACK_TIMELOCK = "0x7F043F43Adb392072a3Ba0cC9c96e894C6f7e182";
const OPBNBTESTNET_FASTTRACK_TIMELOCK = "0xB2E6268085E75817669479b22c73C2AfEaADF7A6";
const ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK = "0x14642991184F989F45505585Da52ca6A6a7dD4c8";

export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const SEPOLIA_XVS_BRIDGE_ADMIN = "0xd3c6bdeeadB2359F726aD4cF42EAa8B7102DAd9B";

export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
export const OPBNBTESTNET_XVS_BRIDGE_ADMIN = "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff";

export const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN = "0xc94578caCC89a29B044a0a1D54d20d48A645E5C8";

const SEPOLIA_CHAIN_ID = LzChainId.sepolia;
const OPBNBTESTNET_CHAIN_ID = LzChainId.opbnbtestnet;
const ARBITRUM_SEPOLIA_CHAIN_ID = LzChainId.arbitrumsepolia;

const vip334 = () => {
  const meta = {
    version: "v2",
    title: "VIP-334 XVS Bridge permissions given to Fasttrack Timelock",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN, "setSendVersion(uint16)", ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN, "setReceiveVersion(uint16)", ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "forceResumeReceive(uint16,bytes)",
          ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "setMaxSingleTransactionLimit(uint16,uint256)",
          ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "setMaxDailyLimit(uint16,uint256)",
          ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
          ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "setMaxDailyReceiveLimit(uint16,uint256)",
          ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN, "pause()", ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN, "unpause()", ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN, "removeTrustedRemote(uint16)", ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "dropFailedMessage(uint16,bytes,uint64)",
          ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "setMinDstGas(uint16,uint16,uint256)",
          ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "setPayloadSizeLimit(uint16,uint256)",
          ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN, "setWhitelist(address,bool)", ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "setConfig(uint16,uint16,uint256,bytes)",
          ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "updateSendAndCallEnabled(bool)",
          ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "setSendVersion(uint16)", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "setReceiveVersion(uint16)", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "forceResumeReceive(uint16,bytes)", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_XVS_BRIDGE_ADMIN,
          "setMaxSingleTransactionLimit(uint16,uint256)",
          OPBNBTESTNET_FASTTRACK_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "setMaxDailyLimit(uint16,uint256)", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_XVS_BRIDGE_ADMIN,
          "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
          OPBNBTESTNET_FASTTRACK_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_XVS_BRIDGE_ADMIN,
          "setMaxDailyReceiveLimit(uint16,uint256)",
          OPBNBTESTNET_FASTTRACK_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "pause()", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "unpause()", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "removeTrustedRemote(uint16)", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_XVS_BRIDGE_ADMIN,
          "dropFailedMessage(uint16,bytes,uint64)",
          OPBNBTESTNET_FASTTRACK_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "setMinDstGas(uint16,uint16,uint256)", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "setPayloadSizeLimit(uint16,uint256)", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "setWhitelist(address,bool)", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_XVS_BRIDGE_ADMIN,
          "setConfig(uint16,uint16,uint256,bytes)",
          OPBNBTESTNET_FASTTRACK_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "updateSendAndCallEnabled(bool)", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setSendVersion(uint16)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setReceiveVersion(uint16)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "forceResumeReceive(uint16,bytes)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setMaxSingleTransactionLimit(uint16,uint256)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setMaxDailyLimit(uint16,uint256)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          SEPOLIA_XVS_BRIDGE_ADMIN,
          "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
          SEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setMaxDailyReceiveLimit(uint16,uint256)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "pause()", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "unpause()", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "removeTrustedRemote(uint16)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "dropFailedMessage(uint16,bytes,uint64)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setMinDstGas(uint16,uint16,uint256)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setPayloadSizeLimit(uint16,uint256)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setWhitelist(address,bool)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setConfig(uint16,uint16,uint256,bytes)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "updateSendAndCallEnabled(bool)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip334;
