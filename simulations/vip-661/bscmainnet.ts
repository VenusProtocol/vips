import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip661, {
  ACM,
  CORE_POOL_COMPTROLLER,
  DEVIATION_SENTINEL,
  EBRAKE,
  MULTISIG,
  NEW_DEVIATION_SENTINEL_IMPL,
  PROXY_ADMIN,
} from "../../vips/vip-661/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import DEVIATION_SENTINEL_ABI from "./abi/DeviationSentinel.json";
import EBRAKE_ABI from "./abi/EBrake.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";

const { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN } = NETWORK_ADDRESSES.bscmainnet;
const TIMELOCKS = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];

// Permissions EBrake needs on the Core Pool Comptroller
const EBRAKE_COMPTROLLER_PERMS = [
  "_setActionsPaused(address[],uint8[],bool)",
  "setCollateralFactor(address,uint256,uint256)",
  "setCollateralFactor(uint96,address,uint256,uint256)",
  "_setMarketBorrowCaps(address[],uint256[])",
  "_setMarketSupplyCaps(address[],uint256[])",
  "setFlashLoanPaused(bool)",
  "setIsBorrowAllowed(uint96,address,bool)",
  "setWhiteListFlashLoanAccount(address,bool)",
];

// Permissions DeviationSentinel will have on EBrake
const SENTINEL_EBRAKE_PERMS = ["pauseBorrow(address)", "pauseSupply(address)", "decreaseCF(address,uint256)"];

// Granular snapshot-reset functions governance/guardian can call on EBrake
const RESET_PERMS = ["resetCFSnapshot(address)", "resetBorrowCapSnapshot(address)", "resetSupplyCapSnapshot(address)"];

// All EBrake action functions governance/guardian can call directly
// (so a Critical VIP can route through EBrake and get snapshot coverage)
const GOVERNANCE_EBRAKE_PERMS = [
  "pauseBorrow(address)",
  "pauseSupply(address)",
  "pauseRedeem(address)",
  "pauseTransfer(address)",
  "pauseFlashLoan()",
  "pauseActions(address[],uint8[])",
  "setMarketBorrowCaps(address[],uint256[])",
  "setMarketSupplyCaps(address[],uint256[])",
  "disablePoolBorrow(uint96,address)",
  "revokeFlashLoanAccess(address)",
  "decreaseCF(address,uint256)",
  "decreaseCF(address,uint96,uint256)",
];

// Permissions DeviationSentinel had directly on the comptroller in VIP-590 — this VIP revokes them
const SENTINEL_COMPTROLLER_PERMS_TO_REVOKE = [
  "setActionsPaused(address[],uint8[],bool)",
  "_setActionsPaused(address[],uint8[],bool)",
  "setCollateralFactor(uint96,address,uint256,uint256)",
];

