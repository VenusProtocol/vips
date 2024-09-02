import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opsepolia } = NETWORK_ADDRESSES;

const ACM = "0x1652E12C8ABE2f0D84466F0fc1fA4286491B3BC1";

export const XVS_BRIDGE_ADMIN_PROXY = "0x6bBcB95eCF9BEc9AE91d5Ad227783e3913145321";
export const XVS = "0x789482e37218f9b26d8D9115E356462fA9A37116";
export const XVS_BRIDGE_DEST = "0x79a36dc9a43D05Db4747c59c02F48ed500e47dF1";

export const BNB_TESTNET_ENDPOINT_ID = 10102;
export const SEPOLIA_ENDPOINT_ID = 10161;
export const OPBNB_TESTNET_ENDPOINT_ID = 10202;
export const ARBITRUM_SEPOLIA_ENDPOINT_ID = 10231;

export const OPBNB_TESTNET_TRUSTED_REMOTE = "0xa03205bc635a772e533e7be36b5701e331a70ea3";
export const SEPOLIA_TRUSTED_REMOTE = "0xc340b7d3406502f43dc11a988e4ec5bbe536e642";
export const BNB_TESTNET_TRUSTED_REMOTE = "0x0e132cd94fd70298b747d2b4d977db8d086e5fd0";
export const ARBITRUM_SEPOLIA_TRUSTED_REMOTE = "0xfdc5cec63fd167da46cf006585b30d03b104efd4";

export const SINGLE_RECEIVE_LIMIT = parseUnits("10200", 18);
export const MAX_DAILY_RECEIVE_LIMIT = parseUnits("51000", 18);
export const MIN_DST_GAS = "300000";
export const SINGLE_SEND_LIMIT = parseUnits("10000", 18);
export const MAX_DAILY_SEND_LIMIT = parseUnits("50000", 18);

export const XVS_MINT_LIMIT = parseUnits("500000", 18);

const vip002 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setSendVersion(uint16)", opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setReceiveVersion(uint16)", opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "forceResumeReceive(uint16,bytes)", opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setOracle(address)", opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setMaxSingleTransactionLimit(uint16,uint256)", opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setMaxDailyLimit(uint16,uint256)", opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        XVS_BRIDGE_ADMIN_PROXY,
        "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
        opsepolia.NORMAL_TIMELOCK,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setMaxDailyReceiveLimit(uint16,uint256)", opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "pause()", opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "unpause()", opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "removeTrustedRemote(uint16)", opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "dropFailedMessage(uint16,bytes,uint64)", opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setPrecrime(address)", opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setMinDstGas(uint16,uint16,uint256)", opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setPayloadSizeLimit(uint16,uint256)", opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setWhitelist(address,bool)", opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setConfig(uint16,uint16,uint256,bytes)", opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "sweepToken(address,address,uint256)", opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "updateSendAndCallEnabled(bool)", opsepolia.NORMAL_TIMELOCK],
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
      params: [XVS_BRIDGE_ADMIN_PROXY, "setTrustedRemoteAddress(uint16,bytes)", opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "transferBridgeOwnership(address)", opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "migrateMinterTokens(address,address)", opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "setMintCap(address,uint256)", opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "updateBlacklist(address,bool)", opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "pause()", opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "unpause()", opsepolia.NORMAL_TIMELOCK],
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
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [ARBITRUM_SEPOLIA_ENDPOINT_ID, ARBITRUM_SEPOLIA_TRUSTED_REMOTE],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMinDstGas(uint16,uint16,uint256)",
      params: [ARBITRUM_SEPOLIA_ENDPOINT_ID, 0, MIN_DST_GAS],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxDailyLimit(uint16,uint256)",
      params: [ARBITRUM_SEPOLIA_ENDPOINT_ID, MAX_DAILY_SEND_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxSingleTransactionLimit(uint16,uint256)",
      params: [ARBITRUM_SEPOLIA_ENDPOINT_ID, SINGLE_SEND_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxDailyReceiveLimit(uint16,uint256)",
      params: [ARBITRUM_SEPOLIA_ENDPOINT_ID, MAX_DAILY_RECEIVE_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
      params: [ARBITRUM_SEPOLIA_ENDPOINT_ID, SINGLE_RECEIVE_LIMIT],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setWhitelist(address,bool)",
      params: [opsepolia.VTREASURY, true],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setWhitelist(address,bool)",
      params: [opsepolia.NORMAL_TIMELOCK, true],
    },
    {
      target: XVS,
      signature: "setMintCap(address,uint256)",
      params: [XVS_BRIDGE_DEST, XVS_MINT_LIMIT],
    },
  ]);
};

export default vip002;
