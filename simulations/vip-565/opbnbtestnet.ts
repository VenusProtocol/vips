import { mine, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip565, {
  NEW_OPBNB_BLOCK_RATE,
  OPBNBTESTNET_ACM,
  OPBNBTESTNET_NEW_VTOKEN_IMPLEMENTATION,
  OPBNBTESTNET_RATE_MODEL_SETTER,
  OPBNBTESTNET_VTOKEN_BEACON,
  OPBNBTESTNET_XVS_VAULT_PROXY,
} from "../../vips/vip-565/bsctestnet";
import ACM_ABI from "./abi/ACM.json";
import RATE_MODEL_ABI from "./abi/JumpRateModelV2.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import VTOKEN_BEACON_ABI from "./abi/vtokenBeacon.json";
import { RateCurvePoints, VTokenContractAndSymbol, getAllVTokens, getRateCurve } from "./common";

const OPBNBTESTNET_CHECKPOINT = 1762398000;

forking(94089034, async () => {
  const xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, OPBNBTESTNET_XVS_VAULT_PROXY);
  const vTokenBeacon = await ethers.getContractAt(VTOKEN_BEACON_ABI, OPBNBTESTNET_VTOKEN_BEACON);
  const acm = await ethers.getContractAt(ACM_ABI, OPBNBTESTNET_ACM);
  const poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, NETWORK_ADDRESSES.opbnbtestnet.POOL_REGISTRY);
  const allVTokens = await getAllVTokens(poolRegistry);

  const oldRates: Record<string, RateCurvePoints> = Object.fromEntries(
    await Promise.all(
      allVTokens.map(async (vToken: VTokenContractAndSymbol) => {
        return [vToken.symbol, await getRateCurve(vToken.contract)];
      }),
    ),
  );

  describe("Pre-VIP behaviour", async () => {
    it("VToken beacon should not point to new implementation", async () => {
      const currentImplementation = await vTokenBeacon.implementation();
      expect(currentImplementation).to.not.equal(OPBNBTESTNET_NEW_VTOKEN_IMPLEMENTATION);
    });

    it("XVS Vault should not have new block rate", async () => {
      const currentBlockRate = await xvsVault.blocksOrSecondsPerYear();
      expect(currentBlockRate).to.not.equal(NEW_OPBNB_BLOCK_RATE);
    });

    it("Rate model setter should not have permission before VIP", async () => {
      const role = ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["address", "string"],
          [ethers.constants.AddressZero, "setInterestRateModel(address)"],
        ),
      );
      const hasPermission = await acm.hasRole(role, OPBNBTESTNET_RATE_MODEL_SETTER);
      expect(hasPermission).to.be.false;
    });
  });

  testForkedNetworkVipCommands("VIP-562 Fourier Hardfork OPBNB", await vip565(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [VTOKEN_BEACON_ABI, XVS_VAULT_ABI, ACM_ABI],
        ["Upgraded", "SetBlocksPerYear", "PermissionGranted", "PermissionRevoked"],
        [1, 1, 1, 1],
      );
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("VToken beacon should point to new implementation", async () => {
      const currentImplementation = await vTokenBeacon.implementation();
      expect(currentImplementation).to.equal(OPBNBTESTNET_NEW_VTOKEN_IMPLEMENTATION);
    });

    it("XVS Vault should have new block rate", async () => {
      const currentBlockRate = await xvsVault.blocksOrSecondsPerYear();
      expect(currentBlockRate).to.equal(NEW_OPBNB_BLOCK_RATE);
    });

    it("Rate model setter should not have permission after VIP (permission revoked)", async () => {
      const role = ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["address", "string"],
          [ethers.constants.AddressZero, "setInterestRateModel(address)"],
        ),
      );
      const hasPermission = await acm.hasRole(role, OPBNBTESTNET_RATE_MODEL_SETTER);
      expect(hasPermission).to.be.false;
    });

    describe("Interest rates before checkpoint", () => {
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

          it("has new supply rate = old supply rate at all utilizations", async () => {
            for (const [idx] of oldRateCurve.entries()) {
              expect(newRateCurve[idx].supplyRate).to.equal(oldRateCurve[idx].supplyRate);
            }
          });

          it("has new borrow rate = old borrow rate at all utilizations", async () => {
            for (const [idx] of oldRateCurve.entries()) {
              expect(newRateCurve[idx].borrowRate).to.equal(oldRateCurve[idx].borrowRate);
            }
          });

          it("set to 63072000 blocks per year", async () => {
            const rateModelAddress = await vToken.contract.interestRateModel();
            const rateModel = await ethers.getContractAt(RATE_MODEL_ABI, rateModelAddress);
            const blocksPerYear = await Promise.any([rateModel.blocksPerYear(), rateModel.blocksOrSecondsPerYear()]);
            expect(blocksPerYear).to.equal(63072000);
          });
        });
      }
    });

    describe("Interest rates after checkpoint", () => {
      before(async () => {
        await time.increaseTo(OPBNBTESTNET_CHECKPOINT);
        await mine();
      });
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

          it("set to 126144000 blocks per year", async () => {
            const rateModelAddress = await vToken.contract.interestRateModel();
            const rateModel = await ethers.getContractAt(RATE_MODEL_ABI, rateModelAddress);
            expect(await rateModel.blocksOrSecondsPerYear()).to.equal(NEW_OPBNB_BLOCK_RATE);
          });
        });
      }
    });
  });
});
