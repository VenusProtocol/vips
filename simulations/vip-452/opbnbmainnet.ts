import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { forking } from "src/vip-framework";

import vip452, {
  MIN_DST_GAS,
  UNICHAIN_MAINNET_TRUSTED_REMOTE,
  remoteBridgeEntries,
} from "../../vips/vip-452/bscmainnet";
import { RemoteBridgeEntry } from "../../vips/vip-452/types";
import { checkXVSBridge } from "./checkXVSBridge";

forking(47712189, async () => {
  await checkXVSBridge(
    LzChainId.unichainmainnet,
    NETWORK_ADDRESSES.opbnbmainnet,
    vip452,
    UNICHAIN_MAINNET_TRUSTED_REMOTE,
    remoteBridgeEntries.find(entry => entry.dstChainId === LzChainId.opbnbmainnet) as RemoteBridgeEntry,
    MIN_DST_GAS,
  );
});
