import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip020 } from "../../../proposals/opbnbmainnet/vip-020";
import COMPTROLLER_FACET_ABI from "./abis/comptroller.json";

const COMPTROLLER_CORE = "0xD6e3E2A1d8d95caE355D15b3b9f8E5c2511874dd";
const vUSDT_POOL_STABLECOIN = "0xb7a01Ba126830692238521a1aA7E7A7509410b8e";
const MULTISIG = "0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207";

forking(33546729, async () => {
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
      await pretendExecutingVip(await vip020());
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
