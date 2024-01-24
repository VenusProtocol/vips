import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { UNITROLLER, vip244, VAI_VAULT_RATE, XVSSpeed, Speeds, vTokens, supplySpeeds, borrowSpeeds } from "../../vips/vip-244";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import SETTER_FACET_ABI from "./abi/SetterFacet.json";

const OLD_VAI_VAULT_RATE = parseUnits("0.004340277777777780", 18);

export const oldSupplySpeeds = Speeds.map(speed => speed.oldBorrowSpeed);
export const oldBorrowSpeeds = Speeds.map(speed => speed.oldBorrowSpeed);

forking(35518397, () => {
  let comptroller: ethers.Contract;

  before(async () => {
    comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, ethers.provider);
  });

  describe("Post-VIP behavior", async () => {
    it("check XVS reward rate for VAI vault", async () => {
      const rate = await comptroller.venusVAIVaultRate();
      expect(rate).to.be.equal(OLD_VAI_VAULT_RATE)
    });
  });

  testVip("VIP-244", vip244(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewVenusVAIVaultRate"], [1]);
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["VenusSupplySpeedUpdated", "VenusBorrowSpeedUpdated"], [21, 21]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check XVS reward rate for VAI vault", async () => {
      const rate = await comptroller.venusVAIVaultRate();
      expect(rate).to.be.equal(VAI_VAULT_RATE)
    });

    for (let i = 0; i < vTokens.length; i++) {
      it(`check XVS reward rate for ${Speeds[i].name}`, async () => {
        const supplyRate = await comptroller.venusSupplySpeeds(Speeds[i].vToken);
        expect(supplyRate).to.be.equal(supplySpeeds[i])

        const borrowRate = await comptroller.venusBorrowSpeeds(Speeds[i].vToken);
        expect(borrowRate).to.be.equal(borrowSpeeds[i])
      });
    }
  });
});
