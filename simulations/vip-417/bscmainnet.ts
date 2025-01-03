import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip417, {
  CORE_COMPTROLLER,
  XVS,
  XVS_STORE,
  XVS_STORE_AMOUNT,
  TOTAL_XVS
} from "../../vips/vip-417/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/CoreComptroller.json";
import ERC20_ABI from "./abi/ERC20.json";

forking(45437328, async () => {
  const provider = ethers.provider;
  const coreComptroller = new ethers.Contract(CORE_COMPTROLLER, CORE_COMPTROLLER_ABI, provider);
  const xvs = new ethers.Contract(XVS, ERC20_ABI, provider);
  let xvsStorePReviousBalance = await xvs.balanceOf(XVS_STORE);
  let comptrollerPreviousXVSBalance = await xvs.balanceOf(CORE_COMPTROLLER);

  before(async () => {
    xvsStorePReviousBalance = await xvs.balanceOf(XVS_STORE);
  })

  testVip("VIP-417", await vip417(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["VenusGranted"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should transfer XVS to the store", async () => {
      const xvsStoreBalance = await xvs.balanceOf(XVS_STORE);
      expect(xvsStoreBalance).to.equal(xvsStorePReviousBalance.add(XVS_STORE_AMOUNT));
    });

    it("should transfer XVS to the Comptroller", async () => {
      const comptrollerXVSBalance = await xvs.balanceOf(CORE_COMPTROLLER);
      expect(comptrollerXVSBalance).to.equal(comptrollerPreviousXVSBalance.sub(TOTAL_XVS));
    })
  });
});
