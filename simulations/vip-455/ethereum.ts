import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { forking } from "src/vip-framework";

import vip455, {
  MIN_DST_GAS,
  UNICHAIN_MAINNET_TRUSTED_REMOTE,
  remoteBridgeEntries,
} from "../../vips/vip-455/bscmainnet";
import { RemoteBridgeEntry } from "../../vips/vip-455/types";
import { checkXVSBridge } from "./checkXVSBridge";

forking(21815798, async () => {
  await checkXVSBridge(
    LzChainId.unichainmainnet,
    NETWORK_ADDRESSES.ethereum,
    vip455,
    UNICHAIN_MAINNET_TRUSTED_REMOTE,
    remoteBridgeEntries.find(entry => entry.dstChainId === LzChainId.ethereum) as RemoteBridgeEntry,
    MIN_DST_GAS,
  );
});
