import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { forking } from "src/vip-framework";

import vip459, {
  MIN_DST_GAS,
  RemoteBridgeEntry,
  XVS_BRIDGE_DEST,
  remoteBridgeEntries,
} from "../../vips/vip-459/bsctestnet";
import { checkXVSBridge } from "./checkXVSBridge";

forking(7746698, async () => {
  await checkXVSBridge(
    LzChainId.berachainbepolia,
    NETWORK_ADDRESSES.sepolia,
    vip459,
    XVS_BRIDGE_DEST,
    remoteBridgeEntries.find(entry => entry.dstChainId === LzChainId.sepolia) as RemoteBridgeEntry,
    MIN_DST_GAS,
  );
});
