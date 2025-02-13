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

const { arbitrumone } = NETWORK_ADDRESSES;

forking(305688060, async () => {
  await setRedstonePrice(
    arbitrumone.REDSTONE_ORACLE,
    arbitrumone.XVS,
    ethers.constants.AddressZero,
    arbitrumone.NORMAL_TIMELOCK,
  );
  await checkXVSBridge(
    LzChainId.unichainmainnet,
    arbitrumone,
    vip455,
    UNICHAIN_MAINNET_TRUSTED_REMOTE,
    remoteBridgeEntries.find(entry => entry.dstChainId === LzChainId.arbitrumone) as RemoteBridgeEntry,
    MIN_DST_GAS,
  );
});
