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
  NEW_DEVIATION_SENTINEL_IMPL,
  PROXY_ADMIN,
} from "../../vips/vip-661/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import DEVIATION_SENTINEL_ABI from "./abi/DeviationSentinel.json";
import EBRAKE_ABI from "./abi/EBrake.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";

const { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN } = NETWORK_ADDRESSES.bscmainnet;
const TIMELOCKS = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];

// Permissions EBrake needs on the Core Pool Comptroller (host = comptroller)
const EBRAKE_COMPTROLLER_PERMS = [
  "_setActionsPaused(address[],uint8[],bool)",
  "setCollateralFactor(uint96,address,uint256,uint256)",
  "_setMarketBorrowCaps(address[],uint256[])",
  "_setMarketSupplyCaps(address[],uint256[])",
  "setFlashLoanPaused(bool)",
];

// Permissions DeviationSentinel will have on EBrake (host = EBrake)
const SENTINEL_EBRAKE_PERMS = ["pauseBorrow(address)", "pauseSupply(address)", "setCFZero(address)"];

// Permissions DeviationSentinel had directly on the comptroller in VIP-590 and that this VIP revokes
const SENTINEL_COMPTROLLER_PERMS_TO_REVOKE = [
  "setActionsPaused(address[],uint8[],bool)",
  "_setActionsPaused(address[],uint8[],bool)",
  "setCollateralFactor(uint96,address,uint256,uint256)",
];

forking(91124514, async () => {
  let accessControlManager: Contract;
  let deviationSentinel: Contract;
  let proxyAdmin: Contract;

  // Impersonated host contracts — BSC mainnet ACM exposes isAllowedToCall(account, sig)
  // where the host contract MUST be msg.sender. So we impersonate the host and call from it.
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
        expect(await acm.isAllowedToCall(EBRAKE, sig)).to.equal(false);
      }
    });

    it("Guardian and governance timelocks should not yet have resetMarketState permission on EBrake", async () => {
      const acm = accessControlManager.connect(impersonatedEBrake);
      for (const account of [GUARDIAN, ...TIMELOCKS]) {
        expect(await acm.isAllowedToCall(account, "resetMarketState(address)")).to.equal(false);
      }
    });

    it("DeviationSentinel should not yet have any permissions on EBrake", async () => {
      const acm = accessControlManager.connect(impersonatedEBrake);
      for (const sig of SENTINEL_EBRAKE_PERMS) {
        expect(await acm.isAllowedToCall(DEVIATION_SENTINEL, sig)).to.equal(false);
      }
    });

    it("DeviationSentinel should still have direct comptroller permissions from VIP-590", async () => {
      const acm = accessControlManager.connect(impersonatedComptroller);
      for (const sig of SENTINEL_COMPTROLLER_PERMS_TO_REVOKE) {
        expect(await acm.isAllowedToCall(DEVIATION_SENTINEL, sig)).to.equal(true);
      }
    });
  });

  testVip("VIP-661 [BNB Chain] Configure EBrake-integrated DeviationSentinel", await vip661(), {
    callbackAfterExecution: async txResponse => {
      // 12 giveCallPermission calls:
      //  - 5 EBrake on Core Pool Comptroller
      //  - 4 resetMarketState (Guardian + 3 timelocks)
      //  - 3 DeviationSentinel on EBrake
      // 3 revokeCallPermission calls (DeviationSentinel direct comptroller perms from VIP-590)
      // BSC mainnet ACM emits RoleGranted/RoleRevoked from the underlying AccessControl base.
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleGranted"], [12]);
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
        expect(await acm.isAllowedToCall(EBRAKE, sig)).to.equal(true);
      }
    });

    it("Guardian and governance timelocks should have resetMarketState permission on EBrake", async () => {
      const acm = accessControlManager.connect(impersonatedEBrake);
      for (const account of [GUARDIAN, ...TIMELOCKS]) {
        expect(await acm.isAllowedToCall(account, "resetMarketState(address)")).to.equal(true);
      }
    });

    it("DeviationSentinel should have pauseBorrow / pauseSupply / setCFZero permissions on EBrake", async () => {
      const acm = accessControlManager.connect(impersonatedEBrake);
      for (const sig of SENTINEL_EBRAKE_PERMS) {
        expect(await acm.isAllowedToCall(DEVIATION_SENTINEL, sig)).to.equal(true);
      }
    });

    it("DeviationSentinel should no longer have direct comptroller permissions (revoked)", async () => {
      const acm = accessControlManager.connect(impersonatedComptroller);
      for (const sig of SENTINEL_COMPTROLLER_PERMS_TO_REVOKE) {
        expect(await acm.isAllowedToCall(DEVIATION_SENTINEL, sig)).to.equal(false);
      }
    });

    // Smoke tests on the wired-up contracts
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
