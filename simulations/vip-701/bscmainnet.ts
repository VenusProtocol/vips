import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip701, {
  ACM,
  EBRAKE,
  EBRAKE_EXECUTOR_PERMS,
  EXECUTOR,
  EXECUTOR_GOVERNANCE_PERMS,
  EXECUTOR_MONITOR_PERMS,
  SIGNAL_MONITOR,
} from "../../vips/vip-701/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN } = NETWORK_ADDRESSES.bscmainnet;
const EXECUTOR_GOVERNANCE_ACCOUNTS = [GUARDIAN, NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];

// TODO: set to a block after Executor is deployed on BSC mainnet
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

    it("Guardian and Timelocks should not yet have setMarketConfig permission on Executor", async () => {
      const acm = accessControlManager.connect(impersonatedExecutor);
      for (const account of EXECUTOR_GOVERNANCE_ACCOUNTS) {
        for (const sig of EXECUTOR_GOVERNANCE_PERMS) {
          expect(await acm.isAllowedToCall(account, sig)).to.equal(
            false,
            `unexpected permission ${sig} for ${account}`,
          );
        }
      }
    });
  });

  testVip("VIP-701 [BNB Chain] Configure tighten-only Executor", await vip701(), {
    callbackAfterExecution: async txResponse => {
      // RoleGranted: 4 (monitor on Executor) + 5 (Executor on EBrake) + 4 (Guardian + 3 timelocks setMarketConfig) = 13
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleGranted"], [13]);
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

    it("Guardian and Timelocks should have setMarketConfig permission on Executor", async () => {
      const acm = accessControlManager.connect(impersonatedExecutor);
      for (const account of EXECUTOR_GOVERNANCE_ACCOUNTS) {
        for (const sig of EXECUTOR_GOVERNANCE_PERMS) {
          expect(await acm.isAllowedToCall(account, sig)).to.equal(true, `missing permission ${sig} for ${account}`);
        }
      }
    });
  });
});
