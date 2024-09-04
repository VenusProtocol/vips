import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip057 } from "../../../proposals/ethereum/vip-057";
import COMPTROLLER_FACET_ABI from "./abis/comptroller.json";

const COMPTROLLER_CORE_POOL = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
const vUSDT_POOL_STABLECOIN = "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E";
const vUSDT_USER = "0x1253F0bFf813370C601D29d7312759675bBB30B6";
const GUARDIAN = "0x285960C5B22fD66A736C7136967A3eB15e93CC67";

forking(20664549, async () => {
  let corePoolComptroller: Contract;

  before(async () => {
    await impersonateAccount(GUARDIAN);

    corePoolComptroller = new ethers.Contract(
      COMPTROLLER_CORE_POOL,
      COMPTROLLER_FACET_ABI,
      await ethers.getSigner(GUARDIAN),
    );

    await setBalance(GUARDIAN, parseUnits("1000", 18));

    await corePoolComptroller.setActionsPaused([vUSDT_POOL_STABLECOIN], [0, 1, 2, 3, 4, 5, 6, 7, 8], true);
    await corePoolComptroller.setCollateralFactor(vUSDT_POOL_STABLECOIN, 0, 0);
    await corePoolComptroller.setMarketBorrowCaps([vUSDT_POOL_STABLECOIN], [0]);
    await corePoolComptroller.setMarketSupplyCaps([vUSDT_POOL_STABLECOIN], [0]);
  });

  describe("Pre-VIP behavior", () => {
    it("core pool market not unlisted", async () => {
      const markets = await corePoolComptroller.getAssetsIn(vUSDT_USER);
      expect(markets.includes(vUSDT_POOL_STABLECOIN)).to.be.true;
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip057());
    });

    it("core pool market unlisted", async () => {
      await corePoolComptroller.unlistMarket(vUSDT_POOL_STABLECOIN);

      const markets = await corePoolComptroller.getAssetsIn(vUSDT_USER);
      expect(markets.includes(vUSDT_POOL_STABLECOIN)).to.be.false;
    });

    describe("generic tests", async () => {
      it("Isolated pools generic tests", async () => {
        checkIsolatedPoolsComptrollers();
      });
    });
  });
});
