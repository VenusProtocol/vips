import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { setRedstonePrice } from "src/utils";
import { forking } from "src/vip-framework";

import vip455, {
  MIN_DST_GAS,
  UNICHAIN_MAINNET_TRUSTED_REMOTE,
  remoteBridgeEntries,
} from "../../vips/vip-455/bscmainnet";
import { RemoteBridgeEntry } from "../../vips/vip-455/types";
import { checkXVSBridge } from "./checkXVSBridge";

const { opmainnet } = NETWORK_ADDRESSES;

forking(131933486, async () => {
  await setRedstonePrice(
    opmainnet.REDSTONE_ORACLE,
    opmainnet.XVS,
    ethers.constants.AddressZero,
    opmainnet.NORMAL_TIMELOCK,
  );

  await checkXVSBridge(
    LzChainId.unichainmainnet,
    opmainnet,
    vip455,
    UNICHAIN_MAINNET_TRUSTED_REMOTE,
    remoteBridgeEntries.find(entry => entry.dstChainId === LzChainId.opmainnet) as RemoteBridgeEntry,
    MIN_DST_GAS,
  );
});
