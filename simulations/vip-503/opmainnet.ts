import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { setRedstonePrice } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip500 from "../../vips/vip-500/bscmainnet";
import vip503, { BASE_MAINNET_TRUSTED_REMOTE, remoteBridgeEntries } from "../../vips/vip-503/bscmainnet";
import { RemoteBridgeEntry } from "../../vips/vip-503/types";
import { checkXVSBridge } from "./checkXVSBridge";

forking(129453114, async () => {
  before(async () => {
    const ONE_YEAR = 31536000;
    const XVS_REDSTONE_FEED = "0x414F8f961969A8131AbE53294600c6C515E68f81";
    await setRedstonePrice(
      NETWORK_ADDRESSES.opmainnet.REDSTONE_ORACLE,
      NETWORK_ADDRESSES.opmainnet.XVS,
      XVS_REDSTONE_FEED,
      NETWORK_ADDRESSES.opmainnet.NORMAL_TIMELOCK,
      ONE_YEAR,
    );
  });

  await testForkedNetworkVipCommands("vip500", await vip500());
  await checkXVSBridge(
    LzChainId.basemainnet,
    NETWORK_ADDRESSES.opmainnet,
    vip503,
    BASE_MAINNET_TRUSTED_REMOTE,
    remoteBridgeEntries.find(entry => entry.dstChainId === LzChainId.opmainnet) as RemoteBridgeEntry,
  );
});
