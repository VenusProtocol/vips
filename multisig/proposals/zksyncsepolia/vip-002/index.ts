import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { makeProposal } from "src/utils";

const { zksyncsepolia } = NETWORK_ADDRESSES;

const ACM = "0xD07f543d47c3a8997D6079958308e981AC14CD01";

export const XVS_BRIDGE_ADMIN_PROXY = "0x28cfE3f2D7D8944FAd162a058260ec922C19065E";
export const XVS = "0x3AeCac43A2ebe5D8184e650403bf9F656F9D1cfA";
export const XVS_BRIDGE_DEST = "0x760461ccB2508CAAa2ECe0c28af3a4707b853043";

export const OPBNB_TESTNET_TRUSTED_REMOTE = "0xa03205bc635a772e533e7be36b5701e331a70ea3";
export const SEPOLIA_TRUSTED_REMOTE = "0xc340b7d3406502f43dc11a988e4ec5bbe536e642";
export const BNB_TESTNET_TRUSTED_REMOTE = "0x0e132cd94fd70298b747d2b4d977db8d086e5fd0";
export const ARBITRUM_SEPOLIA_REMOTE = "0xfdc5cec63fd167da46cf006585b30d03b104efd4";

export const MAX_DAILY_SEND_LIMIT = parseUnits("50000", 18);
export const MAX_DAILY_RECEIVE_LIMIT = parseUnits("51000", 18);
export const SINGLE_SEND_LIMIT = parseUnits("10000", 18);
export const SINGLE_RECEIVE_LIMIT = parseUnits("10200", 18);

export const XVS_MINT_LIMIT = parseUnits("500000", 18);

const vip002 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setSendVersion(uint16)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setReceiveVersion(uint16)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "forceResumeReceive(uint16,bytes)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setOracle(address)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setMaxSingleTransactionLimit(uint16,uint256)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setMaxDailyLimit(uint16,uint256)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setMaxSingleReceiveTransactionLimit(uint16,uint256)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setMaxDailyReceiveLimit(uint16,uint256)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "pause()", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "unpause()", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "removeTrustedRemote(uint16)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "dropFailedMessage(uint16,bytes,uint64)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setPrecrime(address)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setMinDstGas(uint16,uint16,uint256)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setPayloadSizeLimit(uint16,uint256)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setWhitelist(address,bool)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setConfig(uint16,uint16,uint256,bytes)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "sweepToken(address,address,uint256)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "updateSendAndCallEnabled(bool)", zksyncsepolia.GUARDIAN],
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
      params: [XVS_BRIDGE_ADMIN_PROXY, "setTrustedRemoteAddress(uint16,bytes)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "transferBridgeOwnership(address)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "migrateMinterTokens(address,address)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "setMintCap(address,uint256)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "updateBlacklist(address,bool)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "pause()", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "unpause()", zksyncsepolia.GUARDIAN],
    },
    { target: XVS_BRIDGE_ADMIN_PROXY, signature: "acceptOwnership()", params: [] },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [LzChainId.bsctestnet, BNB_TESTNET_TRUSTED_REMOTE],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [LzChainId.opbnbtestnet, OPBNB_TESTNET_TRUSTED_REMOTE],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [LzChainId.sepolia, SEPOLIA_TRUSTED_REMOTE],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [LzChainId.arbitrumsepolia, ARBITRUM_SEPOLIA_REMOTE],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setWhitelist(address,bool)",
      params: [zksyncsepolia.VTREASURY, true],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setWhitelist(address,bool)",
      params: [zksyncsepolia.GUARDIAN, true],
    },
    {
      target: XVS,
      signature: "setMintCap(address,uint256)",
      params: [XVS_BRIDGE_DEST, XVS_MINT_LIMIT],
    },
  ]);
};

export default vip002;
