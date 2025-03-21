import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { forking } from "src/vip-framework";

import vip452, {
  MIN_DST_GAS,
  UNICHAIN_SEPOLIA_TRUSTED_REMOTE,
  remoteBridgeEntries,
} from "../../vips/vip-452/bsctestnet";
import { RemoteBridgeEntry } from "../../vips/vip-452/types";
import { checkXVSBridge } from "./checkXVSBridge";

forking(121879821, async () => {
  await checkXVSBridge(
    LzChainId.unichainsepolia,
    NETWORK_ADDRESSES.arbitrumsepolia,
    vip452,
    UNICHAIN_SEPOLIA_TRUSTED_REMOTE,
    remoteBridgeEntries.find(entry => entry.dstChainId === LzChainId.arbitrumsepolia) as RemoteBridgeEntry,
    MIN_DST_GAS,
  );
});
