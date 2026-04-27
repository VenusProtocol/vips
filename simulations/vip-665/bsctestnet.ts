import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
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
  let oldSelectorsByFacet: Record<string, string[]>;

  // Storage-layout spot-check snapshots (V1 storage — unchanged through V19).
  let oldAdmin: string;
  let oldCloseFactorMantissa: BigNumber;
  let oldMaxAssets: BigNumber;

  before(async () => {
    comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, provider);
    acm = new ethers.Contract(ACCESS_CONTROL_MANAGER, ACM_ABI, provider);
    dbo = new ethers.Contract(DEVIATION_BOUNDED_ORACLE, DBO_ABI, provider);
    vaiUnitroller = new ethers.Contract(VAI_UNITROLLER, VAI_UNITROLLER_ABI, provider);

    oldComptrollerLens = await comptroller.comptrollerLens();
    oldVaiImpl = await vaiUnitroller.vaiControllerImplementation();
    oldDiamondImpl = await comptroller.comptrollerImplementation();
    oldFacetAddresses = [...(await comptroller.facetAddresses())];

    oldSelectorsByFacet = {};
    for (const facet of oldFacetAddresses) {
      oldSelectorsByFacet[facet] = [...(await comptroller.facetFunctionSelectors(facet))];
    }

    oldAdmin = await comptroller.admin();
    oldCloseFactorMantissa = await comptroller.closeFactorMantissa();
    oldMaxAssets = await comptroller.maxAssets();
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

    describe("Phase 2 — Comptroller updates have NOT been applied", () => {
      describe("Step 1 — Unitroller implementation not yet swapped", () => {
        it("Unitroller does not yet point at the new Diamond implementation", async () => {
          expect(oldDiamondImpl).to.not.equal(UNITROLLER_IMPLEMENTATION);
        });

        it("Unitroller has no pending implementation set", async () => {
          expect(await comptroller.pendingComptrollerImplementation()).to.equal(ethers.constants.AddressZero);
        });
      });

      describe("Step 2 — new facet selectors are NOT yet installed", () => {
        it("setDeviationBoundedOracle selector resolves to the zero address", async () => {
          const facet = await comptroller.facetAddress(SET_DBO_SELECTOR);
          expect(facet.facetAddress).to.equal(ethers.constants.AddressZero);
        });
      });

      describe("Step 3 — ComptrollerLens is still the old one", () => {
        it("current comptrollerLens is NOT the newly deployed one", async () => {
          expect(oldComptrollerLens).to.not.equal(COMPTROLLER_LENS);
        });
      });

      describe("Step 4 — VAIController implementation has not been swapped", () => {
        it("VaiUnitroller does not yet point at the new implementation", async () => {
          expect(oldVaiImpl).to.not.equal(VAI_CONTROLLER_IMPL);
        });

        it("VaiUnitroller has no pending implementation set", async () => {
          expect(await vaiUnitroller.pendingVAIControllerImplementation()).to.equal(ethers.constants.AddressZero);
        });
      });
    });

    describe("Phase 3 — Wiring has NOT happened yet", () => {
      describe("Step 1 — DBO ownership is pending", () => {
        it("owner is still the deployer (not the timelock)", async () => {
          expect(await dbo.owner()).to.not.equal(NORMAL_TIMELOCK);
        });

        it("pendingOwner is the normal timelock", async () => {
          expect(await dbo.pendingOwner()).to.equal(NORMAL_TIMELOCK);
        });
      });

      describe("Step 2 — DBO is not yet wired on Comptroller", () => {
        it("deviationBoundedOracle() reverts — selector not installed pre-cut", async () => {
          await expect(comptroller.deviationBoundedOracle()).to.be.reverted;
        });
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

      // Phase 2 Step 1 + Step 4 — Unitroller and VaiUnitroller impl swaps.
      //     NewImplementation         = 2 (Unitroller + VaiUnitroller)
      //     NewPendingImplementation  = 4 (2 per proxy)
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewImplementation", "NewPendingImplementation"], [2, 4]);

      // Phase 2 Step 2 — DiamondCut
      await expectEvents(txResponse, [DIAMOND_ABI], ["DiamondCut"], [1]);

      // Phase 2 Step 3 — NewComptrollerLens
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewComptrollerLens"], [1]);

      // Phase 3 Step 1 — DBO OwnershipTransferred
      await expectEvents(txResponse, [DBO_ABI], ["OwnershipTransferred"], [1]);

      // Phase 3 Step 2 — NewDeviationBoundedOracle
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewDeviationBoundedOracle"], [1]);
    },
  });

  // ────────────────────────────────────────────────────────────────────────
  // POST-VIP STATE — verify each phase and step landed
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

    describe("Phase 2 — Comptroller updates applied", () => {
      describe("Step 1 — Unitroller implementation swapped", () => {
        it("Unitroller points at the new Diamond implementation", async () => {
          expect(await comptroller.comptrollerImplementation()).to.equal(UNITROLLER_IMPLEMENTATION);
        });

        it("pending implementation slot is cleared", async () => {
          expect(await comptroller.pendingComptrollerImplementation()).to.equal(ethers.constants.AddressZero);
        });
      });

      describe("Step 2 — diamondCut applied", () => {
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
            const selectorsOnOldFacet = await comptroller.facetFunctionSelectors(oldFacet);
            expect(selectorsOnOldFacet).to.deep.equal([]);
          }
        });

        it("selectors preserve their pre-VIP facet role (only addresses changed)", async () => {
          // For each Replace entry, the new facet's selector set must equal some
          // old facet's selector set exactly — catching any FacetBase-driven drift
          // that would quietly reassign a selector to a different facet role.
          const remaining: Record<string, string[]> = {};
          for (const [addr, sels] of Object.entries(oldSelectorsByFacet)) {
            remaining[addr] = [...sels].sort();
          }

          for (const [newFacet, action, selectors] of cutParams as [string, number, string[]][]) {
            if (action !== 1) continue; // Replace only; the new `Add` entry is not expected to match any old facet
            const newSels = [...(await comptroller.facetFunctionSelectors(newFacet))].sort();
            // The SetterFacet also has the newly-added selector — strip it before comparing.
            const newSelsWithoutAdd = newSels.filter(s => s !== SET_DBO_SELECTOR);

            const match = Object.entries(remaining).find(
              ([, oldSels]) =>
                oldSels.length === newSelsWithoutAdd.length && oldSels.every((s, i) => s === newSelsWithoutAdd[i]),
            );
            expect(
              match,
              `No old facet's selector set matches new facet ${newFacet}. ` +
                `new=${JSON.stringify(newSelsWithoutAdd)}. ` +
                `Selector has drifted between facet roles — check cut-params vs. pre-VIP facet mapping.`,
            ).to.not.be.undefined;

            delete remaining[match![0]];
            expect(selectors.length).to.be.greaterThan(0);
          }
        });
      });

      describe("Step 3 — ComptrollerLens swapped", () => {
        it("comptrollerLens points at the new contract", async () => {
          expect(await comptroller.comptrollerLens()).to.equal(COMPTROLLER_LENS);
        });
      });

      describe("Step 4 — VAIController implementation swapped", () => {
        it("VaiUnitroller points at the new implementation", async () => {
          expect(await vaiUnitroller.vaiControllerImplementation()).to.equal(VAI_CONTROLLER_IMPL);
        });

        it("pending implementation slot is cleared", async () => {
          expect(await vaiUnitroller.pendingVAIControllerImplementation()).to.equal(ethers.constants.AddressZero);
        });
      });

      describe("Storage layout preserved across Diamond upgrade", () => {
        // Spot-check V1 storage slots (declared before V19's `deviationBoundedOracle`
        // addition) to catch any accidental slot shift in the new implementation.
        it("admin slot unchanged", async () => {
          expect(await comptroller.admin()).to.equal(oldAdmin);
        });

        it("closeFactorMantissa slot unchanged", async () => {
          expect(await comptroller.closeFactorMantissa()).to.equal(oldCloseFactorMantissa);
        });

        it("maxAssets slot unchanged", async () => {
          expect(await comptroller.maxAssets()).to.equal(oldMaxAssets);
        });
      });
    });

    describe("Phase 3 — Wiring complete", () => {
      describe("Step 1 — DBO ownership accepted", () => {
        it("owner is the normal timelock", async () => {
          expect(await dbo.owner()).to.equal(NORMAL_TIMELOCK);
        });

        it("pendingOwner is cleared", async () => {
          expect(await dbo.pendingOwner()).to.equal(ethers.constants.AddressZero);
        });
      });

      describe("Step 2 — DBO wired on Comptroller", () => {
        it("Comptroller.deviationBoundedOracle() returns the deployed DBO", async () => {
          expect(await comptroller.deviationBoundedOracle()).to.equal(DEVIATION_BOUNDED_ORACLE);
        });
      });
    });
  });
});
