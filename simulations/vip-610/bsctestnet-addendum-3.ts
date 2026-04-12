import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  ACM,
  DEVIATION_SENTINEL,
  EBRAKE,
  KEEPER_ADDRESS,
  NEW_DEVIATION_SENTINEL_IMPL,
  NEW_EBRAKE_IMPL,
  PROXY_ADMIN,
  vip661TestnetAddendum3,
} from "../../vips/vip-661/bsctestnet-addendum-3";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import DEVIATION_SENTINEL_ABI from "./abi/DeviationSentinel.json";
import EBRAKE_ABI from "./abi/EBrake.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";

const { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK } = NETWORK_ADDRESSES.bsctestnet;
const TIMELOCKS = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];
// All accounts that had resetMarketState and will receive the new granular reset permissions
const RESET_ACCOUNTS = [...TIMELOCKS, KEEPER_ADDRESS];

// Granular snapshot-reset functions (replace resetMarketState)
const RESET_PERMS = ["resetCFSnapshot(address)", "resetBorrowCapSnapshot(address)", "resetSupplyCapSnapshot(address)"];

// All EBrake action functions governance/timelocks/keeper can call directly
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

// New Comptroller permissions EBrake needs for the new surgical controls
const NEW_EBRAKE_COMPTROLLER_PERMS = [
  "setIsBorrowAllowed(uint96,address,bool)",
  "setWhiteListFlashLoanAccount(address,bool)",
];

