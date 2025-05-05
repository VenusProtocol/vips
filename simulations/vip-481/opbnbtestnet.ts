import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  OPBNBTESTNET_NEW_VTOKEN_IMPLEMENTATION,
  OPBNBTESTNET_NEW_XVS_VAULT_IMPLEMENTATION,
  OPBNBTESTNET_VTOKEN_BEACON,
  OPBNBTESTNET_XVS_VAULT_PROXY,
  vip481,
} from "../../vips/vip-481/bsctestnet";
import RATE_MODEL_ABI from "./abi/JumpRateModelV2.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import PROXY_ABI from "./abi/manualProxy.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import VTOKEN_BEACON_ABI from "./abi/vtokenBeacon.json";
import { RateCurvePoints, VTokenContractAndSymbol, getAllVTokens, getRateCurve } from "./common";

forking(58828306, async () => {
  const xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, OPBNBTESTNET_XVS_VAULT_PROXY);
  const xvsVaultProxy = await ethers.getContractAt(PROXY_ABI, OPBNBTESTNET_XVS_VAULT_PROXY);
  const vTokenBeacon = await ethers.getContractAt(VTOKEN_BEACON_ABI, OPBNBTESTNET_VTOKEN_BEACON);
  const poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, NETWORK_ADDRESSES.opbnbtestnet.POOL_REGISTRY);
  const allVTokens = await getAllVTokens(poolRegistry);

  const oldRates: Record<string, RateCurvePoints> = Object.fromEntries(
    await Promise.all(
      allVTokens.map(async (vToken: VTokenContractAndSymbol) => {
        return [vToken.symbol, await getRateCurve(vToken.contract)];
      }),
    ),
  );

  describe("Pre-VIP behaviour", () => {
    describe("Old Implementations & old block rate", () => {
      describe("XVS Vault", () => {
        it("XVSVAULT should not point to new impl", async () => {
          expect(await xvsVaultProxy.implementation()).not.equals(OPBNBTESTNET_NEW_XVS_VAULT_IMPLEMENTATION);
        });
        it("XVSVAULT should have block rate of 31536000", async () => {
          expect(await xvsVault.blocksOrSecondsPerYear()).equals(31536000);
        });
      });

      describe("VToken", () => {
        it("VToken beacon should not point to new impl", async () => {
          expect(await vTokenBeacon.implementation()).not.equals(OPBNBTESTNET_NEW_VTOKEN_IMPLEMENTATION);
        });

        for (const vToken of allVTokens) {
          it(`${vToken.symbol} should have old block rate in IL`, async () => {
            expect(await vToken.contract.blocksOrSecondsPerYear()).equals(31536000);
          });
        }
      });
    });
  });

  testForkedNetworkVipCommands("VIP-475", await vip481(), {});

  describe("Post-VIP behavior", () => {
    describe("Should point to new impl and have updated block rate", () => {
      describe("XVS Vault", () => {
        it("XVSVAULT should point to new impl", async () => {
          expect(await xvsVaultProxy.implementation()).equals(OPBNBTESTNET_NEW_XVS_VAULT_IMPLEMENTATION);
        });
        it("XVSVAULT should have block rate of 63072000", async () => {
          expect(await xvsVault.blocksOrSecondsPerYear()).equals(63072000);
        });
      });

      describe("VToken", () => {
        it("VToken beacon should point to new impl", async () => {
          expect(await vTokenBeacon.implementation()).equals(OPBNBTESTNET_NEW_VTOKEN_IMPLEMENTATION);
        });

        for (const vToken of allVTokens) {
          it(`${vToken.symbol} should have new block rate in IL`, async () => {
            expect(await vToken.contract.blocksOrSecondsPerYear()).equals(63072000);
          });
        }
      });
    });

    describe("Interest rates", () => {
      for (const vToken of allVTokens) {
        const oldRateCurve = oldRates[vToken.symbol];
        let newRateCurve: RateCurvePoints;

        before(async () => {
          newRateCurve = await getRateCurve(vToken.contract);
        });

        describe(`${vToken.symbol} rate curve`, () => {
          it("has the same utilization points", async () => {
            for (const [idx] of oldRateCurve.entries()) {
              expect(oldRateCurve[idx].utilizationRate).to.equal(newRateCurve[idx].utilizationRate);
            }
          });

          it("has new supply rate ≈ old supply rate / 2 at all utilizations", async () => {
            for (const [idx] of oldRateCurve.entries()) {
              const expectedSupplyRate = oldRateCurve[idx].supplyRate.div(2);
              expect(newRateCurve[idx].supplyRate).to.be.closeTo(expectedSupplyRate, 5);
            }
          });

          it("has new borrow rate ≈ old borrow rate / 2 at all utilizations", async () => {
            for (const [idx] of oldRateCurve.entries()) {
              const expectedBorrowRate = oldRateCurve[idx].borrowRate.div(2);
              expect(newRateCurve[idx].borrowRate).to.be.closeTo(expectedBorrowRate, 5);
            }
          });

          it("set to 63072000 blocks per year", async () => {
            const rateModelAddress = await vToken.contract.interestRateModel();
            const rateModel = await ethers.getContractAt(RATE_MODEL_ABI, rateModelAddress);
            expect(await rateModel.blocksOrSecondsPerYear()).to.equal(63072000);
          });
        });
      }
    });
  });
});
