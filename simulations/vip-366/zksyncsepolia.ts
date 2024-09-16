import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import vip010 from "multisig/proposals/zksyncsepolia/vip-010";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip366 from "../../vips/vip-366/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";
import OMNICHAIN_GOVERNANCE_EXECUTOR_ABI from "./abi/OmnichainGovernanceExecutor_ABI.json";

const { zksyncsepolia } = NETWORK_ADDRESSES;

forking(3771669, async () => {
  const provider = ethers.provider;
  let lastProposalReceived: BigNumber;
  let executor: Contract;

  before(async () => {
    executor = new ethers.Contract(
      zksyncsepolia.OMNICHAIN_GOVERNANCE_EXECUTOR,
      OMNICHAIN_GOVERNANCE_EXECUTOR_ABI,
      provider,
    );
    lastProposalReceived = await executor.lastProposalReceived();
    await pretendExecutingVip(await vip010());
  });

  testForkedNetworkVipCommands("vip366 configures bridge", await vip366(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [12]);
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
