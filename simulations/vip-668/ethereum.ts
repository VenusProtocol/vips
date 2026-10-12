import { TransactionResponse } from "@ethersproject/abstract-provider";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip668, { AGGREGATOR_ETHEREUM, NEW_IMPL_ETHEREUM, PROXY_ADMIN_ETHEREUM } from "../../vips/vip-668/bscmainnet";
import PROXY_ABI from "./abi/TransparentUpgradeableProxy.json";
import { checkAfterUpgrade, checkBeforeUpgrade } from "./utils/checks";

const BLOCK_NUMBER = 26159476;
const OLD_IMPLEMENTATION = "0x16691f500541ca35bd63DD878B6D78728C9518AE";
const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";

const upgrade = {
  aggregator: AGGREGATOR_ETHEREUM,
  proxyAdmin: PROXY_ADMIN_ETHEREUM,
  oldImplementation: OLD_IMPLEMENTATION,
  newImplementation: NEW_IMPL_ETHEREUM,
  acm: ACM,
  timelock: NETWORK_ADDRESSES.ethereum.NORMAL_TIMELOCK,
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
