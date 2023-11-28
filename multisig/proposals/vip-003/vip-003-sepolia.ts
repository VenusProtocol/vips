import { makeProposal } from "../../../src/utils";
import { ADDRESSES } from "../../helpers/config";

const { sepoliaContracts } = ADDRESSES;

export const vip003 = () => {
  return makeProposal([
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepoliaContracts.XVS_BRIDGE_ADMIN, "setSendVersion(uint16)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepoliaContracts.XVS_BRIDGE_ADMIN, "setReceiveVersion(uint16)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepoliaContracts.XVS_BRIDGE_ADMIN, "forceResumeReceive(uint16,bytes)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepoliaContracts.XVS_BRIDGE_ADMIN, "setOracle(address)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        sepoliaContracts.XVS_BRIDGE_ADMIN,
        "setMaxSingleTransactionLimit(uint16,uint256)",
        sepoliaContracts.TIMELOCK,
      ],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepoliaContracts.XVS_BRIDGE_ADMIN, "setMaxDailyLimit(uint16,uint256)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        sepoliaContracts.XVS_BRIDGE_ADMIN,
        "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
        sepoliaContracts.TIMELOCK,
      ],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepoliaContracts.XVS_BRIDGE_ADMIN, "setMaxDailyReceiveLimit(uint16,uint256)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepoliaContracts.XVS_BRIDGE_ADMIN, "pause()", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepoliaContracts.XVS_BRIDGE_ADMIN, "unpause()", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepoliaContracts.XVS_BRIDGE_ADMIN, "removeTrustedRemote(uint16)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepoliaContracts.XVS_BRIDGE_ADMIN, "dropFailedMessage(uint16,bytes)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepoliaContracts.XVS_BRIDGE_ADMIN, "fallbackWithdraw(address,uint256)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepoliaContracts.XVS_BRIDGE_ADMIN, "setPrecrime(address)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepoliaContracts.XVS_BRIDGE_ADMIN, "setMinDstGas(uint16,uint16,uint256)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepoliaContracts.XVS_BRIDGE_ADMIN, "setPayloadSizeLimit(uint16,uint256)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepoliaContracts.XVS_BRIDGE_ADMIN, "setWhitelist(address,bool)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepoliaContracts.XVS_BRIDGE_ADMIN, "setConfig(uint16,uint16,uint256,bytes)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepoliaContracts.XVS, "mint(address,uint256)", sepoliaContracts.XVS_PROXY_OFT_DEST],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepoliaContracts.XVS, "burn(address,uint256)", sepoliaContracts.XVS_PROXY_OFT_DEST],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepoliaContracts.XVS, "setMintCap(address,uint256)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepoliaContracts.XVS_BRIDGE_ADMIN, "setTrustedRemoteAddress(uint16,bytes)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepoliaContracts.XVS_BRIDGE_ADMIN, "transferBridgeOwnership(address)", sepoliaContracts.TIMELOCK],
    },
    { target: sepoliaContracts.XVS_BRIDGE_ADMIN, signature: "acceptOwnership()", params: [] },
    {
      target: sepoliaContracts.XVS_BRIDGE_ADMIN,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [10102, "0x963cAbDC5bb51C1479ec94Df44DE2EC1a49439E3"],
    },
    {
      target: sepoliaContracts.XVS,
      signature: "setMintCap(address,uint256)",
      params: [sepoliaContracts.XVS_PROXY_OFT_DEST, "100000000000000000000"],
    },
  ]);
};
