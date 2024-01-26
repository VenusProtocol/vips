import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { STABLECOIN_COMPTROLLER } from "../../../vips/vip-185";
import { ACM, NORMAL_TIMELOCK, UNITROLLER, vLUNA, vUST, vip244 } from "../../../vips/vip-244/bsctestnet";
import ACM_ABI from "./abi/ACM.json";
import COMPTROLLER_FACET_ABI from "./abi/comptroller.json";
import UPGRADABLE_BEACON_ABI from "./abi/upgradableBeacon.json";

const POOL_STABLECOIN_COMPTROLLER = "0x10b57706AD2345e590c2eA4DC02faef0d9f5b08B";
const vUSDT_POOL_STABLECOIN = "0x3338988d0beb4419Acb8fE624218754053362D06";
const vUST_USER = "0xFEA1c651A47FE29dB9b1bf3cC1f224d8D9CFF68C";
const vUSDT_USER = "0x9cc6F5f16498fCEEf4D00A350Bd8F8921D304Dc9";

forking(37164546, () => {
  let acm: ethers.Contract;
  let comptroller: ethers.Contract;
  let stableCoinPoolComptroller: ethers.Contract;

  before(async () => {
    impersonateAccount(UNITROLLER);
    impersonateAccount(NORMAL_TIMELOCK);
    impersonateAccount(vUST_USER);

    acm = new ethers.Contract(ACM, ACM_ABI, await ethers.getSigner(UNITROLLER));
    comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_FACET_ABI, await ethers.getSigner(NORMAL_TIMELOCK));
    stableCoinPoolComptroller = new ethers.Contract(
      POOL_STABLECOIN_COMPTROLLER,
      COMPTROLLER_FACET_ABI,
      await ethers.getSigner(STABLECOIN_COMPTROLLER),
    );
  });

  describe("Pre-VIP", () => {
    it("should have the correct call permissions", async () => {
      const callPermissions = await acm.isAllowedToCall(NORMAL_TIMELOCK, "unlistMarket(address)");
      expect(callPermissions).to.be.false;

      const stableCoinPoolCallPermissions = await acm.isAllowedToCall(NORMAL_TIMELOCK, "unlistMarket(address)");
      expect(stableCoinPoolCallPermissions).to.be.false;
    });

    it("market not unlisted", async () => {
      const markets = await comptroller.getAssetsIn(vUST_USER);
      expect(markets.includes(vUST)).to.be.true;
      expect(markets.includes(vLUNA)).to.be.true;
    });

    it("stablecoin pool market not unlisted", async () => {
      const markets = await stableCoinPoolComptroller.getAssetsIn(vUSDT_USER);
      expect(markets.includes(vUSDT_POOL_STABLECOIN)).to.be.true;
    });
  });

  testVip("VIP-244 Unlist Market", vip244(), {
    callbackAfterExecution: async txResponse => {
      expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [3]);
      expectEvents(
        txResponse,
        [COMPTROLLER_FACET_ABI],
        ["NewSupplyCap", "NewBorrowCap", "ActionPausedMarket", "NewCollateralFactor", "MarketUnlisted"],
        [2, 2, 12, 2, 2],
      );
      expectEvents(txResponse, [UPGRADABLE_BEACON_ABI], ["Upgraded"], [1]);
    },
  });

  describe("Post-VIP", () => {
    it("should have the correct call permissions", async () => {
      const callPermissions = await acm.isAllowedToCall(NORMAL_TIMELOCK, "unlistMarket(address)");
      expect(callPermissions).to.be.true;

      const stableCoinPoolCallPermissions = await acm.isAllowedToCall(NORMAL_TIMELOCK, "unlistMarket(address)");
      expect(stableCoinPoolCallPermissions).to.be.true;
    });

    it("market unlisted", async () => {
      const markets = await comptroller.getAssetsIn(vUST_USER);
      expect(markets.includes(vUST)).to.be.false;
      expect(markets.includes(vLUNA)).to.be.false;
    });

    it("stablecoin pool market unlisted", async () => {
      await stableCoinPoolComptroller
        .connect(await ethers.getSigner(NORMAL_TIMELOCK))
        .unlistMarket(vUSDT_POOL_STABLECOIN);

      const markets = await stableCoinPoolComptroller.getAssetsIn(vUSDT_USER);
      expect(markets.includes(vUSDT_POOL_STABLECOIN)).to.be.false;
    });
  });
});
