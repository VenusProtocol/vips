import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip016 } from "../../../proposals/opbnbtestnet/vip-016";
import COMPTROLLER_FACET_ABI from "./abis/comptroller.json";

const COMPTROLLER_CORE = "0x2FCABb31E57F010D623D8d68e1E18Aed11d5A388";
const vUSDT_POOL_STABLECOIN = "0xe3923805f6E117E51f5387421240a86EF1570abC";
const MULTISIG = "0xb15f6EfEbC276A3b9805df81b5FB3D50C2A62BDf";

forking(38155115, async () => {
  let stableCoinPoolComptroller: Contract;

  before(async () => {
    await impersonateAccount(MULTISIG);

    stableCoinPoolComptroller = new ethers.Contract(
      COMPTROLLER_CORE,
      COMPTROLLER_FACET_ABI,
      await ethers.getSigner(MULTISIG),
    );

    await setBalance(MULTISIG, parseUnits("1000", 18));

    await stableCoinPoolComptroller.setActionsPaused([vUSDT_POOL_STABLECOIN], [0, 1, 2, 3, 4, 5, 6, 7, 8], true);
    await stableCoinPoolComptroller.setCollateralFactor(vUSDT_POOL_STABLECOIN, 0, 0);
    await stableCoinPoolComptroller.setMarketBorrowCaps([vUSDT_POOL_STABLECOIN], [0]);
    await stableCoinPoolComptroller.setMarketSupplyCaps([vUSDT_POOL_STABLECOIN], [0]);
  });

  describe("Pre-VIP behavior", () => {
    it("unlist reverts", async () => {
      await expect(stableCoinPoolComptroller.unlistMarket(vUSDT_POOL_STABLECOIN)).to.be.reverted;
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip016());
    });

    it("unlist successful", async () => {
      await expect(stableCoinPoolComptroller.unlistMarket(vUSDT_POOL_STABLECOIN)).to.be.not.reverted;
    });

    describe("generic tests", async () => {
      it("Isolated pools generic tests", async () => {
        checkIsolatedPoolsComptrollers();
      });
    });
  });
});
