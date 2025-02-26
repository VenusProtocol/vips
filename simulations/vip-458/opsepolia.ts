import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { forking } from "src/vip-framework";

import vip458, {
  MIN_DST_GAS,
  RemoteBridgeEntry,
  XVS_BRIDGE_DEST,
  remoteBridgeEntries,
} from "../../vips/vip-458/bsctestnet";
import { checkXVSBridge } from "./checkXVSBridge";

forking(20553060, async () => {
  await checkXVSBridge(
    LzChainId.berachainbartio,
    NETWORK_ADDRESSES.opsepolia,
    vip458,
    XVS_BRIDGE_DEST,
    remoteBridgeEntries.find(entry => entry.dstChainId === LzChainId.opsepolia) as RemoteBridgeEntry,
    MIN_DST_GAS,
  );
});
