import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking } from "src/vip-framework";

import { checkRemoteChain } from "./utils/remote";

const BLOCK_NUMBER = 26297212;

forking(BLOCK_NUMBER, async () => {
  await checkRemoteChain("Ethereum", NETWORK_ADDRESSES.ethereum.NORMAL_TIMELOCK);
});
