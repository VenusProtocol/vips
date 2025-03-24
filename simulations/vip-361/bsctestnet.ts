import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { NORMAL_TIMELOCK, UNITROLLER, vLUNA, vUST, vip361 } from "../../vips/vip-361/bsctestnet";
import VTOKEN_ABI from "./abi/VBep20DelegateAbi.json";
import ACM_ABI from "./abi/acm.json";
import COMPTROLLER_FACET_ABI from "./abi/comptroller.json";
import IL_COMPTROLLER_FACET_ABI from "./abi/ilComptroller.json";
import UPGRADABLE_BEACON_ABI from "./abi/upgradableBeacon.json";

const USER = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";
const POOL_STABLECOIN_COMPTROLLER = "0x10b57706AD2345e590c2eA4DC02faef0d9f5b08B";
const vUSDT_POOL_STABLECOIN = "0x3338988d0beb4419Acb8fE624218754053362D06";
const vUST_USER = "0xFEA1c651A47FE29dB9b1bf3cC1f224d8D9CFF68C";
const vUSDT_USER = "0x9cc6F5f16498fCEEf4D00A350Bd8F8921D304Dc9";
const vBNB = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";

forking(43437726, async () => {
  let comptroller: Contract;
  let stableCoinPoolComptroller: Contract;
  let vBNBContract: Contract;

  before(async () => {
    await impersonateAccount(UNITROLLER);
    await impersonateAccount(NORMAL_TIMELOCK);
    await impersonateAccount(vUST_USER);
    await impersonateAccount(USER);

    comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_FACET_ABI, await ethers.getSigner(NORMAL_TIMELOCK));
    stableCoinPoolComptroller = new ethers.Contract(
      POOL_STABLECOIN_COMPTROLLER,
      IL_COMPTROLLER_FACET_ABI,
      await ethers.getSigner(NORMAL_TIMELOCK),
    );
    vBNBContract = new ethers.Contract(vBNB, VTOKEN_ABI, await ethers.getSigner(USER));
  });

  describe("Pre-VIP", () => {
    it("market not unlisted", async () => {
      const markets = await comptroller.getAssetsIn(vUST_USER);
      expect(markets.includes(vUST)).to.be.true;
      expect(markets.includes(vLUNA)).to.be.true;
    });

    it("stablecoin pool market not unlisted", async () => {
      const markets = await stableCoinPoolComptroller.getAssetsIn(vUSDT_USER);
      expect(markets.includes(vUSDT_POOL_STABLECOIN)).to.be.true;
    });

    it("Verify borrow cap 0", async () => {
      await comptroller._setMarketBorrowCaps([vBNB], [0]);
      await expect(vBNBContract.borrow(10)).to.not.be.reverted;
    });
  });

  testVip("VIP-361 Unlist Market", await vip361(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [6]);
      await expectEvents(txResponse, [COMPTROLLER_FACET_ABI], ["ActionPausedMarket"], [18]);
      await expectEvents(txResponse, [UPGRADABLE_BEACON_ABI], ["Upgraded"], [1]);
    },
  });

  describe("Post-VIP", () => {
    it("market unlisted", async () => {
      const markets = await comptroller.getAssetsIn(vUST_USER);
      expect(markets.includes(vUST)).to.be.false;
      expect(markets.includes(vLUNA)).to.be.false;
    });

    it("stablecoin pool market unlisted", async () => {
      await stableCoinPoolComptroller.setActionsPaused([vUSDT_POOL_STABLECOIN], [0, 1, 2, 3, 4, 5, 6, 7, 8], true);
      await stableCoinPoolComptroller.setCollateralFactor(vUSDT_POOL_STABLECOIN, 0, 0);
      await stableCoinPoolComptroller.setMarketBorrowCaps([vUSDT_POOL_STABLECOIN], [0]);
      await stableCoinPoolComptroller.setMarketSupplyCaps([vUSDT_POOL_STABLECOIN], [0]);

      await stableCoinPoolComptroller.unlistMarket(vUSDT_POOL_STABLECOIN);

      const markets = await stableCoinPoolComptroller.getAssetsIn(vUSDT_USER);
      expect(markets.includes(vUSDT_POOL_STABLECOIN)).to.be.false;
    });

    it("Verify borrow cap 0", async () => {
      await comptroller._setMarketBorrowCaps([vBNB], [0]);
      await expect(vBNBContract.borrow(10)).to.be.revertedWith("market borrow cap is 0");
    });

    describe("generic tests", async () => {
      it("Isolated pools generic tests", async () => {
        checkIsolatedPoolsComptrollers();
      });
    });
  });
});
