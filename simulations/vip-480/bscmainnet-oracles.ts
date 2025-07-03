import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework/index";

import { BOUND_VALIDATOR, marketSpecs, tokens, vip480OnlyOracles } from "../../vips/vip-480/bscmainnet";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/accessControlmanager.json";

const ONE_YEAR = 365 * 24 * 3600;

const { RESILIENT_ORACLE, ACCESS_CONTROL_MANAGER, NORMAL_TIMELOCK, CRITICAL_TIMELOCK } = NETWORK_ADDRESSES.bscmainnet;

// Check if the oracles actually would work, not fixing any price
forking(48326667, async () => {
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);

  before(async () => {
    await impersonateAccount(NORMAL_TIMELOCK);
    const admin = await ethers.getSigner(NORMAL_TIMELOCK);
    const acm = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ACCESS_CONTROL_MANAGER);
    await acm
      .connect(admin)
      .giveCallPermission(BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", CRITICAL_TIMELOCK);
  });

  describe("Pre-VIP behavior", () => {
    Object.values(tokens).forEach(({ address, symbol }) => {
      it(`check price ${symbol}`, async () => {
        await expect(resilientOracle.getPrice(address)).to.be.reverted;
      });
    });
  });

  testVip(
    "VIP-480 only oracles",
    await vip480OnlyOracles({
      maxStalePeriod: ONE_YEAR,
      mockPendleOracleConfiguration: false,
    }),
    {},
  );

  describe("Post-VIP behavior", async () => {
    it("check price USDe", async () => {
      const expectedPrice = parseUnits("0.99891855", 18); // RedStone price, because it will still be valid after 8 hours
      expect(await resilientOracle.getPrice(tokens.USDe.address)).to.equal(expectedPrice);
      expect(await resilientOracle.getUnderlyingPrice(marketSpecs.USDe.vToken.address)).to.equal(expectedPrice);
    });

    it("check price sUSDe", async () => {
      const expectedPrice = parseUnits("1.166019493043317500", 18); // RedStone price, because it will still be valid after 8 hours
      expect(await resilientOracle.getPrice(tokens.sUSDe.address)).to.equal(expectedPrice);
      expect(await resilientOracle.getUnderlyingPrice(marketSpecs.sUSDe.vToken.address)).to.equal(expectedPrice);
    });

    it("check price PT-sUSDe-26JUN2025", async () => {
      const expectedPrice = parseUnits("0.982329823300445191", 18);
      expect(await resilientOracle.getPrice(tokens["PT-sUSDE-26JUN2025"].address)).to.equal(expectedPrice);
      expect(await resilientOracle.getUnderlyingPrice(marketSpecs["PT-sUSDE-26JUN2025"].vToken.address)).to.equal(
        expectedPrice,
      );
    });
  });
});
