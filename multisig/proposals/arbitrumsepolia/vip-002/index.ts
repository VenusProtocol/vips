import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

const ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";

export const XVS_BRIDGE_ADMIN_PROXY = "0xc94578caCC89a29B044a0a1D54d20d48A645E5C8";
export const XVS = "0x877Dc896e7b13096D3827872e396927BbE704407";
export const XVS_BRIDGE_DEST = "0xFdC5cEC63FD167DA46cF006585b30D03B104eFD4";

export const BNB_TESTNET_ENDPOINT_ID = 10102;
export const SEPOLIA_ENDPOINT_ID = 10161;
export const OPBNB_TESTNET_ENDPOINT_ID = 10202;

export const OPBNB_TESTNET_TRUSTED_REMOTE = "0xa03205bc635a772e533e7be36b5701e331a70ea3";
export const SEPOLIA_TRUSTED_REMOTE = "0xc340b7d3406502f43dc11a988e4ec5bbe536e642";
export const BNB_TESTNET_TRUSTED_REMOTE = "0x0e132cd94fd70298b747d2b4d977db8d086e5fd0";

export const SINGLE_RECEIVE_LIMIT = parseUnits("10200", 18);
export const MAX_DAILY_RECEIVE_LIMIT = parseUnits("51000", 18);

export const XVS_MINT_LIMIT = parseUnits("500000", 18);

const vip002 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setSendVersion(uint16)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setReceiveVersion(uint16)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "forceResumeReceive(uint16,bytes)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setOracle(address)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setMaxSingleTransactionLimit(uint16,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setMaxDailyLimit(uint16,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        XVS_BRIDGE_ADMIN_PROXY,
        "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
        arbitrumsepolia.NORMAL_TIMELOCK,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setMaxDailyReceiveLimit(uint16,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "pause()", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "unpause()", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "removeTrustedRemote(uint16)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "dropFailedMessage(uint16,bytes,uint64)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setPrecrime(address)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setMinDstGas(uint16,uint16,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setPayloadSizeLimit(uint16,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setWhitelist(address,bool)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setConfig(uint16,uint16,uint256,bytes)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "sweepToken(address,address,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "updateSendAndCallEnabled(bool)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "mint(address,uint256)", XVS_BRIDGE_DEST],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "burn(address,uint256)", XVS_BRIDGE_DEST],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setTrustedRemoteAddress(uint16,bytes)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "transferBridgeOwnership(address)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "migrateMinterTokens(address,address)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "setMintCap(address,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "updateBlacklist(address,bool)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "pause()", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "unpause()", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    { target: XVS_BRIDGE_ADMIN_PROXY, signature: "acceptOwnership()", params: [] },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [BNB_TESTNET_ENDPOINT_ID, BNB_TESTNET_TRUSTED_REMOTE],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxDailyReceiveLimit(uint16,uint256)",
      params: [BNB_TESTNET_ENDPOINT_ID, MAX_DAILY_RECEIVE_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
      params: [BNB_TESTNET_ENDPOINT_ID, SINGLE_RECEIVE_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [OPBNB_TESTNET_ENDPOINT_ID, OPBNB_TESTNET_TRUSTED_REMOTE],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxDailyReceiveLimit(uint16,uint256)",
      params: [OPBNB_TESTNET_ENDPOINT_ID, MAX_DAILY_RECEIVE_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
      params: [OPBNB_TESTNET_ENDPOINT_ID, SINGLE_RECEIVE_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [SEPOLIA_ENDPOINT_ID, SEPOLIA_TRUSTED_REMOTE],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxDailyReceiveLimit(uint16,uint256)",
      params: [SEPOLIA_ENDPOINT_ID, MAX_DAILY_RECEIVE_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
      params: [SEPOLIA_ENDPOINT_ID, SINGLE_RECEIVE_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setWhitelist(address,bool)",
      params: [arbitrumsepolia.VTREASURY, true],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setWhitelist(address,bool)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK, true],
    },
    {
      target: XVS,
      signature: "setMintCap(address,uint256)",
      params: [XVS_BRIDGE_DEST, XVS_MINT_LIMIT],
    },
  ]);
};

export default vip002;
