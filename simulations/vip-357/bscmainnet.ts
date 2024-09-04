import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";

import { expectEvents, setMaxStaleCoreAssets } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { NORMAL_TIMELOCK, UNITROLLER, vCAN, vLUNA, vUST, vip357 } from "../../vips/vip-357/bscmainnet";
import VTOKEN_ABI from "./abi/VBep20DelegateAbi.json";
import ACM_ABI from "./abi/acm.json";
import COMPTROLLER_FACET_ABI from "./abi/comptroller.json";
import IL_COMPTROLLER_FACET_ABI from "./abi/ilComptroller.json";
import UPGRADABLE_BEACON_ABI from "./abi/upgradableBeacon.json";

const USER = "0xbf5870D0F8A23525926eA88E282129eE2ab0C071";
const POOL_STABLECOIN_COMPTROLLER = "0x94c1495cD4c557f1560Cbd68EAB0d197e6291571";
const vUSDT_POOL_STABLECOIN = "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B";
const vUST_USER = "0x6013A56FbE216fE0FeD0f4b2741bDC22f1143d3c";
const vLUNA_USER = "0x59008Ee02096211782cf519d25F77965811fd2FA";
const vUSDT_USER = "0xb4DfcE5B298F826365220448F45BC0d2452FDfd5";
const vCAN_USER = "0x24e77E5b74B30b026E9996e4bc3329c881e24968";
const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const CHAINLINK = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";

forking(41956001, async () => {
  let comptroller: Contract;
  let stableCoinPoolComptroller: Contract;
  let vBNBContract: Contract;

  before(async () => {
    await impersonateAccount(UNITROLLER);
    await impersonateAccount(NORMAL_TIMELOCK);
    await impersonateAccount(vUST_USER);
    await impersonateAccount(vLUNA_USER);
    await impersonateAccount(vCAN_USER);
    await impersonateAccount(USER);

    await await setMaxStaleCoreAssets(CHAINLINK, NORMAL_TIMELOCK);

    comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_FACET_ABI, await ethers.getSigner(NORMAL_TIMELOCK));
    stableCoinPoolComptroller = new ethers.Contract(
      POOL_STABLECOIN_COMPTROLLER,
      IL_COMPTROLLER_FACET_ABI,
      await ethers.getSigner(NORMAL_TIMELOCK),
    );
    vBNBContract = new ethers.Contract(vBNB, VTOKEN_ABI, await ethers.getSigner(USER));
  });

  describe("Pre-VIP", () => {
    it("market not unlisted - vUST", async () => {
      const markets = await comptroller.getAssetsIn(vUST_USER);
      expect(markets.includes(vUST)).to.be.true;
    });

    it("market not unlisted - vLUNA", async () => {
      const markets = await comptroller.getAssetsIn(vLUNA_USER);
      expect(markets.includes(vLUNA)).to.be.true;
    });

    it("market not unlisted - vCAN", async () => {
      const markets = await comptroller.getAssetsIn(vCAN_USER);
      expect(markets.includes(vCAN)).to.be.true;
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

  testVip("VIP-357 Unlist Market", await vip357(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [8]);
      await expectEvents(txResponse, [COMPTROLLER_FACET_ABI], ["ActionPausedMarket"], [27]);
      await expectEvents(txResponse, [UPGRADABLE_BEACON_ABI], ["Upgraded"], [1]);
    },
  });

  describe("Post-VIP", () => {
    it("market unlisted - vUST", async () => {
      const markets = await comptroller.getAssetsIn(vUST_USER);
      expect(markets.includes(vUST)).to.be.false;
    });

    it("market unlisted - vLUNA", async () => {
      const markets = await comptroller.getAssetsIn(vLUNA_USER);
      expect(markets.includes(vLUNA)).to.be.false;
    });

    it("market unlisted - vCAN", async () => {
      const markets = await comptroller.getAssetsIn(vCAN_USER);
      expect(markets.includes(vCAN)).to.be.false;
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
