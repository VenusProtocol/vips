import { TransactionResponse } from "@ethersproject/abstract-provider";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip668, { AGGREGATOR_ARBITRUM, NEW_IMPL_ARBITRUM, PROXY_ADMIN_ARBITRUM } from "../../vips/vip-668/bscmainnet";
import PROXY_ABI from "./abi/TransparentUpgradeableProxy.json";
import { checkAfterUpgrade, checkBeforeUpgrade } from "./utils/checks";

const BLOCK_NUMBER = 513402828;
const OLD_IMPLEMENTATION = "0xc79Cb7efEBd121DC4B39eA141C214606595D665A";
const ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";

const upgrade = {
  aggregator: AGGREGATOR_ARBITRUM,
  proxyAdmin: PROXY_ADMIN_ARBITRUM,
  oldImplementation: OLD_IMPLEMENTATION,
  newImplementation: NEW_IMPL_ARBITRUM,
  acm: ACM,
  timelock: NETWORK_ADDRESSES.arbitrumone.NORMAL_TIMELOCK,
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
