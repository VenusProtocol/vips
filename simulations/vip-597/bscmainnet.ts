import { expect } from "chai";
import { Contract, Signer } from "ethers";
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
const USDT = "0x55d398326f99059fF775485246999027B3197955";

const setOraclePrice = async (token: string, price: string) => {
  const impersonatedTimelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const redstoneOracle = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, REDSTONE_ORACLE_ABI, ethers.provider);

  await resilientOracle
    .connect(impersonatedTimelock)
    .setTokenConfig([
      token,
      [bscmainnet.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
      [true, false, false],
      false,
    ]);
  await redstoneOracle.connect(impersonatedTimelock).setDirectPrice(token, parseUnits(price, 18));
};

forking(84211032, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
    await setOraclePrice(slisBNB, "1");
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
      const slisBNB_HOLDER = "0xdf36a2af333b01d772B0284Bc8EB6Eb8256C88dE";
      let slisBNBToken: Contract;
      let vslisBNBContract: Contract;
      let userAddress: string;
      let signer: Signer;

      beforeEach(async () => {
        [signer] = await ethers.getSigners();
        userAddress = await signer.getAddress();
        slisBNBToken = new ethers.Contract(slisBNB, ERC20_ABI, ethers.provider);
        vslisBNBContract = new ethers.Contract(vslisBNB, VTOKEN_ABI, ethers.provider);
      });

      it("user can supply slisBNB and receive positive liquidity", async () => {
        const slisBNBHolder = await initMainnetUser(slisBNB_HOLDER, ethers.utils.parseEther("1"));

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

      it("borrowing vslisBNB should revert", async () => {
        await expect(vslisBNBContract.connect(signer).borrow(parseUnits("0.01", 18))).to.be.reverted;
      });

      it("user can supply, withdraw, and borrow another asset against slisBNB collateral", async () => {
        const LARGE_HOLDER = "0x1adB950d8bB3dA4bE104211D5AB038628e477fE6";
        const slisBNBHolder = await initMainnetUser(LARGE_HOLDER, ethers.utils.parseEther("1"));

        const supplyAmount = parseUnits("1", 18);
        await slisBNBToken.connect(slisBNBHolder).transfer(userAddress, supplyAmount);
        await slisBNBToken.connect(signer).approve(vslisBNB, supplyAmount);

        // Supply slisBNB
        const slisBNBBefore = await slisBNBToken.balanceOf(userAddress);
        await vslisBNBContract.connect(signer).mint(supplyAmount);
        expect(await slisBNBToken.balanceOf(userAddress)).to.equal(slisBNBBefore.sub(supplyAmount));

        const vTokenBalance = await vslisBNBContract.balanceOf(userAddress);
        expect(vTokenBalance).to.be.gt(0);

        // Partial withdraw
        const redeemAmount = vTokenBalance.div(2);
        await vslisBNBContract.connect(signer).redeem(redeemAmount);
        expect(await vslisBNBContract.balanceOf(userAddress)).to.equal(vTokenBalance.sub(redeemAmount));
        expect(await slisBNBToken.balanceOf(userAddress)).to.be.gt(0);

        // Enter market and verify liquidity
        await comptroller.connect(signer).enterMarkets([vslisBNB]);
        const [, liquidity] = await comptroller.getAccountLiquidity(userAddress);
        expect(liquidity).to.be.gt(0);

        // Borrow USDT against slisBNB collateral
        await setOraclePrice(USDT, "1");

        const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
        const usdtToken = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
        const vUSDTContract = new ethers.Contract(vUSDT, VTOKEN_ABI, ethers.provider);

        const usdtBefore = await usdtToken.balanceOf(userAddress);
        const borrowAmount = parseUnits("0.001", 18);
        await vUSDTContract.connect(signer).borrow(borrowAmount);
        expect(await usdtToken.balanceOf(userAddress)).to.equal(usdtBefore.add(borrowAmount));

        // Liquidity should decrease after borrow
        const [, liquidityAfterBorrow] = await comptroller.getAccountLiquidity(userAddress);
        expect(liquidityAfterBorrow).to.be.lt(liquidity);
        expect(liquidityAfterBorrow).to.be.gt(0);
      });
    });
  });
});
