import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, testVip } from "../../src/vip-framework";
import vip329, {
  COMPTROLLER_BEACON,
  COMPTROLLER_IMPL,
  COMPTROLLER_LST,
  REWARDS_DISTRIBUTOR_ankrBNB,
} from "../../vips/vip-329/bsctestnet";
import BEACON_ABI from "./abi/beacon.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(41501999, async () => {
  let beacon: Contract;
  let comptrollerContract: Contract;

  before(async () => {
    beacon = await ethers.getContractAt(BEACON_ABI, COMPTROLLER_BEACON);
    comptrollerContract = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_LST);
  });

  describe("Pre-VIP behavior", async () => {
    it("check implementation", async () => {
      const implementation = await beacon.implementation();
      expect(implementation).to.be.equal(COMPTROLLER_IMPL);
    });

    it("check reward distributor exists", async () => {
      const distributors = await comptrollerContract.getRewardDistributors();
      expect(distributors).to.include(REWARDS_DISTRIBUTOR_ankrBNB);
    });
  });

  testVip("VIP-329", await vip329());

  describe("Post-VIP behavior", async () => {
    it("check implementation", async () => {
      const implementation = await beacon.implementation();
      expect(implementation).to.be.equal(COMPTROLLER_IMPL);
    });

    it("check reward distributor removed", async () => {
      const distributors = await comptrollerContract.getRewardDistributors();
      expect(distributors).to.not.include(REWARDS_DISTRIBUTOR_ankrBNB);
    });
  });
});
