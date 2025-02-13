import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { forking } from "src/vip-framework";

import vip500, {
  MIN_DST_GAS,
  UNICHAIN_SEPOLIA_TRUSTED_REMOTE,
  remoteBridgeEntries,
} from "../../vips/vip-500/bsctestnet";
import { RemoteBridgeEntry } from "../../vips/vip-500/types";
import { checkXVSBridge } from "./checkXVSBridge";

forking(4671599, async () => {
  await checkXVSBridge(
    LzChainId.unichainsepolia,
    NETWORK_ADDRESSES.zksyncsepolia,
    vip500,
    UNICHAIN_SEPOLIA_TRUSTED_REMOTE,
    remoteBridgeEntries.find(entry => entry.dstChainId === LzChainId.zksyncsepolia) as RemoteBridgeEntry,
    MIN_DST_GAS,
  );
});
