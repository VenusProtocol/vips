import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip779, {
} from "../../vips/vip-779/bscmainnet";
import OMNICHAIN_EXECUTOR_OWNER_ABI from "./abi/OmichainExecutorOwner.json";

forking(24095232, async () => {
  testForkedNetworkVipCommands("VIP-577 Ethereum", await vip779(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_EXECUTOR_OWNER_ABI],
        [
          "FunctionRegistryChanged",
        ],
        [
          1,
        ],
      );
    },
  });
});
