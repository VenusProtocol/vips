import { makeProposal } from "../../../src/utils";

const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
const NORMAL_TIMELOCK = "0x94fa6078b6b8a26f0b6edffbe6501b22a10470fb";
const VAI = "0x9414b9d8fbC128799B896A50c8927C369AA553CB";
const TOKEN_BRIDGE_VAI = "0xFA62BC6C0E20A507E3Ad0dF4F6b89E71953161fa";
const TOKEN_BRIDGE_ADMIN_VAI = "0x296349C4E86C7C3dd1fC9e5b30Ca47cf31162486";

export const vip011 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [TOKEN_BRIDGE_ADMIN_VAI, "setSendVersion(uint16)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [TOKEN_BRIDGE_ADMIN_VAI, "setReceiveVersion(uint16)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [TOKEN_BRIDGE_ADMIN_VAI, "forceResumeReceive(uint16,bytes)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [TOKEN_BRIDGE_ADMIN_VAI, "setOracle(address)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [TOKEN_BRIDGE_ADMIN_VAI, "setMaxSingleTransactionLimit(uint16,uint256)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [TOKEN_BRIDGE_ADMIN_VAI, "setMaxDailyLimit(uint16,uint256)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [TOKEN_BRIDGE_ADMIN_VAI, "setMaxSingleReceiveTransactionLimit(uint16,uint256)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [TOKEN_BRIDGE_ADMIN_VAI, "setMaxDailyReceiveLimit(uint16,uint256)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [TOKEN_BRIDGE_ADMIN_VAI, "pause()", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [TOKEN_BRIDGE_ADMIN_VAI, "unpause()", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [TOKEN_BRIDGE_ADMIN_VAI, "removeTrustedRemote(uint16)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [TOKEN_BRIDGE_ADMIN_VAI, "dropFailedMessage(uint16,bytes,uint64)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [TOKEN_BRIDGE_ADMIN_VAI, "setPrecrime(address)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [TOKEN_BRIDGE_ADMIN_VAI, "setMinDstGas(uint16,uint16,uint256)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [TOKEN_BRIDGE_ADMIN_VAI, "setPayloadSizeLimit(uint16,uint256)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [TOKEN_BRIDGE_ADMIN_VAI, "setWhitelist(address,bool)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [TOKEN_BRIDGE_ADMIN_VAI, "setConfig(uint16,uint16,uint256,bytes)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [TOKEN_BRIDGE_ADMIN_VAI, "sweepToken(address,address,uint256)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [TOKEN_BRIDGE_ADMIN_VAI, "updateSendAndCallEnabled(bool)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [TOKEN_BRIDGE_ADMIN_VAI, "forceMint(uint16,address,uint256)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [VAI, "mint(address,uint256)", TOKEN_BRIDGE_VAI],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [VAI, "burn(address,uint256)", TOKEN_BRIDGE_VAI],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [TOKEN_BRIDGE_ADMIN_VAI, "setTrustedRemoteAddress(uint16,bytes)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [TOKEN_BRIDGE_ADMIN_VAI, "transferBridgeOwnership(address)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [VAI, "migrateMinterTokens(address,address)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [VAI, "setMintCap(address,uint256)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [VAI, "updateBlacklist(address,bool)", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [VAI, "pause()", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [VAI, "unpause()", NORMAL_TIMELOCK],
    },
    { target: TOKEN_BRIDGE_ADMIN_VAI, signature: "acceptOwnership()", params: [] },
    {
      target: TOKEN_BRIDGE_ADMIN_VAI,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: ["10102", "0x2280aCD3BE2eE270161a11A6176814C26FD747f9"],
    },
    {
      target: VAI,
      signature: "setMintCap(address,uint256)",
      params: [TOKEN_BRIDGE_VAI, "100000000000000000000000"],
    },
    {
      target: TOKEN_BRIDGE_ADMIN_VAI,
      signature: "setMaxDailyLimit(uint16,uint256)",
      params: [10102, "50000000000000000000000"], // $50K
    },
    {
      target: TOKEN_BRIDGE_ADMIN_VAI,
      signature: "setMaxSingleTransactionLimit(uint16,uint256)",
      params: [10102, "10000000000000000000000"], // $10K
    },
    {
      target: TOKEN_BRIDGE_ADMIN_VAI,
      signature: "setMaxDailyReceiveLimit(uint16,uint256)",
      params: [10102, "50000000000000000000000"], // $50K
    },
    {
      target: TOKEN_BRIDGE_ADMIN_VAI,
      signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
      params: [10102, "10000000000000000000000"], // $10K
    },
  ]);
};
