import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip500 from "../../vips/vip-500/bscmainnet";
import vip503, { BASE_MAINNET_TRUSTED_REMOTE, remoteBridgeEntries } from "../../vips/vip-503/bscmainnet";
import { RemoteBridgeEntry } from "../../vips/vip-503/types";
import { checkXVSBridge } from "./checkXVSBridge";

forking(42751317, async () => {
  await testForkedNetworkVipCommands("vip500", await vip500());
  await checkXVSBridge(
    LzChainId.basemainnet,
    NETWORK_ADDRESSES.opbnbmainnet,
    vip503,
    BASE_MAINNET_TRUSTED_REMOTE,
    remoteBridgeEntries.find(entry => entry.dstChainId === LzChainId.opbnbmainnet) as RemoteBridgeEntry,
  );
});
