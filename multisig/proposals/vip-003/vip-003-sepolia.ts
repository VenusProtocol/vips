import { NETWORK_ADDRESSES } from "../../../src/networkAddresses";
import { makeProposal } from "../../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const vip003 = () => {
  return makeProposal([
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_BRIDGE_ADMIN, "setSendVersion(uint16)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_BRIDGE_ADMIN, "setReceiveVersion(uint16)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_BRIDGE_ADMIN, "forceResumeReceive(uint16,bytes)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_BRIDGE_ADMIN, "setOracle(address)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_BRIDGE_ADMIN, "setMaxSingleTransactionLimit(uint16,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_BRIDGE_ADMIN, "setMaxDailyLimit(uint16,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        sepolia.XVS_BRIDGE_ADMIN,
        "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
        sepolia.NORMAL_TIMELOCK,
      ],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_BRIDGE_ADMIN, "setMaxDailyReceiveLimit(uint16,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_BRIDGE_ADMIN, "pause()", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_BRIDGE_ADMIN, "unpause()", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_BRIDGE_ADMIN, "removeTrustedRemote(uint16)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_BRIDGE_ADMIN, "dropFailedMessage(uint16,bytes)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_BRIDGE_ADMIN, "fallbackWithdraw(address,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_BRIDGE_ADMIN, "setPrecrime(address)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_BRIDGE_ADMIN, "setMinDstGas(uint16,uint16,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_BRIDGE_ADMIN, "setPayloadSizeLimit(uint16,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_BRIDGE_ADMIN, "setWhitelist(address,bool)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_BRIDGE_ADMIN, "setConfig(uint16,uint16,uint256,bytes)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS, "mint(address,uint256)", sepolia.XVS_PROXY_OFT_DEST],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS, "burn(address,uint256)", sepolia.XVS_PROXY_OFT_DEST],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS, "setMintCap(address,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_BRIDGE_ADMIN, "setTrustedRemoteAddress(uint16,bytes)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.XVS_BRIDGE_ADMIN, "transferBridgeOwnership(address)", sepolia.NORMAL_TIMELOCK],
    },
    { target: sepolia.XVS_BRIDGE_ADMIN, signature: "acceptOwnership()", params: [] },
    {
      target: sepolia.XVS_BRIDGE_ADMIN,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [10102, "0x963cAbDC5bb51C1479ec94Df44DE2EC1a49439E3"],
    },
    {
      target: sepolia.XVS,
      signature: "setMintCap(address,uint256)",
      params: [sepolia.XVS_PROXY_OFT_DEST, "100000000000000000000"],
    },
  ]);
};
