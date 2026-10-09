import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip668 from "../../vips/vip-668/bscmainnet";
import { batchRoundTrip, expectUpgradeEvents, postUpgradeChecks, preUpgradeChecks } from "./shared";

// zkSync Era runs protocol version 30 from block ~71500000, and the new implementation was deployed at block 72396708.
// anvil-zksync 0.6.11 forks protocol versions up to 29 only, so to run this simulation upgrade anvil-zksync to a release
// that supports version 30 (v0.7.1 or later) and raise `--protocol-version 29` to 30 in the package.json node scripts.
forking(72399662, async () => {
  preUpgradeChecks("zksyncmainnet");
  testForkedNetworkVipCommands("VIP-668", await vip668(), { callbackAfterExecution: expectUpgradeEvents });
  postUpgradeChecks("zksyncmainnet");
  batchRoundTrip("zksyncmainnet");
});
