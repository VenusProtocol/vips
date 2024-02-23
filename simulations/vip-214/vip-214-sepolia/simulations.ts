import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../../src/utils";
import { forking, testVipV2 } from "../../../src/vip-framework";
import { vip214Testnet } from "../../../vips/vip-214/vip-214-testnet";
import ACCESS_CONTROL_MANAGER_ABI from "../abi/AccessControlManager_ABI.json";
import OMNICHAIN_GOVERNANCE_EXECUTOR_ABI from "../abi/OmnichainGovernanceExecutor_ABI.json";

const SEPOLIA_GUARDIAN = "0x94fa6078b6b8a26F0B6EDFFBE6501B22A10470fB";
const OMNICHAIN_GOVERNANCE_EXECUTOR = "0xE09E4784C2Dd7B0f2Db5bf9B00E101a4dC8CC9EB";
const SEPOLIA_NORMAL_TIMELOCK = "0x51f560a018b89A470f8fcE6BF22f3a9F3a4789e5";
const SEPOLIA_ACCESS_CONTROL_MANAGER = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

forking(5345042, async () => {
  const provider = ethers.provider;
  let lastProposalReceived: number;
  let executor: Contract;
  let acm: Contract;
  let multisig: any;

  before(async () => {
    executor = new ethers.Contract(OMNICHAIN_GOVERNANCE_EXECUTOR, OMNICHAIN_GOVERNANCE_EXECUTOR_ABI, provider);
    acm = new ethers.Contract(SEPOLIA_ACCESS_CONTROL_MANAGER, ACCESS_CONTROL_MANAGER_ABI, provider);
    lastProposalReceived = await executor.lastProposalReceived();
    multisig = await initMainnetUser(SEPOLIA_GUARDIAN, ethers.utils.parseEther("1"));
    await acm.connect(multisig).grantRole(DEFAULT_ADMIN_ROLE, SEPOLIA_NORMAL_TIMELOCK);
  });

  testVipV2("vip214Testnet configures bridge", await vip214Testnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [13]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("Proposal id should be incremented", async () => {
      expect(await executor.lastProposalReceived()).to.be.equals(lastProposalReceived.add(1));
    });
  });
});
