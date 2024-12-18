import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip407 from "../../vips/vip-407/bscmainnet";
import vip502, { BASE_MAINNET_TRUSTED_REMOTE, remoteBridgeEntries } from "../../vips/vip-502/bscmainnet";
import { RemoteBridgeEntry } from "../../vips/vip-502/bscmainnet";
import { checkXVSBridge } from "./checkXVSBridge";

forking(42751317, async () => {
  await testForkedNetworkVipCommands("vip500", await vip407());
  await checkXVSBridge(
    LzChainId.basemainnet,
    NETWORK_ADDRESSES.opbnbmainnet,
    vip502,
    BASE_MAINNET_TRUSTED_REMOTE,
    remoteBridgeEntries.find(entry => entry.dstChainId === LzChainId.opbnbmainnet) as RemoteBridgeEntry,
  );
});
