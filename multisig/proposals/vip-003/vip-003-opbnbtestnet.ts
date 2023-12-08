import { makeProposal } from "../../../src/utils";

const NORMAL_TIMELOCK = "0xb15f6EfEbC276A3b9805df81b5FB3D50C2A62BDf";
const ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
const XVS_BRIDGE_ADMIN = "0x418D05AAe6356417cCb571c98bfbff27bD40F19c";
const XVS_BRIDGE = "0x1be95611FC9A808F8794bc9164223b1Fcf49C8Bd";
const XVS = "0x3d0e20D4caD958bc848B045e1da19Fe378f86f03";

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
      params: [XVS_BRIDGE_ADMIN, "fallbackWithdraw(address,uint256)", NORMAL_TIMELOCK],
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
      params: [XVS, "setMintCap(address,uint256)", NORMAL_TIMELOCK],
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
    { target: XVS_BRIDGE_ADMIN, signature: "acceptOwnership()", params: [] },
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [10102, "0x963cAbDC5bb51C1479ec94Df44DE2EC1a49439E3"],
    },
    {
      target: XVS,
      signature: "setMintCap(address,uint256)",
      params: [XVS_BRIDGE, "100000000000000000000"],
    },
  ]);
};
