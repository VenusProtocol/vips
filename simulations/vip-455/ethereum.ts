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

const { ethereum } = NETWORK_ADDRESSES;

forking(21838787, async () => {
  await setRedstonePrice(
    ethereum.REDSTONE_ORACLE,
    ethereum.XVS,
    ethers.constants.AddressZero,
    ethereum.NORMAL_TIMELOCK,
  );
  await checkXVSBridge(
    LzChainId.unichainmainnet,
    ethereum,
    vip455,
    UNICHAIN_MAINNET_TRUSTED_REMOTE,
    remoteBridgeEntries.find(entry => entry.dstChainId === LzChainId.ethereum) as RemoteBridgeEntry,
    MIN_DST_GAS,
  );
});
