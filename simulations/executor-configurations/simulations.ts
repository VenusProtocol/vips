import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { executor_configuration } from "../../vips/executor-configuration";
import ACM_ABI from "./abi/AccessControlManager.json";
import OmnichainProposalSender_ABI from "./abi/OmnichainProposalSender_ABI.json";

const OMNICHAIN_SENDER = "0x972166BdE240c71828d1e8c39a0fA8F3Ed6c8d38";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";

forking(34765220, async () => {
  let timelock: any;
  let sender: ethers.Contract;
  const provider = ethers.provider;
  describe("Pre VIP beahaviour", async () => {
    it("Reverts without permission", async () => {
      sender = new ethers.Contract(OMNICHAIN_SENDER, OmnichainProposalSender_ABI, provider);
      timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      await expect(sender.connect(timelock).updateValidChainId(10161, true)).to.be.revertedWith("access denied");
    });
  });
  testVip("executor_configuration give permissions to timelock", await executor_configuration(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OmnichainProposalSender_ABI, ACM_ABI],
        ["PermissionGranted", "ExecuteRemoteProposal"],
        [4, 1],
      );
    },
  });
});
