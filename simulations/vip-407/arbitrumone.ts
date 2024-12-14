import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { forking } from "src/vip-framework";

import vip407, { BASE_MAINNET_TRUSTED_REMOTE, MIN_DST_GAS, remoteBridgeEntries } from "../../vips/vip-407/bscmainnet";
import { RemoteBridgeEntry } from "../../vips/vip-407/types";
import { checkXVSBridge } from "./checkXVSBridge";

forking(281666164, async () => {
  await checkXVSBridge(
    LzChainId.basemainnet,
    NETWORK_ADDRESSES.arbitrumone,
    vip407,
    BASE_MAINNET_TRUSTED_REMOTE,
    remoteBridgeEntries.find(entry => entry.dstChainId === LzChainId.arbitrumone) as RemoteBridgeEntry,
    MIN_DST_GAS,
  );
});
