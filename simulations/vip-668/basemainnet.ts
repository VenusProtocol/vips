import { TransactionResponse } from "@ethersproject/abstract-provider";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip668, { AGGREGATOR_BASE, NEW_IMPL_BASE, PROXY_ADMIN_BASE } from "../../vips/vip-668/bscmainnet";
import PROXY_ABI from "./abi/TransparentUpgradeableProxy.json";
import { checkAfterUpgrade, checkBeforeUpgrade } from "./utils/checks";

const BLOCK_NUMBER = 52407589;
const OLD_IMPLEMENTATION = "0xc79Cb7efEBd121DC4B39eA141C214606595D665A";
const ACM = "0x9E6CeEfDC6183e4D0DF8092A9B90cDF659687daB";

const upgrade = {
  aggregator: AGGREGATOR_BASE,
  proxyAdmin: PROXY_ADMIN_BASE,
  oldImplementation: OLD_IMPLEMENTATION,
  newImplementation: NEW_IMPL_BASE,
  acm: ACM,
  timelock: NETWORK_ADDRESSES.basemainnet.NORMAL_TIMELOCK,
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
