import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip597, { NEW_CF, NEW_LI, NEW_LT, vslisBNB } from "../../vips/vip-597/bsctestnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import REDSTONE_ORACLE_ABI from "./abi/RedstoneOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { bsctestnet } = NETWORK_ADDRESSES;
const slisBNB = "0xd2aF6A916Bc77764dc63742BC30f71AF4cF423F4";

const setOraclePrice = async () => {
  const impersonatedTimelock = await initMainnetUser(bsctestnet.NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
  const resilientOracle = new ethers.Contract(bsctestnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const redstoneOracle = new ethers.Contract(bsctestnet.REDSTONE_ORACLE, REDSTONE_ORACLE_ABI, ethers.provider);

  await resilientOracle
    .connect(impersonatedTimelock)
    .setTokenConfig([
      slisBNB,
      [bsctestnet.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
      [true, false, false],
      false,
    ]);
  await redstoneOracle.connect(impersonatedTimelock).setDirectPrice(slisBNB, parseUnits("1", 18));
};

forking(93334375, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = new ethers.Contract(bsctestnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
    await setOraclePrice();
  });

  describe("Pre-VIP state", async () => {
    it("vslisBNB should have CF = 0%", async () => {
      const market = await comptroller.markets(vslisBNB);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0", 18));
    });

    it("vslisBNB should have LT = 0%", async () => {
      const market = await comptroller.markets(vslisBNB);
      expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0", 18));
    });

    it("vslisBNB should have LI = 0%", async () => {
      const market = await comptroller.markets(vslisBNB);
      expect(market.liquidationIncentiveMantissa).to.equal(parseUnits("1", 18));
    });
  });

  testVip("VIP-597 testnet [BNB Chain] slisBNB Core Pool Risk Parameter Update", await vip597(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["NewCollateralFactor", "NewLiquidationThreshold", "NewLiquidationIncentive"],
        [1, 1, 1],
      );
    },
  });

  describe("Post-VIP state", async () => {
    it("vslisBNB should have CF = 80%", async () => {
      const market = await comptroller.markets(vslisBNB);
      expect(market.collateralFactorMantissa).to.equal(NEW_CF);
    });

    it("vslisBNB should have LT = 80%", async () => {
      const market = await comptroller.markets(vslisBNB);
      expect(market.liquidationThresholdMantissa).to.equal(NEW_LT);
    });

    it("vslisBNB should have LI = 10%", async () => {
      const market = await comptroller.markets(vslisBNB);
      expect(market.liquidationIncentiveMantissa).to.equal(NEW_LI);
    });

    it("vslisBNB should remain listed", async () => {
      const market = await comptroller.markets(vslisBNB);
      expect(market.isListed).to.equal(true);
    });

    it("vslisBNB borrow should remain paused", async () => {
      expect(await comptroller.actionPaused(vslisBNB, 2)).to.equal(true);
    });

    it("vslisBNB borrow should remain disallowed", async () => {
      const market = await comptroller.markets(vslisBNB);
      expect(market.isBorrowAllowed).to.equal(false);
    });
  });
});
