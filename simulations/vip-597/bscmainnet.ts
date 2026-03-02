import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip597, { NEW_CF, NEW_LI, NEW_LT, vslisBNB } from "../../vips/vip-597/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import REDSTONE_ORACLE_ABI from "./abi/RedstoneOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const slisBNB = "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B";

const setOraclePrice = async () => {
  const impersonatedTimelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const redstoneOracle = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, REDSTONE_ORACLE_ABI, ethers.provider);

  await resilientOracle
    .connect(impersonatedTimelock)
    .setTokenConfig([
      slisBNB,
      [bscmainnet.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
      [true, false, false],
      false,
    ]);
  await redstoneOracle.connect(impersonatedTimelock).setDirectPrice(slisBNB, parseUnits("1", 18));
};

forking(84211032, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
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

    it("vslisBNB should have LI = 100% (no incentive bonus)", async () => {
      const market = await comptroller.markets(vslisBNB);
      expect(market.liquidationIncentiveMantissa).to.equal(parseUnits("1", 18));
    });
  });

  testVip("VIP-597 [BNB Chain] slisBNB Core Pool Risk Parameter Update", await vip597(), {
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

    it("vslisBNB should have LI = 110%", async () => {
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

    it("BNB Emode vslisBNB Risk Factors should remain unchanged", async () => {
      const BNB_EMODE_ID = 3;
      const market = await comptroller.poolMarkets(BNB_EMODE_ID, vslisBNB);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0.9", 18));
      expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.93", 18));
      expect(market.liquidationIncentiveMantissa).to.equal(parseUnits("1.04", 18));
    });

    describe("Collateral functionality", async () => {
      it("user can supply slisBNB and receive positive liquidity", async () => {
        const slisBNB_HOLDER = "0xdf36a2af333b01d772B0284Bc8EB6Eb8256C88dE";
        const slisBNBHolder = await initMainnetUser(slisBNB_HOLDER, ethers.utils.parseEther("1"));
        const [signer] = await ethers.getSigners();
        const userAddress = await signer.getAddress();

        const slisBNBToken = new ethers.Contract(slisBNB, ERC20_ABI, ethers.provider);
        const vslisBNBContract = new ethers.Contract(vslisBNB, VTOKEN_ABI, ethers.provider);

        const supplyAmount = parseUnits("0.03", 18);
        await slisBNBToken.connect(slisBNBHolder).transfer(userAddress, supplyAmount);
        await slisBNBToken.connect(signer).approve(vslisBNB, supplyAmount);
        await vslisBNBContract.connect(signer).mint(supplyAmount);

        const [, liquidityBeforeEnter] = await comptroller.getAccountLiquidity(userAddress);
        expect(liquidityBeforeEnter).to.equal(0);

        await comptroller.connect(signer).enterMarkets([vslisBNB]);

        const [, liquidity] = await comptroller.getAccountLiquidity(userAddress);
        expect(liquidity).to.be.gt(0);
      });
    });
  });
});
