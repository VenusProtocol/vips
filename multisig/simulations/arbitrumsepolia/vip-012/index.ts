import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip012 } from "../../../proposals/arbitrumsepolia/vip-012";
import COMPTROLLER_FACET_ABI from "./abis/comptroller.json";

const COMPTROLLER_CORE = "0x006D44b6f5927b3eD83bD0c1C36Fb1A3BaCaC208";
const vUSDT_POOL_STABLECOIN = "0xdEFbf0F9Ab6CdDd0a1FdDC894b358D0c0a39B052";
const MULTISIG = "0x1426A5Ae009c4443188DA8793751024E358A61C2";

forking(75563035, async () => {
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
      await pretendExecutingVip(await vip012());
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
