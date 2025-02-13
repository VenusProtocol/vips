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

const { basemainnet } = NETWORK_ADDRESSES;

forking(26337636, async () => {
  await setRedstonePrice(
    basemainnet.REDSTONE_ORACLE,
    basemainnet.XVS,
    ethers.constants.AddressZero,
    basemainnet.NORMAL_TIMELOCK,
  );
  await checkXVSBridge(
    LzChainId.unichainmainnet,
    basemainnet,
    vip455,
    UNICHAIN_MAINNET_TRUSTED_REMOTE,
    remoteBridgeEntries.find(entry => entry.dstChainId === LzChainId.basemainnet) as RemoteBridgeEntry,
    MIN_DST_GAS,
  );
});
