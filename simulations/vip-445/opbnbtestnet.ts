import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { forking } from "src/vip-framework";

import vip445, {
  MIN_DST_GAS,
  UNICHAIN_SEPOLIA_TRUSTED_REMOTE,
  remoteBridgeEntries,
} from "../../vips/vip-445/bsctestnet";
import { RemoteBridgeEntry } from "../../vips/vip-445/types";
import { checkXVSBridge } from "./checkXVSBridge";

forking(52029276, async () => {
  await checkXVSBridge(
    LzChainId.basesepolia,
    NETWORK_ADDRESSES.opbnbtestnet,
    vip445,
    UNICHAIN_SEPOLIA_TRUSTED_REMOTE,
    remoteBridgeEntries.find(entry => entry.dstChainId === LzChainId.opbnbtestnet) as RemoteBridgeEntry,
    MIN_DST_GAS,
  );
});
