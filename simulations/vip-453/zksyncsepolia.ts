import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { forking } from "src/vip-framework";

import vip453, {
  MIN_DST_GAS,
  RemoteBridgeEntry,
  XVS_BRIDGE_DEST,
  remoteBridgeEntries,
} from "../../vips/vip-453/bsctestnet";
import { checkXVSBridge } from "./checkXVSBridge";

forking(4245630, async () => {
  await checkXVSBridge(
    LzChainId.berachainbartio,
    NETWORK_ADDRESSES.zksyncsepolia,
    vip453,
    XVS_BRIDGE_DEST,
    remoteBridgeEntries.find(entry => entry.dstChainId === LzChainId.zksyncsepolia) as RemoteBridgeEntry,
    MIN_DST_GAS,
  );
});
