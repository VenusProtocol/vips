import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { STABLECOIN_COMPTROLLER } from "../../vips/vip-185";
import { NORMAL_TIMELOCK, UNITROLLER, vLUNA, vUST, vip308 } from "../../vips/vip-308/bsctestnet";
import ACM_ABI from "./abi/acm.json";
import COMPTROLLER_FACET_ABI from "./abi/comptroller.json";
import UPGRADABLE_BEACON_ABI from "./abi/upgradableBeacon.json";

const POOL_STABLECOIN_COMPTROLLER = "0x10b57706AD2345e590c2eA4DC02faef0d9f5b08B";
const vUSDT_POOL_STABLECOIN = "0x3338988d0beb4419Acb8fE624218754053362D06";
const vUST_USER = "0xFEA1c651A47FE29dB9b1bf3cC1f224d8D9CFF68C";
const vUSDT_USER = "0x9cc6F5f16498fCEEf4D00A350Bd8F8921D304Dc9";

forking(40582718, () => {
  let comptroller: Contract;
  let stableCoinPoolComptroller: Contract;

  before(async () => {
    await impersonateAccount(UNITROLLER);
    await impersonateAccount(NORMAL_TIMELOCK);
    await impersonateAccount(vUST_USER);

    comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_FACET_ABI, await ethers.getSigner(NORMAL_TIMELOCK));
    stableCoinPoolComptroller = new ethers.Contract(
      POOL_STABLECOIN_COMPTROLLER,
      COMPTROLLER_FACET_ABI,
      await ethers.getSigner(STABLECOIN_COMPTROLLER),
    );
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
  });

  testVip("VIP-308 Unlist Market", vip308(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [6]);
      await expectEvents(
        txResponse,
        [COMPTROLLER_FACET_ABI],
        ["NewSupplyCap", "NewBorrowCap", "ActionPausedMarket", "NewCollateralFactor", "MarketUnlisted"],
        [2, 2, 12, 2, 2],
      );
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
      await stableCoinPoolComptroller
        .connect(await ethers.getSigner(NORMAL_TIMELOCK))
        .unlistMarket(vUSDT_POOL_STABLECOIN);

      const markets = await stableCoinPoolComptroller.getAssetsIn(vUSDT_USER);
      expect(markets.includes(vUSDT_POOL_STABLECOIN)).to.be.false;
    });
  });
});
