import { parseUnits } from "ethers/lib/utils";

import { NETWORK_ADDRESSES } from "../../../src/networkAddresses";
import { makeProposal } from "../../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;
const TRUSTED_REMOTE = "0xeaa89cF3bAB8245F8A2F438595e1fF5cC3eEaE18";

export const vip011 = () => {
  return makeProposal([
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.TOKEN_BRIDGE_ADMIN_VAI, "setSendVersion(uint16)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.TOKEN_BRIDGE_ADMIN_VAI, "setReceiveVersion(uint16)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.TOKEN_BRIDGE_ADMIN_VAI, "forceResumeReceive(uint16,bytes)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.TOKEN_BRIDGE_ADMIN_VAI, "setOracle(address)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.TOKEN_BRIDGE_ADMIN_VAI, "setMaxSingleTransactionLimit(uint16,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.TOKEN_BRIDGE_ADMIN_VAI, "setMaxDailyLimit(uint16,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        sepolia.TOKEN_BRIDGE_ADMIN_VAI,
        "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
        sepolia.NORMAL_TIMELOCK,
      ],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.TOKEN_BRIDGE_ADMIN_VAI, "setMaxDailyReceiveLimit(uint16,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.TOKEN_BRIDGE_ADMIN_VAI, "pause()", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.TOKEN_BRIDGE_ADMIN_VAI, "unpause()", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.TOKEN_BRIDGE_ADMIN_VAI, "removeTrustedRemote(uint16)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.TOKEN_BRIDGE_ADMIN_VAI, "dropFailedMessage(uint16,bytes,uint64)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.TOKEN_BRIDGE_ADMIN_VAI, "setPrecrime(address)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.TOKEN_BRIDGE_ADMIN_VAI, "setMinDstGas(uint16,uint16,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.TOKEN_BRIDGE_ADMIN_VAI, "setPayloadSizeLimit(uint16,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.TOKEN_BRIDGE_ADMIN_VAI, "setWhitelist(address,bool)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.TOKEN_BRIDGE_ADMIN_VAI, "setConfig(uint16,uint16,uint256,bytes)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.TOKEN_BRIDGE_ADMIN_VAI, "sweepToken(address,address,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.TOKEN_BRIDGE_ADMIN_VAI, "updateSendAndCallEnabled(bool)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.TOKEN_BRIDGE_ADMIN_VAI, "forceMint(uint16,address,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.VAI, "mint(address,uint256)", sepolia.TOKEN_BRIDGE_VAI],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.VAI, "burn(address,uint256)", sepolia.TOKEN_BRIDGE_VAI],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.TOKEN_BRIDGE_ADMIN_VAI, "setTrustedRemoteAddress(uint16,bytes)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.TOKEN_BRIDGE_ADMIN_VAI, "transferBridgeOwnership(address)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.VAI, "migrateMinterTokens(address,address)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.VAI, "setMintCap(address,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.VAI, "updateBlacklist(address,bool)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.VAI, "pause()", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.VAI, "unpause()", sepolia.NORMAL_TIMELOCK],
    },
    { target: sepolia.TOKEN_BRIDGE_ADMIN_VAI, signature: "acceptOwnership()", params: [] },
    {
      target: sepolia.TOKEN_BRIDGE_ADMIN_VAI,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: ["10102", TRUSTED_REMOTE],
    },
    {
      target: sepolia.VAI,
      signature: "setMintCap(address,uint256)",
      params: [sepolia.TOKEN_BRIDGE_VAI, "100000000000000000000000"],
    },
    {
      target: sepolia.TOKEN_BRIDGE_ADMIN_VAI,
      signature: "setMaxDailyLimit(uint16,uint256)",
      params: [10102, "50000000000000000000000"], // $50K
    },
    {
      target: sepolia.TOKEN_BRIDGE_ADMIN_VAI,
      signature: "setMaxSingleTransactionLimit(uint16,uint256)",
      params: [10102, "10000000000000000000000"], // $10K
    },
    {
      target: sepolia.TOKEN_BRIDGE_ADMIN_VAI,
      signature: "setMaxDailyReceiveLimit(uint16,uint256)",
      params: [10102, "50000000000000000000000"], // $50K
    },
    {
      target: sepolia.TOKEN_BRIDGE_ADMIN_VAI,
      signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
      params: [10102, "10000000000000000000000"], // $10K
    },
    {
      target: sepolia.CHAINLINK_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [sepolia.VAI, parseUnits("1", 18)],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          sepolia.VAI,
          [
            sepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
  ]);
};