forking(91124514, async () => {
  let accessControlManager: Contract;
  let deviationSentinel: Contract;
  let proxyAdmin: Contract;

  // BSC mainnet ACM checks msg.sender (the host contract) against the stored contract address.
  // We impersonate the host so isAllowedToCall returns the correct result.
  let impersonatedComptroller: SignerWithAddress;
  let impersonatedEBrake: SignerWithAddress;

  before(async () => {
    accessControlManager = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ACM);
    deviationSentinel = await ethers.getContractAt(DEVIATION_SENTINEL_ABI, DEVIATION_SENTINEL);
    proxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, PROXY_ADMIN);

    impersonatedComptroller = await initMainnetUser(CORE_POOL_COMPTROLLER, ethers.utils.parseEther("1"));
    impersonatedEBrake = await initMainnetUser(EBRAKE, ethers.utils.parseEther("1"));
  });

  describe("Pre-VIP behavior", () => {
    it("DeviationSentinel proxy implementation should not yet be the new EBrake-integrated one", async () => {
      expect(await proxyAdmin.getProxyImplementation(DEVIATION_SENTINEL)).to.not.equal(NEW_DEVIATION_SENTINEL_IMPL);
    });

    it("EBrake should not yet have any permissions on the Core Pool Comptroller", async () => {
      const acm = accessControlManager.connect(impersonatedComptroller);
      for (const sig of EBRAKE_COMPTROLLER_PERMS) {
        expect(await acm.isAllowedToCall(EBRAKE, sig)).to.equal(false, `unexpected permission: ${sig}`);
      }
    });

    it("Guardian and governance timelocks should not yet have granular reset permissions on EBrake", async () => {
      const acm = accessControlManager.connect(impersonatedEBrake);
      for (const account of [GUARDIAN, ...TIMELOCKS]) {
        for (const sig of RESET_PERMS) {
          expect(await acm.isAllowedToCall(account, sig)).to.equal(
            false,
            `unexpected permission: ${sig} for ${account}`,
          );
        }
      }
    });

    it("Guardian and governance timelocks should not yet have new EBrake function permissions", async () => {
      const acm = accessControlManager.connect(impersonatedEBrake);
      for (const account of [GUARDIAN, ...TIMELOCKS]) {
        for (const sig of GOVERNANCE_EBRAKE_PERMS) {
          expect(await acm.isAllowedToCall(account, sig)).to.equal(
            false,
            `unexpected permission: ${sig} for ${account}`,
          );
        }
      }
    });

    it("Multisig should not yet have EBrake action permissions", async () => {
      const acm = accessControlManager.connect(impersonatedEBrake);
      for (const sig of GOVERNANCE_EBRAKE_PERMS) {
        expect(await acm.isAllowedToCall(MULTISIG, sig)).to.equal(false, `unexpected permission: ${sig} for multisig`);
      }
    });

    it("DeviationSentinel should not yet have any permissions on EBrake", async () => {
      const acm = accessControlManager.connect(impersonatedEBrake);
      for (const sig of SENTINEL_EBRAKE_PERMS) {
        expect(await acm.isAllowedToCall(DEVIATION_SENTINEL, sig)).to.equal(false, `unexpected permission: ${sig}`);
      }
    });

    it("DeviationSentinel should still have direct comptroller permissions from VIP-590", async () => {
      const acm = accessControlManager.connect(impersonatedComptroller);
      for (const sig of SENTINEL_COMPTROLLER_PERMS_TO_REVOKE) {
        expect(await acm.isAllowedToCall(DEVIATION_SENTINEL, sig)).to.equal(true, `expected permission: ${sig}`);
      }
    });
  });

  testVip("VIP-661 [BNB Chain] Configure EBrake-integrated DeviationSentinel", await vip661(), {
    callbackAfterExecution: async txResponse => {
      // RoleGranted breakdown:
      //  - 8  EBrake on Core Pool Comptroller (6 original + setIsBorrowAllowed + setWhiteListFlashLoanAccount)
      //  - 12 granular reset functions (3 × 4 accounts: Guardian + 3 timelocks)
      //  - 3  DeviationSentinel on EBrake (pauseBorrow, pauseSupply, decreaseCF)
      //  - 48 governance EBrake action functions (12 functions × 4 accounts)
      //  - 12 EBrake action functions for Venus team multisig (emergency pausing, Phase 0)
      // RoleRevoked: 3 (DeviationSentinel direct comptroller perms from VIP-590)
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleGranted"], [83]);
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleRevoked"], [3]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("DeviationSentinel proxy should point to the new EBrake-integrated implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(DEVIATION_SENTINEL)).to.equal(NEW_DEVIATION_SENTINEL_IMPL);
    });

    it("EBrake should have all required permissions on the Core Pool Comptroller", async () => {
      const acm = accessControlManager.connect(impersonatedComptroller);
      for (const sig of EBRAKE_COMPTROLLER_PERMS) {
        expect(await acm.isAllowedToCall(EBRAKE, sig)).to.equal(true, `missing permission: ${sig}`);
      }
    });

    it("Guardian and governance timelocks should have granular reset permissions on EBrake", async () => {
      const acm = accessControlManager.connect(impersonatedEBrake);
      for (const account of [GUARDIAN, ...TIMELOCKS]) {
        for (const sig of RESET_PERMS) {
          expect(await acm.isAllowedToCall(account, sig)).to.equal(true, `missing permission: ${sig} for ${account}`);
        }
      }
    });

    it("Guardian and governance timelocks should have new EBrake function permissions", async () => {
      const acm = accessControlManager.connect(impersonatedEBrake);
      for (const account of [GUARDIAN, ...TIMELOCKS]) {
        for (const sig of GOVERNANCE_EBRAKE_PERMS) {
          expect(await acm.isAllowedToCall(account, sig)).to.equal(true, `missing permission: ${sig} for ${account}`);
        }
      }
    });

    it("Multisig should have all EBrake action permissions for emergency pausing", async () => {
      const acm = accessControlManager.connect(impersonatedEBrake);
      for (const sig of GOVERNANCE_EBRAKE_PERMS) {
        expect(await acm.isAllowedToCall(MULTISIG, sig)).to.equal(true, `missing permission: ${sig} for multisig`);
      }
    });

    it("DeviationSentinel should have pauseBorrow / pauseSupply / decreaseCF permissions on EBrake", async () => {
      const acm = accessControlManager.connect(impersonatedEBrake);
      for (const sig of SENTINEL_EBRAKE_PERMS) {
        expect(await acm.isAllowedToCall(DEVIATION_SENTINEL, sig)).to.equal(true, `missing permission: ${sig}`);
      }
    });

    it("DeviationSentinel should no longer have direct comptroller permissions (revoked)", async () => {
      const acm = accessControlManager.connect(impersonatedComptroller);
      for (const sig of SENTINEL_COMPTROLLER_PERMS_TO_REVOKE) {
        expect(await acm.isAllowedToCall(DEVIATION_SENTINEL, sig)).to.equal(false, `unexpected permission: ${sig}`);
      }
    });

    it("EBrake.COMPTROLLER should equal the Core Pool Comptroller", async () => {
      const eBrake = await ethers.getContractAt(EBRAKE_ABI, EBRAKE);
      expect(await eBrake.COMPTROLLER()).to.equal(CORE_POOL_COMPTROLLER);
    });

    it("EBrake.IS_ISOLATED_POOL should be false (Core Pool Diamond)", async () => {
      const eBrake = await ethers.getContractAt(EBRAKE_ABI, EBRAKE);
      expect(await eBrake.IS_ISOLATED_POOL()).to.equal(false);
    });

    it("DeviationSentinel.EBRAKE should equal the deployed EBrake address", async () => {
      expect(await deviationSentinel.EBRAKE()).to.equal(EBRAKE);
    });
  });
});
