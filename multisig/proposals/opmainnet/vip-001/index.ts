import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opmainnet } = NETWORK_ADDRESSES;

const ACM = "0xD71b1F33f6B0259683f11174EE4Ddc2bb9cE4eD6";

export const XVS_BRIDGE_ADMIN_PROXY = "0x3c307DF1Bf3198a2417d9CA86806B307D147Ddf7";
export const XVS = "0x4a971e87ad1F61f7f3081645f52a99277AE917cF";
export const XVS_BRIDGE_DEST = "0xbBe46bAec851355c3FC4856914c47eB6Cea0B8B4";

export const BNB_MAINNET_ENDPOINT_ID = 102;
export const ETHEREUM_ENDPOINT_ID = 101;
export const OPBNB_MAINNET_ENDPOINT_ID = 202;
export const ARBITRUM_ONE_ENDPOINT_ID = 110;
export const ZKSYNC_MAINNET_ENDPOINT_ID = 165;

export const OPBNB_MAINNET_TRUSTED_REMOTE = "0x100d331c1b5dcd41eacb1eced0e83dcebf3498b2";
export const ETHEREUM_TRUSTED_REMOTE = "0x888e317606b4c590bbad88653863e8b345702633";
export const BNB_MAINNET_TRUSTED_REMOTE = "0xf8f46791e3db29a029ec6c9d946226f3c613e854";
export const ARBITRUM_ONE_TRUSTED_REMOTE = "0x20cea49b5f7a6dbd78cae772ca5973ef360aa1e6";
export const ZKSYNC_MAINNET_TRUSTED_REMOTE = "0x16a62B534e09A7534CD5847CFE5Bf6a4b0c1B116";

export const MAX_DAILY_SEND_LIMIT = parseUnits("100000", 18);
export const MAX_DAILY_RECEIVE_LIMIT = parseUnits("102000", 18);
export const SINGLE_SEND_LIMIT = parseUnits("20000", 18);
export const SINGLE_RECEIVE_LIMIT = parseUnits("20400", 18);

export const XVS_MINT_LIMIT = parseUnits("500000", 18);

const vip001 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setSendVersion(uint16)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setReceiveVersion(uint16)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "forceResumeReceive(uint16,bytes)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setOracle(address)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setMaxSingleTransactionLimit(uint16,uint256)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setMaxDailyLimit(uint16,uint256)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setMaxSingleReceiveTransactionLimit(uint16,uint256)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setMaxDailyReceiveLimit(uint16,uint256)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "pause()", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "unpause()", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "removeTrustedRemote(uint16)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "dropFailedMessage(uint16,bytes,uint64)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setPrecrime(address)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setMinDstGas(uint16,uint16,uint256)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setPayloadSizeLimit(uint16,uint256)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setWhitelist(address,bool)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "setConfig(uint16,uint16,uint256,bytes)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "sweepToken(address,address,uint256)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "updateSendAndCallEnabled(bool)", opmainnet.GUARDIAN],
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
      params: [XVS_BRIDGE_ADMIN_PROXY, "setTrustedRemoteAddress(uint16,bytes)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_BRIDGE_ADMIN_PROXY, "transferBridgeOwnership(address)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "migrateMinterTokens(address,address)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "setMintCap(address,uint256)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "updateBlacklist(address,bool)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "pause()", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS, "unpause()", opmainnet.GUARDIAN],
    },
    { target: XVS_BRIDGE_ADMIN_PROXY, signature: "acceptOwnership()", params: [] },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [BNB_MAINNET_ENDPOINT_ID, BNB_MAINNET_TRUSTED_REMOTE],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [OPBNB_MAINNET_ENDPOINT_ID, OPBNB_MAINNET_TRUSTED_REMOTE],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [ETHEREUM_ENDPOINT_ID, ETHEREUM_TRUSTED_REMOTE],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [ARBITRUM_ONE_ENDPOINT_ID, ARBITRUM_ONE_TRUSTED_REMOTE],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [ZKSYNC_MAINNET_ENDPOINT_ID, ZKSYNC_MAINNET_TRUSTED_REMOTE],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setWhitelist(address,bool)",
      params: [opmainnet.VTREASURY, true],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setWhitelist(address,bool)",
      params: [opmainnet.GUARDIAN, true],
    },
    {
      target: XVS,
      signature: "setMintCap(address,uint256)",
      params: [XVS_BRIDGE_DEST, XVS_MINT_LIMIT],
    },
  ]);
};

export default vip001;
