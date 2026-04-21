import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip665, {
  COMPTROLLER_DBO_SETTER,
  COMPTROLLER_LENS,
  DBO_GOVERNANCE_FUNCTIONS,
  DBO_KEEPER_FUNCTIONS,
  DEVIATION_BOUNDED_ORACLE,
  EXPECTED_PERMISSION_GRANTED_EVENTS,
  TIMELOCKS,
  UNITROLLER_IMPLEMENTATION,
  VAI_CONTROLLER_IMPL,
} from "../../vips/vip-665/bsctestnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import DBO_ABI from "./abi/DeviationBoundedOracle.json";
import DIAMOND_ABI from "./abi/Diamond.json";
import VAI_UNITROLLER_ABI from "./abi/VAIUnitroller.json";
import { cutParams } from "./utils/cut-params-bsctestnet.json";

const { bsctestnet } = NETWORK_ADDRESSES;
const { NORMAL_TIMELOCK, GUARDIAN, ACCESS_CONTROL_MANAGER, UNITROLLER, VAI_UNITROLLER } = bsctestnet;

const FORK_BLOCK = 102810984;

// Function selector for setDeviationBoundedOracle(address), used to verify the
// new selector is installed on the new SetterFacet after the diamondCut.
const SET_DBO_SELECTOR = ethers.utils.id("setDeviationBoundedOracle(address)").slice(0, 10);

