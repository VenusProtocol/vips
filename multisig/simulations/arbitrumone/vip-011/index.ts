import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip011 } from "../../../proposals/arbitrumone/vip-011";
import COMPTROLLER_ABI from "./abis/comptroller.json";

const COMPTROLLER_CORE = "0x317c1A5739F39046E20b08ac9BeEa3f10fD43326";
const vUSDT_POOL_CORE = "0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD";
const MULTISIG = "0x14e0E151b33f9802b3e75b621c1457afc44DcAA0";

forking(249598943, async () => {
  let corePoolComptroller: Contract;

  before(async () => {
    await impersonateAccount(MULTISIG);

    corePoolComptroller = new ethers.Contract(
      COMPTROLLER_CORE,
      COMPTROLLER_ABI,
      await ethers.getSigner(MULTISIG),
    );

    await setBalance(MULTISIG, parseUnits("1000", 18));

    await corePoolComptroller.setActionsPaused([vUSDT_POOL_CORE], [0, 1, 2, 3, 4, 5, 6, 7, 8], true);
    await corePoolComptroller.setCollateralFactor(vUSDT_POOL_CORE, 0, 0);
    await corePoolComptroller.setMarketBorrowCaps([vUSDT_POOL_CORE], [0]);
    await corePoolComptroller.setMarketSupplyCaps([vUSDT_POOL_CORE], [0]);
  });

  describe("Pre-VIP behavior", () => {
    it("unlist reverts", async () => {
      await expect(corePoolComptroller.unlistMarket(vUSDT_POOL_CORE)).to.be.reverted;
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip011());
    });

    it("unlist successful", async () => {
      await expect(corePoolComptroller.unlistMarket(vUSDT_POOL_CORE)).to.be.not.reverted;
    });

    describe("generic tests", async () => {
      it("Isolated pools generic tests", async () => {
        checkIsolatedPoolsComptrollers();
      });
    });
  });
});
