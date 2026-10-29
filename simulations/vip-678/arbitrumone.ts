import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking } from "src/vip-framework";

import { checkRemoteChain } from "./utils/remote";

const BLOCK_NUMBER = 519306010;

forking(BLOCK_NUMBER, async () => {
  await checkRemoteChain("Arbitrum One", NETWORK_ADDRESSES.arbitrumone.NORMAL_TIMELOCK);
});
