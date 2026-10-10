import { TransactionResponse } from "@ethersproject/abstract-provider";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip668, { AGGREGATOR_ZKSYNC, NEW_IMPL_ZKSYNC, PROXY_ADMIN_ZKSYNC } from "../../vips/vip-668/bscmainnet";
import PROXY_ABI from "./abi/TransparentUpgradeableProxy.json";
import { checkAfterUpgrade, checkBeforeUpgrade } from "./utils/checks";

const BLOCK_NUMBER = 72411564;
const OLD_IMPLEMENTATION = "0x37a8a74c9Bd7d77c51b0E33e66580BBeAaf3879C";
const ACM = "0x526159A92A82afE5327d37Ef446b68FD9a5cA914";

const upgrade = {
  aggregator: AGGREGATOR_ZKSYNC,
  proxyAdmin: PROXY_ADMIN_ZKSYNC,
  oldImplementation: OLD_IMPLEMENTATION,
  newImplementation: NEW_IMPL_ZKSYNC,
  acm: ACM,
  timelock: NETWORK_ADDRESSES.zksyncmainnet.NORMAL_TIMELOCK,
};

forking(BLOCK_NUMBER, async () => {
  checkBeforeUpgrade(upgrade);

  testForkedNetworkVipCommands("VIP-668 upgrade the AuxiliaryCommandsAggregator", await vip668(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [PROXY_ABI], ["Upgraded"], [1]);
    },
  });

  checkAfterUpgrade(upgrade);
});
