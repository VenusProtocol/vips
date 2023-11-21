import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { expectEvents, initMainnetUser } from "../../src/utils";
import { forking, testVipV2 } from "../../src/vip-framework";
import { executor_configuration } from "../../vips/executor-configuration";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";
import OMNICHAIN_GOVERNANCE_EXECUTOR_ABI from "./abi/OmnichainGovernanceExecutor_ABI.json";

const { sepolia } = NETWORK_ADDRESSES;

const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

forking(4732360, async () => {
  const provider = ethers.provider;
  let lastProposalReceived: number;
  let executor: Contract;
  let acm: Contract;
  let multisig: any;

  const proposal = await executor_configuration();

  before(async () => {
    executor = new ethers.Contract(sepolia.OMNICHAIN_GOVERNANCE_EXECUTOR, OMNICHAIN_GOVERNANCE_EXECUTOR_ABI, provider);
    acm = new ethers.Contract(sepolia.ACCESS_CONTROL_MANAGER, ACCESS_CONTROL_MANAGER_ABI, provider);
    lastProposalReceived = await executor.lastProposalReceived();
    multisig = await initMainnetUser(sepolia.GUARDIAN, ethers.utils.parseEther("1"));
    await acm.connect(multisig).grantRole(DEFAULT_ADMIN_ROLE, sepolia.NORMAL_TIMELOCK);
  });

  testVipV2("executor_configuration give permissions to timelock", proposal, {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI, OMNICHAIN_GOVERNANCE_EXECUTOR_ABI],
        ["PermissionGranted", "SetTrustedRemoteAddress", "TimelockAdded"],
        [13, 1, 3],
      );
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("Proposal id should be incremented", async () => {
      expect(await executor.lastProposalReceived()).to.be.equals(lastProposalReceived.add(1));
    });
    it("Set normal timelock ", async () => {
      expect(await executor.proposalTimelocks(0)).to.equals(sepolia.NORMAL_TIMELOCK);
    });
    it("Set fasttrack timelock", async () => {
      expect(await executor.proposalTimelocks(1)).to.equals(sepolia.FASTTRACK_TIMELOCK);
    });
    it("Set critical timelock", async () => {
      expect(await executor.proposalTimelocks(2)).to.equals(sepolia.CRITICAL_TIMELOCK);
    });
    it("Set trusted remote", async () => {
      expect(await executor.trustedRemoteLookup(10102)).to.equals(
        sepolia.OMNICHAIN_PROPOSAL_SENDER + sepolia.OMNICHAIN_GOVERNANCE_EXECUTOR.slice(2),
      );
    });
  });
});
