import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip701Testnet, {
  ACM,
  EBRAKE,
  EBRAKE_EXECUTOR_PERMS,
  EXECUTOR,
  EXECUTOR_GOVERNANCE_PERMS,
  EXECUTOR_MONITOR_PERMS,
  SIGNAL_MONITOR,
} from "../../vips/vip-701/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { NORMAL_TIMELOCK } = NETWORK_ADDRESSES.bsctestnet;

// TODO: set to a block after Executor is deployed on BSC testnet
const BLOCK_NUMBER = 0;

forking(BLOCK_NUMBER, async () => {
  let accessControlManager: Contract;

  let impersonatedExecutor: SignerWithAddress;
  let impersonatedEBrake: SignerWithAddress;

  before(async () => {
    accessControlManager = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ACM);

    impersonatedExecutor = await initMainnetUser(EXECUTOR, ethers.utils.parseEther("1"));
    impersonatedEBrake = await initMainnetUser(EBRAKE, ethers.utils.parseEther("1"));
  });

  describe("Pre-VIP behavior", () => {
    it("Signal monitor should not yet have Executor action permissions", async () => {
      const acm = accessControlManager.connect(impersonatedExecutor);
      for (const sig of EXECUTOR_MONITOR_PERMS) {
        expect(await acm.isAllowedToCall(SIGNAL_MONITOR, sig)).to.equal(false, `unexpected permission: ${sig}`);
      }
    });

    it("Executor should not yet have EBrake permissions", async () => {
      const acm = accessControlManager.connect(impersonatedEBrake);
      for (const sig of EBRAKE_EXECUTOR_PERMS) {
        expect(await acm.isAllowedToCall(EXECUTOR, sig)).to.equal(false, `unexpected permission: ${sig}`);
      }
    });

    it("Normal Timelock should not yet have setMarketConfig permission on Executor", async () => {
      const acm = accessControlManager.connect(impersonatedExecutor);
      for (const sig of EXECUTOR_GOVERNANCE_PERMS) {
        expect(await acm.isAllowedToCall(NORMAL_TIMELOCK, sig)).to.equal(false, `unexpected permission: ${sig}`);
      }
    });
  });

  testVip("VIP-701 [BNB Testnet] Configure tighten-only Executor", await vip701Testnet(), {
    callbackAfterExecution: async txResponse => {
      // RoleGranted: 4 (monitor on Executor) + 5 (Executor on EBrake) + 1 (timelock setMarketConfig) = 10
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleGranted"], [10]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("Signal monitor should have all Executor action permissions", async () => {
      const acm = accessControlManager.connect(impersonatedExecutor);
      for (const sig of EXECUTOR_MONITOR_PERMS) {
        expect(await acm.isAllowedToCall(SIGNAL_MONITOR, sig)).to.equal(true, `missing permission: ${sig}`);
      }
    });

    it("Executor should have all EBrake permissions", async () => {
      const acm = accessControlManager.connect(impersonatedEBrake);
      for (const sig of EBRAKE_EXECUTOR_PERMS) {
        expect(await acm.isAllowedToCall(EXECUTOR, sig)).to.equal(true, `missing permission: ${sig}`);
      }
    });

    it("Normal Timelock should have setMarketConfig permission on Executor", async () => {
      const acm = accessControlManager.connect(impersonatedExecutor);
      for (const sig of EXECUTOR_GOVERNANCE_PERMS) {
        expect(await acm.isAllowedToCall(NORMAL_TIMELOCK, sig)).to.equal(true, `missing permission: ${sig}`);
      }
    });
  });
});
