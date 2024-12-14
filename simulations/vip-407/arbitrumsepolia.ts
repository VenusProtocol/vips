import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { forking } from "src/vip-framework";

import vip407, { BASE_SEPOLIA_TRUSTED_REMOTE, MIN_DST_GAS, remoteBridgeEntries } from "../../vips/vip-407/bsctestnet";
import { RemoteBridgeEntry } from "../../vips/vip-407/types";
import { checkXVSBridge } from "./checkXVSBridge";

forking(99339753, async () => {
  await checkXVSBridge(
    LzChainId.basesepolia,
    NETWORK_ADDRESSES.arbitrumsepolia,
    vip407,
    BASE_SEPOLIA_TRUSTED_REMOTE,
    remoteBridgeEntries.find(entry => entry.dstChainId === LzChainId.arbitrumsepolia) as RemoteBridgeEntry,
    MIN_DST_GAS,
  );
});
