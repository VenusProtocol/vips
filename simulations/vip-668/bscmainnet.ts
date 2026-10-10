import { TransactionResponse } from "@ethersproject/abstract-provider";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip668, { AGGREGATOR_BSC, NEW_IMPL_BSC, PROXY_ADMIN_BSC } from "../../vips/vip-668/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import PROXY_ABI from "./abi/TransparentUpgradeableProxy.json";
import { checkAfterUpgrade, checkBeforeUpgrade } from "./utils/checks";

const BLOCK_NUMBER = 126759400;
const OLD_IMPLEMENTATION = "0x68C120C4b35874593EE494faf4Db6deFcEFf53b4";
const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";

const upgrade = {
  aggregator: AGGREGATOR_BSC,
  proxyAdmin: PROXY_ADMIN_BSC,
  oldImplementation: OLD_IMPLEMENTATION,
  newImplementation: NEW_IMPL_BSC,
  acm: ACM,
  timelock: NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK,
};

forking(BLOCK_NUMBER, async () => {
  checkBeforeUpgrade(upgrade);

  testVip("VIP-668 upgrade the AuxiliaryCommandsAggregator", await vip668(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      // one remote proposal each for Ethereum, Arbitrum One, Base and ZKsync Era
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [4, 0],
      );
      await expectEvents(txResponse, [PROXY_ABI], ["Upgraded"], [1]);
    },
  });

  checkAfterUpgrade(upgrade);
});