forking(100849419, async () => {
  let accessControlManager: Contract;
  let proxyAdmin: Contract;
  let deviationSentinel: Contract;

  before(async () => {
    accessControlManager = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ACM);
    proxyAdmin = new ethers.Contract(PROXY_ADMIN, PROXY_ADMIN_ABI, ethers.provider);
    deviationSentinel = await ethers.getContractAt(DEVIATION_SENTINEL_ABI, DEVIATION_SENTINEL);
  });

  describe("Pre-VIP behavior", () => {
    it("EBrake proxy should not yet point to the audit-fixed implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(EBRAKE)).to.not.equal(NEW_EBRAKE_IMPL);
    });

    it("DeviationSentinel proxy should not yet point to the new implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(DEVIATION_SENTINEL)).to.not.equal(NEW_DEVIATION_SENTINEL_IMPL);
    });

    it("DeviationSentinel should still have old setCFZero permission on EBrake", async () => {
      expect(await accessControlManager.hasPermission(DEVIATION_SENTINEL, EBRAKE, "setCFZero(address)")).to.equal(true);
    });

    it("DeviationSentinel should not yet have decreaseCF permission on EBrake", async () => {
      expect(
        await accessControlManager.hasPermission(DEVIATION_SENTINEL, EBRAKE, "decreaseCF(address,uint256)"),
      ).to.equal(false);
    });

    it("Timelocks and keeper should still have resetMarketState permission", async () => {
      // Timelocks were granted at address(0) in bsctestnet.ts
      for (const account of TIMELOCKS) {
        expect(
          await accessControlManager.hasPermission(account, ethers.constants.AddressZero, "resetMarketState(address)"),
        ).to.equal(true, `expected resetMarketState for ${account}`);
      }
      // Keeper was granted at EBRAKE specifically in Addendum 1
      expect(await accessControlManager.hasPermission(KEEPER_ADDRESS, EBRAKE, "resetMarketState(address)")).to.equal(
        true,
      );
    });

    it("Timelocks and keeper should not yet have granular reset permissions", async () => {
      for (const account of RESET_ACCOUNTS) {
        for (const sig of RESET_PERMS) {
          expect(await accessControlManager.hasPermission(account, ethers.constants.AddressZero, sig)).to.equal(
            false,
            `unexpected permission: ${sig} for ${account}`,
          );
        }
      }
    });

    it("EBrake should not yet have new Comptroller permissions", async () => {
      for (const sig of NEW_EBRAKE_COMPTROLLER_PERMS) {
        expect(await accessControlManager.hasPermission(EBRAKE, ethers.constants.AddressZero, sig)).to.equal(
          false,
          `unexpected permission: ${sig}`,
        );
      }
    });

    it("Timelocks and keeper should not yet have new EBrake-unique function permissions", async () => {
      // setMarketBorrowCaps/setMarketSupplyCaps share names with comptroller functions that timelocks
      // already have granted at address(0) from prior governance VIPs — skip those here.
      const ebrakeUnique = GOVERNANCE_EBRAKE_PERMS.filter(
        sig => sig !== "setMarketBorrowCaps(address[],uint256[])" && sig !== "setMarketSupplyCaps(address[],uint256[])",
      );
      for (const account of RESET_ACCOUNTS) {
        for (const sig of ebrakeUnique) {
          expect(await accessControlManager.hasPermission(account, ethers.constants.AddressZero, sig)).to.equal(
            false,
            `unexpected permission: ${sig} for ${account}`,
          );
        }
      }
    });
  });

  testVip("VIP-661 Addendum 3: Apply Phase-0 Audit Fixes (EBrake) on BSC Testnet", await vip661TestnetAddendum3(), {
    callbackAfterExecution: async txResponse => {
      // PermissionRevoked breakdown:
      //  - 1  setCFZero from DeviationSentinel on EBrake
      //  - 3  resetMarketState from [3 timelocks] at address(0)  (bsctestnet.ts grants)
      //  - 1  resetMarketState from NormalTimelock at EBRAKE     (Addendum 1 grant)
      //  - 1  resetMarketState from Keeper at EBRAKE             (Addendum 1 grant)
      // PermissionGranted breakdown:
      //  - 1  decreaseCF(address,uint256) for DeviationSentinel on EBrake
      //  - 12 granular reset functions (3 × 4 accounts)
      //  - 2  new Comptroller permissions for EBrake (setIsBorrowAllowed, setWhiteListFlashLoanAccount)
      //  - 48 governance EBrake action functions (12 functions × 4 accounts)
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [63]);
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionRevoked"], [6]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("EBrake proxy should point to the audit-fixed implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(EBRAKE)).to.equal(NEW_EBRAKE_IMPL);
    });

    it("DeviationSentinel proxy should point to the new implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(DEVIATION_SENTINEL)).to.equal(NEW_DEVIATION_SENTINEL_IMPL);
    });

    it("DeviationSentinel should no longer have setCFZero permission on EBrake", async () => {
      expect(await accessControlManager.hasPermission(DEVIATION_SENTINEL, EBRAKE, "setCFZero(address)")).to.equal(
        false,
      );
    });

    it("DeviationSentinel should have decreaseCF permission on EBrake", async () => {
      expect(
        await accessControlManager.hasPermission(DEVIATION_SENTINEL, EBRAKE, "decreaseCF(address,uint256)"),
      ).to.equal(true);
    });

    it("Timelocks and keeper should no longer have resetMarketState permission", async () => {
      for (const account of RESET_ACCOUNTS) {
        expect(
          await accessControlManager.hasPermission(account, ethers.constants.AddressZero, "resetMarketState(address)"),
        ).to.equal(false, `unexpected resetMarketState for ${account}`);
      }
    });

    it("Timelocks and keeper should have all three granular reset permissions", async () => {
      for (const account of RESET_ACCOUNTS) {
        for (const sig of RESET_PERMS) {
          expect(await accessControlManager.hasPermission(account, ethers.constants.AddressZero, sig)).to.equal(
            true,
            `missing permission: ${sig} for ${account}`,
          );
        }
      }
    });

    it("EBrake should have new Comptroller permissions for surgical controls", async () => {
      for (const sig of NEW_EBRAKE_COMPTROLLER_PERMS) {
        expect(await accessControlManager.hasPermission(EBRAKE, ethers.constants.AddressZero, sig)).to.equal(
          true,
          `missing permission: ${sig}`,
        );
      }
    });

    it("Timelocks and keeper should have all new EBrake function permissions", async () => {
      for (const account of RESET_ACCOUNTS) {
        for (const sig of GOVERNANCE_EBRAKE_PERMS) {
          expect(await accessControlManager.hasPermission(account, ethers.constants.AddressZero, sig)).to.equal(
            true,
            `missing permission: ${sig} for ${account}`,
          );
        }
      }
    });

    it("DeviationSentinel.EBRAKE should still equal the deployed EBrake address", async () => {
      expect(await deviationSentinel.EBRAKE()).to.equal(EBRAKE);
    });

    it("EBrake.IS_ISOLATED_POOL should be false (Core Pool Diamond)", async () => {
      const eBrake = await ethers.getContractAt(EBRAKE_ABI, EBRAKE);
      expect(await eBrake.IS_ISOLATED_POOL()).to.equal(false);
    });
  });
});
