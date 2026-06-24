import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import { PRIME_V2 } from "../../vips/vip-675/addendum-testnet-reset";
import { PLP } from "../../vips/vip-675/bsctestnet";
import vip675Addendum4, {
  BORROW_MULTIPLIER,
  SUPPLY_MULTIPLIER,
  VWBNB,
  WBNB,
  WBNB_DISTRIBUTION_SPEED,
} from "../../vips/vip-675/bsctestnet-addendum4";

const PRIME_V2_ABI = [
  "function markets(address) view returns (uint256 supplyMultiplier, uint256 borrowMultiplier, uint256 rewardIndex, uint256 sumOfMembersScore, bool exists)",
  "event MarketAdded(address indexed market, uint256 supplyMultiplier, uint256 borrowMultiplier)",
];
const PLP_ABI = [
  "function lastAccruedBlock(address) view returns (uint256)",
  "function tokenDistributionSpeeds(address) view returns (uint256)",
];

const BLOCK_NUMBER = 115209670;

forking(BLOCK_NUMBER, async () => {
  let primeV2: Contract;
  let plp: Contract;

  before(async () => {
    primeV2 = new ethers.Contract(PRIME_V2, PRIME_V2_ABI, ethers.provider);
    plp = new ethers.Contract(PLP, PLP_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", () => {
    it("PrimeV2 does not yet have the vWBNB market", async () => {
      const m = await primeV2.markets(VWBNB);
      expect(m.exists).to.equal(false);
    });

    it("PrimeLiquidityProvider has not initialized WBNB", async () => {
      expect(await plp.lastAccruedBlock(WBNB)).to.equal(0);
      expect(await plp.tokenDistributionSpeeds(WBNB)).to.equal(0);
    });
  });

  testVip("VIP-675 addendum 4 [Testnet] Add vWBNB market", await vip675Addendum4(), {
    callbackAfterExecution: async txResponse => {
      await expect(txResponse).to.emit(primeV2, "MarketAdded").withArgs(VWBNB, SUPPLY_MULTIPLIER, BORROW_MULTIPLIER);
    },
  });

  describe("Post-VIP behavior", () => {
    it("PrimeV2 has the vWBNB market configured with the expected multipliers", async () => {
      const m = await primeV2.markets(VWBNB);
      expect(m.exists).to.equal(true);
      expect(m.supplyMultiplier).to.equal(SUPPLY_MULTIPLIER);
      expect(m.borrowMultiplier).to.equal(BORROW_MULTIPLIER);
    });

    it("PrimeLiquidityProvider has WBNB initialized and distributing", async () => {
      expect(await plp.lastAccruedBlock(WBNB)).to.be.gt(0);
      expect(await plp.tokenDistributionSpeeds(WBNB)).to.equal(WBNB_DISTRIBUTION_SPEED);
    });
  });
});
