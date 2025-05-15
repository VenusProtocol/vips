import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip496, { COMPTROLLER_CORE, UNICHAIN_vUSDC_CORE } from "../../vips/vip-496/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

forking(16289517, async () => {
  const comptroller = new ethers.Contract(COMPTROLLER_CORE, COMPTROLLER_ABI, ethers.provider);

  describe("Pre-Execution state", () => {
    it(`USDC supply cap is 15M`, async () => {
      expect(await comptroller.supplyCaps(UNICHAIN_vUSDC_CORE)).to.equal(parseUnits("15000000", 6));
    });

    it(`USDC borrow cap is 12M`, async () => {
      expect(await comptroller.borrowCaps(UNICHAIN_vUSDC_CORE)).to.equal(parseUnits("12000000", 6));
    });
  });

  testForkedNetworkVipCommands("update USDC caps", await vip496(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI, VTOKEN_ABI], ["NewSupplyCap", "NewBorrowCap"], [1, 1]);
    },
  });

  describe("Post-Execution state", () => {
    it(`USDC supply cap is 30M`, async () => {
      expect(await comptroller.supplyCaps(UNICHAIN_vUSDC_CORE)).to.equal(parseUnits("30000000", 6));
    });

    it(`USDC borrow cap is 27M`, async () => {
      expect(await comptroller.borrowCaps(UNICHAIN_vUSDC_CORE)).to.equal(parseUnits("27000000", 6));
    });
  });
});
