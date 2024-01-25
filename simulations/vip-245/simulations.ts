import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import {
  Speeds,
  UNITROLLER,
  VAI_VAULT_RATE,
  blocksPerDay,
  borrowSpeeds,
  supplySpeeds,
  vTokens,
  vip245,
} from "../../vips/vip-245";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

const OLD_VAI_VAULT_RATE = parseUnits("125.00", 18).div(blocksPerDay);

export const oldSupplySpeeds = Speeds.map(speed => speed.oldSupplySpeed);
export const oldBorrowSpeeds = Speeds.map(speed => speed.oldBorrowSpeed);

forking(35420320, () => {
  let comptroller: ethers.Contract;

  before(async () => {
    comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("check XVS reward rate for VAI vault", async () => {
      const rate = await comptroller.venusVAIVaultRate();
      expect(rate).to.be.closeTo(OLD_VAI_VAULT_RATE, parseUnits("0.00000000000000001", 18).toString());
    });

    for (let i = 0; i < vTokens.length; i++) {
      it(`check XVS reward rate for ${Speeds[i].name}`, async () => {
        const supplyRate = await comptroller.venusSupplySpeeds(Speeds[i].vToken);
        expect(supplyRate).to.be.closeTo(oldSupplySpeeds[i], parseUnits("0.0001", 18).toString());

        const borrowRate = await comptroller.venusBorrowSpeeds(Speeds[i].vToken);
        expect(borrowRate).to.be.closeTo(oldSupplySpeeds[i], parseUnits("0.0001", 18).toString());
      });
    }
  });

  testVip("VIP-245", vip245(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewVenusVAIVaultRate"], [1]);
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["VenusSupplySpeedUpdated", "VenusBorrowSpeedUpdated"],
        [21, 21],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check XVS reward rate for VAI vault", async () => {
      const rate = await comptroller.venusVAIVaultRate();
      expect(rate).to.be.equal(VAI_VAULT_RATE);
    });

    for (let i = 0; i < vTokens.length; i++) {
      it(`check XVS reward rate for ${Speeds[i].name}`, async () => {
        const supplyRate = await comptroller.venusSupplySpeeds(Speeds[i].vToken);
        expect(supplyRate).to.be.equal(supplySpeeds[i]);

        const borrowRate = await comptroller.venusBorrowSpeeds(Speeds[i].vToken);
        expect(borrowRate).to.be.equal(borrowSpeeds[i]);
      });
    }
  });
});
