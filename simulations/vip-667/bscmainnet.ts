import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser, setMaxStalePeriod } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import ERC20_ABI from "../../src/vip-framework/abi/erc20.json";
import RESILIENT_ORACLE_ABI from "../../src/vip-framework/abi/resilientOracle.json";
import { EMODE_POOL, vETH, vWBETH, vip667 } from "../../vips/vip-667/bscmainnet";
import VTOKEN_ABI from "../vip-587/abi/VToken.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const WBETH = "0xa2E3356610840701BDf5611a53974510Ae27E2e1";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
// sentinel EOAs with no prior Venus state
const EMODE_USER = "0x000000000000000000000000000000000000E667";
const NON_POOL_USER = "0x000000000000000000000000000000000000E668";

forking(123704678, async () => {
  let comptroller: Contract;
  let resilientOracle: Contract;
  before(async () => {
    comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
    resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
    // WBETH is priced off ETH; keep feeds fresh past the voting + timelock warp
    for (const asset of [ETH, WBETH, USDT]) {
      await setMaxStalePeriod(resilientOracle, new ethers.Contract(asset, ERC20_ABI, ethers.provider));
    }
  });

  describe("Pre-VIP behavior", async () => {
    it("new ETH emode pool gets the expected id", async () => {
      expect(await comptroller.lastPoolId()).to.equal(EMODE_POOL.id - 1);
    });
  });

  // default proposer Safe (0x3422…) has proposal 663 live at this block
  testVip("VIP-667", await vip667(), {
    proposer: "0xe5e62386933b74ea81bfd73a6a6591598e7f8ced",
    supporters: ["0x5176671de05380379399b669ed276feec99d59cb"],
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        [
          "PoolCreated",
          "PoolMarketInitialized",
          "NewCollateralFactor",
          "NewLiquidationThreshold",
          "NewLiquidationIncentive",
          "BorrowAllowedUpdated",
        ],
        [1, 2, 1, 1, 2, 1],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should update lastPoolId to the new pool", async () => {
      expect(await comptroller.lastPoolId()).to.equals(EMODE_POOL.id);
    });

    it("should set the newly created pool as active with correct config", async () => {
      const newPool = await comptroller.pools(EMODE_POOL.id);
      expect(newPool.label).to.equals(EMODE_POOL.label);
      expect(newPool.isActive).to.equals(true);
      expect(newPool.allowCorePoolFallback).to.equal(EMODE_POOL.allowCorePoolFallback);
    });

    it("should set the correct risk parameters to all pool markets", async () => {
      for (const config of Object.values(EMODE_POOL.marketsConfig)) {
        const marketData = await comptroller.poolMarkets(EMODE_POOL.id, config.address);
        expect(marketData.marketPoolId).to.be.equal(EMODE_POOL.id);
        expect(marketData.isListed).to.be.equal(true);
        expect(marketData.collateralFactorMantissa).to.be.equal(config.collateralFactor);
        expect(marketData.liquidationThresholdMantissa).to.be.equal(config.liquidationThreshold);
        expect(marketData.liquidationIncentiveMantissa).to.be.equal(config.liquidationIncentive);
        expect(marketData.isBorrowAllowed).to.be.equal(config.borrowAllowed);
      }
    });

    describe("E-mode user behavior", () => {
      const vToken = (address: string) => new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const erc20 = (address: string) => new ethers.Contract(address, ERC20_ABI, ethers.provider);

      // vToken contracts hold the underlying cash, so they double as whales
      const supply = async (user: Signer, vTokenAddress: string, underlying: string, amount: string) => {
        const whale = await initMainnetUser(vTokenAddress, parseUnits("1", 18));
        const userAddress = await user.getAddress();
        await erc20(underlying).connect(whale).transfer(userAddress, parseUnits(amount, 18));
        await erc20(underlying).connect(user).approve(vTokenAddress, parseUnits(amount, 18));
        await vToken(vTokenAddress).connect(user).mint(parseUnits(amount, 18));
      };

      let emodeUser: Signer;
      before(async () => {
        emodeUser = await initMainnetUser(EMODE_USER, parseUnits("1", 18));
        await supply(emodeUser, vWBETH, WBETH, "10");
        await comptroller.connect(emodeUser).enterMarkets([vWBETH]);
        await comptroller.connect(emodeUser).enterPool(EMODE_POOL.id);
      });

      it("prices WBETH collateral at the e-mode CF, not the core one", async () => {
        const supplied = await vToken(vWBETH).callStatic.balanceOfUnderlying(EMODE_USER);
        const price = await resilientOracle.getUnderlyingPrice(vWBETH);
        const expected = supplied
          .mul(price)
          .div(parseUnits("1", 18))
          .mul(EMODE_POOL.marketsConfig.vWBETH.collateralFactor)
          .div(parseUnits("1", 18));
        const [, liquidity, shortfall] = await comptroller.getBorrowingPower(EMODE_USER);
        expect(shortfall).to.equal(0);
        expect(liquidity).to.be.closeTo(expected, expected.div(1_000_000));
      });

      it("can borrow ETH against WBETH", async () => {
        const before = await erc20(ETH).balanceOf(EMODE_USER);
        await vToken(vETH).connect(emodeUser).borrow(parseUnits("5", 18));
        expect(await erc20(ETH).balanceOf(EMODE_USER)).to.equal(before.add(parseUnits("5", 18)));
      });

      it("cannot borrow WBETH", async () => {
        await expect(vToken(vWBETH).connect(emodeUser).borrow(parseUnits("0.1", 18))).to.be.revertedWithCustomError(
          comptroller,
          "BorrowNotAllowedInPool",
        );
      });

      it("cannot borrow a market outside the pool", async () => {
        await expect(vToken(vUSDT).connect(emodeUser).borrow(parseUnits("10", 18))).to.be.revertedWithCustomError(
          comptroller,
          "BorrowNotAllowedInPool",
        );
      });

      it("gives no borrowing power to ETH or non-pool collateral (fallback off)", async () => {
        const user = await initMainnetUser(NON_POOL_USER, parseUnits("1", 18));
        await supply(user, vETH, ETH, "1");
        await supply(user, vUSDT, USDT, "1000");
        await comptroller.connect(user).enterMarkets([vETH, vUSDT]);
        await comptroller.connect(user).enterPool(EMODE_POOL.id);

        const [, liquidity] = await comptroller.getBorrowingPower(NON_POOL_USER);
        expect(liquidity).to.equal(0);
      });
    });
  });
});
