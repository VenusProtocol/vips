import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { setRedstonePrice } from "src/utils";
import { forking } from "src/vip-framework";

import vip409, { BASE_MAINNET_TRUSTED_REMOTE, remoteBridgeEntries } from "../../vips/vip-409/bscmainnet";
import { RemoteBridgeEntry } from "../../vips/vip-409/bscmainnet";
import { checkXVSBridge } from "./checkXVSBridge";

forking(51746733, async () => {
  before(async () => {
    const ONE_YEAR = 31536000;
    const XVS_REDSTONE_FEED = "0xca4793Eeb7a837E30884279b3D557970E444EBDe";
    await setRedstonePrice(
      NETWORK_ADDRESSES.zksyncmainnet.REDSTONE_ORACLE,
      NETWORK_ADDRESSES.zksyncmainnet.XVS,
      XVS_REDSTONE_FEED,
      NETWORK_ADDRESSES.zksyncmainnet.NORMAL_TIMELOCK,
      ONE_YEAR,
    );
  });

  await checkXVSBridge(
    LzChainId.basemainnet,
    NETWORK_ADDRESSES.zksyncmainnet,
    vip409,
    BASE_MAINNET_TRUSTED_REMOTE,
    remoteBridgeEntries.find(entry => entry.dstChainId === LzChainId.zksyncmainnet) as RemoteBridgeEntry,
  );
});
