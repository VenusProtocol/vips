import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { makeProposal } from "src/utils";

const { basesepolia } = NETWORK_ADDRESSES;

const ACM = "0x724138223D8F76b519fdE715f60124E7Ce51e051";

export const XVS_BRIDGE_ADMIN_PROXY = "0x8d9eC252984Ed6524ABE5EB19f02bDAdC9a868f1";
export const XVS = "0xe2FC0F0Fa243b1Ca177eb6E023e351583C26E2C4";
export const XVS_BRIDGE_DEST = "0x4112841798c1bD6a237B1A078810ac3C876FdD25";

export const OPBNB_TESTNET_TRUSTED_REMOTE = "0xa03205bc635a772e533e7be36b5701e331a70ea3";
export const SEPOLIA_TRUSTED_REMOTE = "0xc340b7d3406502f43dc11a988e4ec5bbe536e642";
export const BNB_TESTNET_TRUSTED_REMOTE = "0x0e132cd94fd70298b747d2b4d977db8d086e5fd0";
export const ARBITRUM_SEPOLIA_REMOTE = "0xfdc5cec63fd167da46cf006585b30d03b104efd4";
export const ZYSYNC_SEPOLIA_REMOTE = "0x760461ccB2508CAAa2ECe0c28af3a4707b853043";

export const XVS_MINT_LIMIT = parseUnits("500000", 18);

const vip001 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setSendVersion(uint16)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setReceiveVersion(uint16)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "forceResumeReceive(uint16,bytes)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setOracle(address)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setMaxSingleTransactionLimit(uint16,uint256)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setMaxDailyLimit(uint16,uint256)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setMaxSingleReceiveTransactionLimit(uint16,uint256)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setMaxDailyReceiveLimit(uint16,uint256)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "pause()", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "unpause()", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "removeTrustedRemote(uint16)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "dropFailedMessage(uint16,bytes,uint64)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setPrecrime(address)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setMinDstGas(uint16,uint16,uint256)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setPayloadSizeLimit(uint16,uint256)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setWhitelist(address,bool)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setConfig(uint16,uint16,uint256,bytes)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "sweepToken(address,address,uint256)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "updateSendAndCallEnabled(bool)", basesepolia.GUARDIAN],
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
      params: [XVS_BRIDGE_ADMIN_PROXY, "setTrustedRemoteAddress(uint16,bytes)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "transferBridgeOwnership(address)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "migrateMinterTokens(address,address)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "setMintCap(address,uint256)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "updateBlacklist(address,bool)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "pause()", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "unpause()", basesepolia.GUARDIAN],
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
      params: [basesepolia.VTREASURY, true],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setWhitelist(address,bool)",
      params: [basesepolia.GUARDIAN, true],
    },
    {
      target: XVS,
      signature: "setMintCap(address,uint256)",
      params: [XVS_BRIDGE_DEST, XVS_MINT_LIMIT],
    },
  ]);
};

export default vip001;