import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking } from "src/vip-framework";

import { checkRemoteChain } from "./utils/remote";

const BLOCK_NUMBER = 53236657;

forking(BLOCK_NUMBER, async () => {
  await checkRemoteChain("Base", NETWORK_ADDRESSES.basemainnet.NORMAL_TIMELOCK);
});
