import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip330, { ARBITRUMSEPOLIA_OMNICHAIN_GOVERNANCE_EXECUTOR } from "../../vips/vip-330/bsctestnet-development";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";
import OMNICHAIN_GOVERNANCE_EXECUTOR_ABI from "./abi/OmnichainGovernanceExecutor_ABI.json";

forking(85625640, async () => {
  const provider = ethers.provider;
  let lastProposalReceived: BigNumber;
  let executor: Contract;

  before(async () => {
    executor = new ethers.Contract(
      ARBITRUMSEPOLIA_OMNICHAIN_GOVERNANCE_EXECUTOR,
      OMNICHAIN_GOVERNANCE_EXECUTOR_ABI,
      provider,
    );
    lastProposalReceived = await executor.lastProposalReceived();
  });

  testForkedNetworkVipCommands("vip330 development", await vip330(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("Proposal id should be incremented", async () => {
      expect(await executor.lastProposalReceived()).to.be.equals(lastProposalReceived.add(1));
    });
    it("proposal should be executed", async () => {
      const pId = await executor.lastProposalReceived();
      expect(await executor.state(pId)).to.be.equals(2);
    });
  });
});
