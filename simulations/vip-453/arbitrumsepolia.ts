import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { forking } from "src/vip-framework";

import vip453, { XVS_BRIDGE_DEST, MIN_DST_GAS, remoteBridgeEntries, RemoteBridgeEntry } from "../../vips/vip-453/bsctestnet";
import { checkXVSBridge } from "./checkXVSBridge";

forking(99339753, async () => {
  await checkXVSBridge(
    LzChainId.basesepolia,
    NETWORK_ADDRESSES.arbitrumsepolia,
    vip453,
    XVS_BRIDGE_DEST,
    remoteBridgeEntries.find(entry => entry.dstChainId === LzChainId.arbitrumsepolia) as RemoteBridgeEntry,
    MIN_DST_GAS,
  );
});