forking(FORK_BLOCK, async () => {
  const provider = ethers.provider;

  let comptroller: Contract;
  let acm: Contract;
  let dbo: Contract;
  let vaiUnitroller: Contract;

  let oldComptrollerLens: string;
  let oldVaiImpl: string;
  let oldDiamondImpl: string;
  let oldFacetAddresses: string[];

  before(async () => {
    comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, provider);
    acm = new ethers.Contract(ACCESS_CONTROL_MANAGER, ACM_ABI, provider);
    dbo = new ethers.Contract(DEVIATION_BOUNDED_ORACLE, DBO_ABI, provider);
    vaiUnitroller = new ethers.Contract(VAI_UNITROLLER, VAI_UNITROLLER_ABI, provider);

    oldComptrollerLens = await comptroller.comptrollerLens();
    oldVaiImpl = await vaiUnitroller.vaiControllerImplementation();
    oldDiamondImpl = await comptroller.comptrollerImplementation();
    oldFacetAddresses = [...(await comptroller.facetAddresses())];
  });

  // ────────────────────────────────────────────────────────────────────────
  // PRE-VIP STATE — verify each phase's starting condition
  // ────────────────────────────────────────────────────────────────────────

  describe("Pre-VIP state", () => {
    describe("Phase 1 — ACM permissions are NOT yet granted", () => {
      it("governance setters are not callable by any timelock", async () => {
        for (const sig of DBO_GOVERNANCE_FUNCTIONS) {
          for (const caller of TIMELOCKS) {
            expect(
              await acm.hasPermission(caller, DEVIATION_BOUNDED_ORACLE, sig),
              `${caller} should NOT be allowed to call ${sig} on DBO pre-VIP`,
            ).to.equal(false);
          }
        }
      });

      it("keeper actions are not callable by timelocks or guardian", async () => {
        for (const sig of DBO_KEEPER_FUNCTIONS) {
          for (const caller of [...TIMELOCKS, GUARDIAN]) {
            expect(
              await acm.hasPermission(caller, DEVIATION_BOUNDED_ORACLE, sig),
              `${caller} should NOT be allowed to call ${sig} on DBO pre-VIP`,
            ).to.equal(false);
          }
        }
      });

      it("setDeviationBoundedOracle is not callable by any timelock", async () => {
        for (const timelock of TIMELOCKS) {
          expect(await acm.hasPermission(timelock, UNITROLLER, COMPTROLLER_DBO_SETTER)).to.equal(false);
        }
      });
    });

    describe("Phase 2 — DBO ownership is pending", () => {
      it("owner is still the deployer (not the timelock)", async () => {
        expect(await dbo.owner()).to.not.equal(NORMAL_TIMELOCK);
      });

      it("pendingOwner is the normal timelock", async () => {
        expect(await dbo.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      });
    });

    describe("Phase 3 — Unitroller implementation has NOT been swapped", () => {
      it("Unitroller does not yet point at the new Diamond implementation", async () => {
        expect(oldDiamondImpl).to.not.equal(UNITROLLER_IMPLEMENTATION);
      });

      it("Unitroller has no pending implementation set", async () => {
        expect(await comptroller.pendingComptrollerImplementation()).to.equal(ethers.constants.AddressZero);
      });
    });

    describe("Phase 4 — new facet selectors are NOT yet installed", () => {
      it("setDeviationBoundedOracle selector resolves to the zero address", async () => {
        const facet = await comptroller.facetAddress(SET_DBO_SELECTOR);

        expect(facet.facetAddress).to.equal(ethers.constants.AddressZero);
      });
    });

    describe("Phase 5 — ComptrollerLens is still the old one", () => {
      it("current comptrollerLens is NOT the newly deployed one", async () => {
        expect(oldComptrollerLens).to.not.equal(COMPTROLLER_LENS);
      });
    });

    describe("Phase 6 — VAIController implementation has not been swapped", () => {
      it("VaiUnitroller does not yet point at the new implementation", async () => {
        expect(oldVaiImpl).to.not.equal(VAI_CONTROLLER_IMPL);
      });

      it("VaiUnitroller has no pending implementation set", async () => {
        expect(await vaiUnitroller.pendingVAIControllerImplementation()).to.equal(ethers.constants.AddressZero);
      });
    });

    describe("Phase 7 — DBO is not yet wired on Comptroller", () => {
      it("deviationBoundedOracle() reverts — selector not installed pre-Phase 4", async () => {
        await expect(comptroller.deviationBoundedOracle()).to.be.reverted;
      });
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // EXECUTE VIP — and assert emitted events for each phase
  // ────────────────────────────────────────────────────────────────────────

  testVip("VIP-665 DBO Rollout on BNB Chain Testnet", await vip665(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      // Phase 1 — PermissionGranted events (see EXPECTED_PERMISSION_GRANTED_EVENTS in vip-665/bsctestnet.ts)
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [EXPECTED_PERMISSION_GRANTED_EVENTS]);

      // Phase 2 — DBO OwnershipTransferred
      await expectEvents(txResponse, [DBO_ABI], ["OwnershipTransferred"], [1]);

      // Phase 3 + Phase 6 — Unitroller and VaiUnitroller impl swaps.
      //     NewImplementation         = 2 (Unitroller + VaiUnitroller)
      //     NewPendingImplementation  = 4 (2 per proxy)
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewImplementation", "NewPendingImplementation"], [2, 4]);

      // Phase 4 — DiamondCut
      await expectEvents(txResponse, [DIAMOND_ABI], ["DiamondCut"], [1]);

      // Phase 5 — NewComptrollerLens (Comptroller emits this)
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewComptrollerLens"], [1]);

      // Phase 7 — NewDeviationBoundedOracle
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewDeviationBoundedOracle"], [1]);
    },
  });

  // ────────────────────────────────────────────────────────────────────────
  // POST-VIP STATE — verify each phase landed
  // ────────────────────────────────────────────────────────────────────────

  describe("Post-VIP state", () => {
    describe("Phase 1 — ACM permissions granted for every target/caller tuple", () => {
      it("governance setters callable by 3 timelocks", async () => {
        for (const sig of DBO_GOVERNANCE_FUNCTIONS) {
          for (const caller of TIMELOCKS) {
            expect(
              await acm.hasPermission(caller, DEVIATION_BOUNDED_ORACLE, sig),
              `${caller} should be allowed to call ${sig} on DBO`,
            ).to.equal(true);
          }
        }
      });

      it("keeper actions callable by 3 timelocks + Guardian", async () => {
        for (const sig of DBO_KEEPER_FUNCTIONS) {
          for (const caller of [...TIMELOCKS, GUARDIAN]) {
            expect(
              await acm.hasPermission(caller, DEVIATION_BOUNDED_ORACLE, sig),
              `${caller} should be allowed to call ${sig} on DBO`,
            ).to.equal(true);
          }
        }
      });

      it("setDeviationBoundedOracle callable by all 3 timelocks", async () => {
        for (const timelock of TIMELOCKS) {
          expect(await acm.hasPermission(timelock, UNITROLLER, COMPTROLLER_DBO_SETTER)).to.equal(true);
        }
      });
    });

    describe("Phase 2 — DBO ownership accepted", () => {
      it("owner is the normal timelock", async () => {
        expect(await dbo.owner()).to.equal(NORMAL_TIMELOCK);
      });

      it("pendingOwner is cleared", async () => {
        expect(await dbo.pendingOwner()).to.equal(ethers.constants.AddressZero);
      });
    });

    describe("Phase 3 — Unitroller implementation swapped", () => {
      it("Unitroller points at the new Diamond implementation", async () => {
        expect(await comptroller.comptrollerImplementation()).to.equal(UNITROLLER_IMPLEMENTATION);
      });

      it("pending implementation slot is cleared", async () => {
        expect(await comptroller.pendingComptrollerImplementation()).to.equal(ethers.constants.AddressZero);
      });
    });

    describe("Phase 4 — diamondCut applied", () => {
      it("every selector in cutParams resolves to its new facet address", async () => {
        for (const [facetAddr, , selectors] of cutParams as [string, number, string[]][]) {
          for (const sel of selectors) {
            expect((await comptroller.facetAddress(sel)).facetAddress).to.equal(facetAddr);
          }
        }
      });

      it("setDeviationBoundedOracle selector resolves to a non-zero facet", async () => {
        const resolved = (await comptroller.facetAddress(SET_DBO_SELECTOR)).facetAddress;
        expect(resolved).to.not.equal(ethers.constants.AddressZero);
      });

      it("all old facet addresses have been replaced", async () => {
        for (const oldFacet of oldFacetAddresses) {
          // Old facets that were replaced should no longer appear in facetAddresses()
          const selectorsOnOldFacet = await comptroller.facetFunctionSelectors(oldFacet);
          expect(selectorsOnOldFacet).to.deep.equal([]);
        }
      });
    });

    describe("Phase 5 — ComptrollerLens swapped", () => {
      it("comptrollerLens points at the new contract", async () => {
        expect(await comptroller.comptrollerLens()).to.equal(COMPTROLLER_LENS);
      });
    });

    describe("Phase 6 — VAIController implementation swapped", () => {
      it("VaiUnitroller points at the new implementation", async () => {
        expect(await vaiUnitroller.vaiControllerImplementation()).to.equal(VAI_CONTROLLER_IMPL);
      });

      it("pending implementation slot is cleared", async () => {
        expect(await vaiUnitroller.pendingVAIControllerImplementation()).to.equal(ethers.constants.AddressZero);
      });
    });

    describe("Phase 7 — DBO wired on Comptroller", () => {
      it("Comptroller.deviationBoundedOracle() returns the deployed DBO", async () => {
        expect(await comptroller.deviationBoundedOracle()).to.equal(DEVIATION_BOUNDED_ORACLE);
      });
    });
  });
});
