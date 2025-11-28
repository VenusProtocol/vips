import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { LEVERAGE_STRATEGIES_MANAGER, UNITROLLER, vip575 } from "../../vips/vip-575/bscmainnet";
import COMPTROLLER_ABI from "./abi/FlashLoanFacet.json";
import LEVERAGE_STRATEGIES_MANAGER_ABI from "./abi/LeverageStrategiesManager.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const PSR = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const SWAP_HELPER = "0xe1a3b4189F56Cf38747BE79348b8664Ef18cCFd1";

forking(69761773, async () => {
  let comptroller: Contract;
  let leverageStrategiesManager: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER);
    leverageStrategiesManager = await ethers.getContractAt(
      LEVERAGE_STRATEGIES_MANAGER_ABI,
      LEVERAGE_STRATEGIES_MANAGER,
    );
  });

  describe("Pre-VIP behavior", () => {
    it("LeverageStrategiesManager should not be whitelisted for flash loans", async () => {
      expect(await comptroller.authorizedFlashLoan(LEVERAGE_STRATEGIES_MANAGER)).to.equal(false);
    });

    it("LeverageStrategiesManager should have NORMAL_TIMELOCK as pending owner", async () => {
      expect(await leverageStrategiesManager.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("Comptroller should have flash loans unpaused", async () => {
      expect(await comptroller.flashLoanPaused()).to.equal(false);
    });

    describe("LeverageStrategiesManager configuration", () => {
      it("should have correct COMPTROLLER", async () => {
        expect(await leverageStrategiesManager.COMPTROLLER()).to.equal(UNITROLLER);
      });

      it("should have correct protocolShareReserve", async () => {
        expect(await leverageStrategiesManager.protocolShareReserve()).to.equal(PSR);
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
  });
});
