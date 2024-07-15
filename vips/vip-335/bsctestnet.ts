import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const SEPOLIA_CRITICAL_TIMELOCK = "0xA24A7A65b8968a749841988Bd7d05F6a94329fDe";
const OPBNBTESTNET_CRITICAL_TIMELOCK = "0xBd06aCDEF38230F4EdA0c6FD392905Ad463e42E3";
const ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK = "0x0b32Be083f7041608E023007e7802430396a2123";

export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const SEPOLIA_XVS_BRIDGE_ADMIN = "0xd3c6bdeeadB2359F726aD4cF42EAa8B7102DAd9B";

export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
export const OPBNBTESTNET_XVS_BRIDGE_ADMIN = "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff";

export const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN = "0xc94578caCC89a29B044a0a1D54d20d48A645E5C8";

const SEPOLIA_CHAIN_ID = LzChainId.sepolia;
const OPBNBTESTNET_CHAIN_ID = LzChainId.opbnbtestnet;
const ARBITRUM_SEPOLIA_CHAIN_ID = LzChainId.arbitrumsepolia;

const vip335 = () => {
  const meta = {
    version: "v2",
    title: "VIP-335 XVS Bridge permissions given to Critical Timelock",
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
        params: [ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN, "setSendVersion(uint16)", ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN, "setReceiveVersion(uint16)", ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "forceResumeReceive(uint16,bytes)",
          ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "setMaxSingleTransactionLimit(uint16,uint256)",
          ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "setMaxDailyLimit(uint16,uint256)",
          ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
          ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "setMaxDailyReceiveLimit(uint16,uint256)",
          ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN, "pause()", ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN, "unpause()", ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN, "removeTrustedRemote(uint16)", ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "dropFailedMessage(uint16,bytes,uint64)",
          ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "setMinDstGas(uint16,uint16,uint256)",
          ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "setPayloadSizeLimit(uint16,uint256)",
          ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN, "setWhitelist(address,bool)", ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "setConfig(uint16,uint16,uint256,bytes)",
          ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
          "updateSendAndCallEnabled(bool)",
          ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "setSendVersion(uint16)", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "setReceiveVersion(uint16)", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "forceResumeReceive(uint16,bytes)", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_XVS_BRIDGE_ADMIN,
          "setMaxSingleTransactionLimit(uint16,uint256)",
          OPBNBTESTNET_CRITICAL_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "setMaxDailyLimit(uint16,uint256)", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_XVS_BRIDGE_ADMIN,
          "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
          OPBNBTESTNET_CRITICAL_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_XVS_BRIDGE_ADMIN,
          "setMaxDailyReceiveLimit(uint16,uint256)",
          OPBNBTESTNET_CRITICAL_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "pause()", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "unpause()", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "removeTrustedRemote(uint16)", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_XVS_BRIDGE_ADMIN,
          "dropFailedMessage(uint16,bytes,uint64)",
          OPBNBTESTNET_CRITICAL_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "setMinDstGas(uint16,uint16,uint256)", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "setPayloadSizeLimit(uint16,uint256)", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "setWhitelist(address,bool)", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_XVS_BRIDGE_ADMIN,
          "setConfig(uint16,uint16,uint256,bytes)",
          OPBNBTESTNET_CRITICAL_TIMELOCK,
        ],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS_BRIDGE_ADMIN, "updateSendAndCallEnabled(bool)", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setSendVersion(uint16)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setReceiveVersion(uint16)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "forceResumeReceive(uint16,bytes)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setMaxSingleTransactionLimit(uint16,uint256)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setMaxDailyLimit(uint16,uint256)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          SEPOLIA_XVS_BRIDGE_ADMIN,
          "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
          SEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setMaxDailyReceiveLimit(uint16,uint256)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "pause()", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "unpause()", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "removeTrustedRemote(uint16)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "dropFailedMessage(uint16,bytes,uint64)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setMinDstGas(uint16,uint16,uint256)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setPayloadSizeLimit(uint16,uint256)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setWhitelist(address,bool)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "setConfig(uint16,uint16,uint256,bytes)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS_BRIDGE_ADMIN, "updateSendAndCallEnabled(bool)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip335;
