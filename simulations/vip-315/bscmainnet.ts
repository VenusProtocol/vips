import { expect } from "chai";
import { BigNumber, Contract, utils } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { calculateMappingStorageSlot, expectEvents, initMainnetUser } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip315, {vWBNB, vWBNB_IR, vWBNB_RF} from "../../vips/vip-315/bscmainnet";
import VTOKEN_ABI from "./abi/vToken.json";

forking(39147163, async () => {
  const provider = ethers.provider;
  let vWBNBContract: Contract;

  before(async () => {
    vWBNBContract = new ethers.Contract(vWBNB, VTOKEN_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("check IR address", async () => {
      const ir = await vWBNBContract.interestRateModel();
      expect(ir).to.be.equal("0x6765202c3e6d3FdD05F0b26105d0C8DF59D3efaf");
    })

    it("check RF", async () => {
      const rf = await vWBNBContract.reserveFactorMantissa();
      expect(rf).to.be.equal(parseUnits("0.25", 18));
    })
  });

  testVip("VIP-315", vip315(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel", "NewReserveFactor"], [1, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check IR address", async () => {
      const ir = await vWBNBContract.interestRateModel();
      expect(ir).to.be.equal(vWBNB_IR);
    })

    it("check RF", async () => {
      const rf = await vWBNBContract.reserveFactorMantissa();
      expect(rf).to.be.equal(vWBNB_RF);
    })
  });
});
