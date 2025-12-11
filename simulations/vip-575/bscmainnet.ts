import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { LEVERAGE_STRATEGIES_MANAGER, SWAP_HELPER, UNITROLLER, vip575 } from "../../vips/vip-575/bscmainnet";
import COMPTROLLER_ABI from "./abi/FlashLoanFacet.json";
import LEVERAGE_STRATEGIES_MANAGER_ABI from "./abi/LeverageStrategiesManager.json";
import SWAP_HELPER_ABI from "./abi/SwapHelper.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(71263393, async () => {
  let comptroller: Contract;
  let leverageStrategiesManager: Contract;
  let swapHelper: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER);
    leverageStrategiesManager = await ethers.getContractAt(
      LEVERAGE_STRATEGIES_MANAGER_ABI,
      LEVERAGE_STRATEGIES_MANAGER,
    );
    swapHelper = await ethers.getContractAt(SWAP_HELPER_ABI, SWAP_HELPER);
  });

  describe("Pre-VIP behavior", () => {
    it("LeverageStrategiesManager should not be whitelisted for flash loans", async () => {
      expect(await comptroller.authorizedFlashLoan(LEVERAGE_STRATEGIES_MANAGER)).to.equal(false);
    });

    it("LeverageStrategiesManager should have NORMAL_TIMELOCK as pending owner", async () => {
      expect(await leverageStrategiesManager.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("SwapHelper should have NORMAL_TIMELOCK as pending owner", async () => {
      expect(await swapHelper.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("Comptroller should have flash loans unpaused", async () => {
      expect(await comptroller.flashLoanPaused()).to.equal(false);
    });

    describe("LeverageStrategiesManager configuration", () => {
      it("should have correct COMPTROLLER", async () => {
        expect(await leverageStrategiesManager.COMPTROLLER()).to.equal(UNITROLLER);
      });

      it("should have correct swapHelper", async () => {
        expect(await leverageStrategiesManager.swapHelper()).to.equal(SWAP_HELPER);
      });
    });
  });

  testVip("VIP-575", await vip575(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["IsAccountFlashLoanWhitelisted"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("LeverageStrategiesManager should be whitelisted for flash loans", async () => {
      expect(await comptroller.authorizedFlashLoan(LEVERAGE_STRATEGIES_MANAGER)).to.equal(true);
    });

    it("LeverageStrategiesManager should have NORMAL_TIMELOCK as owner", async () => {
      expect(await leverageStrategiesManager.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("LeverageStrategiesManager should have zero address as pending owner", async () => {
      expect(await leverageStrategiesManager.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("SwapHelper should have NORMAL_TIMELOCK as owner", async () => {
      expect(await swapHelper.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("SwapHelper should have zero address as pending owner", async () => {
      expect(await swapHelper.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    describe("SwapHelper configuration", () => {
      it("should have correct backendSigner", async () => {
        const backendSigner = await swapHelper.backendSigner();
        expect(backendSigner).to.not.equal(ethers.constants.AddressZero);
      });
    });
  });
});
