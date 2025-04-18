import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { forking } from "src/vip-framework";

import vip409, { BASE_MAINNET_TRUSTED_REMOTE, remoteBridgeEntries } from "../../vips/vip-409/bscmainnet";
import { RemoteBridgeEntry } from "../../vips/vip-409/bscmainnet";
import { checkXVSBridge } from "./checkXVSBridge";

forking(21443142, async () => {
  await checkXVSBridge(
    LzChainId.basemainnet,
    NETWORK_ADDRESSES.ethereum,
    vip409,
    BASE_MAINNET_TRUSTED_REMOTE,
    remoteBridgeEntries.find(entry => entry.dstChainId === LzChainId.ethereum) as RemoteBridgeEntry,
  );
});
