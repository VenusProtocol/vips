import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../src/utils";

const NORMAL_TIMELOCK = "0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207";
const ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
const XVS_BRIDGE_ADMIN = "0x52fcE05aDbf6103d71ed2BA8Be7A317282731831";
const XVS_BRIDGE = "0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2";
const XVS = "0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61";
const BINANCE_ORACLE = "0xB09EC9B628d04E1287216Aa3e2432291f50F9588";
const RESILIENT_ORACLE = "0x8f3618c4F0183e14A218782c116fb2438571dAC9";
const TRUSTED_REMOTE = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
const XVS_MINT_LIMIT = parseUnits("500000", 18);
const SRC_CHAIN_ID = "102";

export const vip003 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN, "setSendVersion(uint16)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN, "setReceiveVersion(uint16)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN, "forceResumeReceive(uint16,bytes)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN, "setOracle(address)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN, "setMaxSingleTransactionLimit(uint16,uint256)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN, "setMaxDailyLimit(uint16,uint256)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN, "setMaxSingleReceiveTransactionLimit(uint16,uint256)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN, "setMaxDailyReceiveLimit(uint16,uint256)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN, "pause()", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN, "unpause()", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN, "removeTrustedRemote(uint16)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN, "dropFailedMessage(uint16,bytes)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN, "setPrecrime(address)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN, "setMinDstGas(uint16,uint16,uint256)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN, "setPayloadSizeLimit(uint16,uint256)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN, "setWhitelist(address,bool)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN, "setConfig(uint16,uint16,uint256,bytes)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN, "sweepToken(address,address,uint256)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN, "updateSendAndCallEnabled(bool)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "mint(address,uint256)", XVS_BRIDGE],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "burn(address,uint256)", XVS_BRIDGE],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN, "setTrustedRemoteAddress(uint16,bytes)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN, "transferBridgeOwnership(address)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "migrateMinterTokens(address,address)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "setMintCap(address,uint256)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "pause()", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "unpause()", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "updateBlacklist(address,bool)", NORMAL_TIMELOCK],
    },
    {
      target: BINANCE_ORACLE,
      signature: "setMaxStalePeriod(string,uint256)",
      params: ["XVS", "86400"],
    },
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          XVS,
          [BINANCE_ORACLE, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
          [true, false, false],
        ],
      ],
    },
    { target: XVS_BRIDGE_ADMIN, signature: "acceptOwnership()", params: [] },
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [SRC_CHAIN_ID, TRUSTED_REMOTE],
    },
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setWhitelist(address,bool)",
      params: [NORMAL_TIMELOCK, true],
    },
    {
      target: XVS,
      signature: "setMintCap(address,uint256)",
      params: [XVS_BRIDGE, XVS_MINT_LIMIT],
    },
  ]);
};
