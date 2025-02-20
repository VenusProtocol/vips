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

forking(20553060, async () => {
  await checkXVSBridge(
    LzChainId.berachainbartio,
    NETWORK_ADDRESSES.opsepolia,
    vip453,
    XVS_BRIDGE_DEST,
    remoteBridgeEntries.find(entry => entry.dstChainId === LzChainId.opsepolia) as RemoteBridgeEntry,
    MIN_DST_GAS,
  );
});
