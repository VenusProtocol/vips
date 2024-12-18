import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { forking } from "src/vip-framework";

import vip500, { BASE_MAINNET_TRUSTED_REMOTE, MIN_DST_GAS, remoteBridgeEntries } from "../../vips/vip-500/bscmainnet";
import { RemoteBridgeEntry } from "../../vips/vip-500/types";
import { checkXVSBridge } from "./checkXVSBridge";

forking(50573593, async () => {
  await checkXVSBridge(
    LzChainId.basemainnet,
    NETWORK_ADDRESSES.zksyncmainnet,
    vip500,
    BASE_MAINNET_TRUSTED_REMOTE,
    remoteBridgeEntries.find(entry => entry.dstChainId === LzChainId.zksyncmainnet) as RemoteBridgeEntry,
    MIN_DST_GAS,
  );
});