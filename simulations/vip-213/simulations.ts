import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip213 } from "../../vips/vip-213";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const COMPTROLLER_CORE = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const COMPTROLLER_DEFI = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const VMATIC = "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8";
const VPLANET = "0xFf1112ba7f88a53D4D23ED4e14A117A2aE17C6be";

forking(34136216, () => {
  let comptroller_core: ethers.Contract;
  let comptroller_defi: ethers.Contract;

  const provider = ethers.provider;
  before(async () => {
    comptroller_core = new ethers.Contract(COMPTROLLER_CORE, COMPTROLLER_ABI, provider);
    comptroller_defi = new ethers.Contract(COMPTROLLER_DEFI, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("MATIC supply cap equals 8,000,000", async () => {
      const oldCap = await comptroller_core.supplyCaps(VMATIC);
      expect(oldCap).to.equal(parseUnits("8000000", 18));
    });
    it("PLANET supply cap equals 2,000,000,000", async () => {
      const oldCap = await comptroller_defi.supplyCaps(VPLANET);
      expect(oldCap).to.equal(parseUnits("2000000000", 18));
    });
    it("PLANET borrow cap equals 1,000,000,000", async () => {
      const oldCap = await comptroller_defi.borrowCaps(VPLANET);
      expect(oldCap).to.equal(parseUnits("1000000000", 18));
    });
  });

  testVip("VIP-213 Chaos labs recommendations for the week October 6th, 2023", vip213(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap", "Failure"], [2, 1, 0]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("MATIC supply cap equals 16,000,000", async () => {
      const newCap = await comptroller_core.supplyCaps(VMATIC);
      expect(newCap).to.equal(parseUnits("16000000", 18));
    });
    it("PLANET supply cap equals 4000000000", async () => {
      const newCap = await comptroller_defi.supplyCaps(VPLANET);
      expect(newCap).to.equal(parseUnits("4000000000", 18));
    });
    it("PLANET borrow cap equals 1500000000", async () => {
      const newCap = await comptroller_defi.borrowCaps(VPLANET);
      expect(newCap).to.equal(parseUnits("1500000000", 18));
    });
  });
});
