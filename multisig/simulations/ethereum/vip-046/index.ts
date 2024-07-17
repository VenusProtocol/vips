/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from "chai";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip046, { COMPTROLLER_CORE, COMPTROLLER_CURVE, PRIME } from "../../../proposals/ethereum/vip-046";
import COMPTROLLER_ABI from "./abi/ILComptroller.json";

forking(20321056, async () => {
  const provider = ethers.provider;

  describe("Post-VIP behavior", () => {
    before(async () => {
      await pretendExecutingVip(await vip046());
    });

    it("Comptroller Core should have correct Prime token address", async () => {
      const comptrollerCore = new ethers.Contract(COMPTROLLER_CORE, COMPTROLLER_ABI, provider);
      expect(await comptrollerCore.prime()).to.be.equal(PRIME);
    });

    it("Comptroller Curve should have correct Prime token address", async () => {
      const comptrollerCurve = new ethers.Contract(COMPTROLLER_CURVE, COMPTROLLER_ABI, provider);
      expect(await comptrollerCurve.prime()).to.be.equal(PRIME);
    });
  });
});
