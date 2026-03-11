import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser, setMaxStalePeriodInBinanceOracle, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { ALL_MARKETS, Actions, CORE_POOL_ID, TUSD_MARKET, vLINK, vip599 } from "../../vips/vip-599/bscmainnet";
import COMPTROLLER_ABI from "../vip-587/abi/Comptroller.json";
import ERC20_ABI from "../vip-587/abi/ERC20.json";
import VTOKEN_ABI from "../vip-587/abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const BLOCK_NUMBER = 85550618;

// E-Mode pool IDs (created in VIP-587)
const EMODE_LINK_POOL_ID = 4;

// Stablecoin addresses (Core Pool)
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
// LINK underlying
const LINK = "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD";
const LINK_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC";

// TUSD underlying
const TUSD = "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9";
const vTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
const TUSD_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC";

// Map vToken address to underlying info (from vip-587 simulations)
const MARKET_INFO: Record<string, { underlying: string; whale: string; decimals: number }> = {
  // LINK
  "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f": {
    underlying: LINK,
    whale: LINK_WHALE,
    decimals: 18,
  },
  // UNI
  "0x27FF564707786720C71A2e5c1490A63266683612": {
    underlying: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",
    whale: "0x27FF564707786720C71A2e5c1490A63266683612",
    decimals: 18,
  },
  // AAVE
  "0x26DA28954763B92139ED49283625ceCAf52C6f94": {
    underlying: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    whale: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
    decimals: 18,
  },
  // DOGE
  "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71": {
    underlying: "0xba2ae424d960c26247dd6c32edc70b295c744c43",
    whale: "0x0000000000000000000000000000000000001004",
    decimals: 8,
  },
  // BCH
  "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176": {
    underlying: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    whale: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
    decimals: 18,
  },
  // TWT
  "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc": {
    underlying: "0x4B0F1812e5Df2A09796481Ff14017e6005508003",
    whale: "0x8808390062EBcA540ff10ee43DB60125bB061621",
    decimals: 18,
  },
  // ADA
  "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec": {
    underlying: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    whale: "0x835678a611B28684005a5e2233695fB6cbbB0007",
    decimals: 18,
  },
  // LTC
  "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B": {
    underlying: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    whale: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
    decimals: 18,
  },
  // FIL
  "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343": {
    underlying: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    whale: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
    decimals: 18,
  },
  // TRX
  "0xC5D3466aA484B040eE977073fcF337f2c00071c1": {
    underlying: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
    whale: "0xCa266910d92a313E5F9eb1AfFC462bcbb7d9c4A9",
    decimals: 6,
  },
  // DOT
  "0x1610bc33319e9398de5f57B33a5b184c806aD217": {
    underlying: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    whale: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
    decimals: 18,
  },
  // THE
  "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f": {
    underlying: "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11",
    whale: "0xfBBF371C9B0B994EebFcC977CEf603F7f31c070D",
    decimals: 18,
  },
  // TUSD
  [vTUSD]: {
    underlying: TUSD,
    whale: TUSD_WHALE,
    decimals: 18,
  },
};

// Oracle staleness period (100 years)
const MAX_STALE_PERIOD = 3153600000;

forking(BLOCK_NUMBER, async () => {
  let comptroller: Contract;
  let linkToken: Contract;
  let vLinkToken: Contract;
  let usdtToken: Contract;
  let vUsdtToken: Contract;

  // Pre-VIP borrower: supplies LINK collateral + borrows LINK in Core Pool (before VIP disables borrowing)
  let corePoolBorrower: Signer;
  let corePoolBorrowerAddress: string;
  const linkBorrowAmount = parseUnits("1", 18);

  before(async () => {
    comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
    linkToken = new ethers.Contract(LINK, ERC20_ABI, ethers.provider);
    vLinkToken = new ethers.Contract(vLINK, VTOKEN_ABI, ethers.provider);
    usdtToken = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
    vUsdtToken = new ethers.Contract(vUSDT, VTOKEN_ABI, ethers.provider);

    // Set oracle staleness for assets used in functional tests
    const oracleAssets = [
      { underlying: LINK, symbol: "LINK" },
      { underlying: USDT, symbol: "USDT" },
    ];
    for (const asset of oracleAssets) {
      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.CHAINLINK_ORACLE,
        asset.underlying,
        ethers.constants.AddressZero,
        bscmainnet.NORMAL_TIMELOCK,
        MAX_STALE_PERIOD,
      );
      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.REDSTONE_ORACLE,
        asset.underlying,
        ethers.constants.AddressZero,
        bscmainnet.NORMAL_TIMELOCK,
        MAX_STALE_PERIOD,
      );
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, asset.symbol, MAX_STALE_PERIOD);
    }

    // Setup Core Pool borrower BEFORE VIP (while borrowing is still allowed)
    corePoolBorrowerAddress = "0x0000000000000000000000000000000000000099";
    corePoolBorrower = await initMainnetUser(corePoolBorrowerAddress, parseUnits("10", 18));

    const linkWhale = await initMainnetUser(LINK_WHALE, parseUnits("1", 18));
    const supplyAmount = parseUnits("100", 18);
    await linkToken.connect(linkWhale).transfer(corePoolBorrowerAddress, supplyAmount);
    await linkToken.connect(corePoolBorrower).approve(vLINK, supplyAmount);
    await comptroller.connect(corePoolBorrower).enterMarkets([vLINK]);
    await vLinkToken.connect(corePoolBorrower).mint(supplyAmount);

    // Borrow a small amount of LINK against LINK collateral (CF=0.63 pre-VIP)
    await vLinkToken.connect(corePoolBorrower).borrow(linkBorrowAmount);
  });

  describe("Pre-VIP behavior", async () => {
    for (const market of ALL_MARKETS) {
      it(`${market.symbol} should have non-zero collateral factor in Core Pool`, async () => {
        const data = await comptroller.poolMarkets(CORE_POOL_ID, market.vToken);
        expect(data.collateralFactorMantissa).to.be.gt(0);
      });

      it(`${market.symbol} should have borrowing enabled in Core Pool`, async () => {
        const data = await comptroller.poolMarkets(CORE_POOL_ID, market.vToken);
        expect(data.isBorrowAllowed).to.equal(true);
      });
    }

    it("Core Pool borrower should have an active LINK borrow", async () => {
      const borrowBalance = await vLinkToken.callStatic.borrowBalanceCurrent(corePoolBorrowerAddress);
      expect(borrowBalance).to.be.gte(linkBorrowAmount);
    });
  });

  testVip("VIP-599", await vip599(), {
    callbackAfterExecution: async txResponse => {
      await expect(txResponse).to.emit(comptroller, "NewCollateralFactor");
      await expect(txResponse).to.emit(comptroller, "BorrowAllowedUpdated");
    },
  });

  describe("Post-VIP behavior", async () => {
    for (const market of ALL_MARKETS) {
      describe(`${market.symbol}`, () => {
        it("should have collateral factor set to 0 in Core Pool", async () => {
          const data = await comptroller.poolMarkets(CORE_POOL_ID, market.vToken);
          expect(data.collateralFactorMantissa).to.equal(0);
        });

        it("should keep liquidation threshold unchanged", async () => {
          const data = await comptroller.poolMarkets(CORE_POOL_ID, market.vToken);
          expect(data.liquidationThresholdMantissa).to.equal(market.liquidationThreshold);
        });

        it("should have borrowing disabled in Core Pool", async () => {
          const data = await comptroller.poolMarkets(CORE_POOL_ID, market.vToken);
          expect(data.isBorrowAllowed).to.equal(false);
        });
      });
    }

    describe("TUSD should have mint action paused", () => {
      it("should have mint action paused", async () => {
        const paused = await comptroller.actionPaused(TUSD_MARKET.vToken, Actions.MINT);
        expect(paused).to.be.true;
      });

      it("should revert when trying to mint vTUSD", async () => {
        const tusdWhale = await initMainnetUser(TUSD_WHALE, parseUnits("1", 18));
        const tusdToken = new ethers.Contract(TUSD, ERC20_ABI, ethers.provider);
        const vTusdToken = new ethers.Contract(vTUSD, VTOKEN_ABI, ethers.provider);
        const mintAmount = parseUnits("1", 18);

        await tusdToken.connect(tusdWhale).approve(vTUSD, mintAmount);
        await expect(vTusdToken.connect(tusdWhale).mint(mintAmount)).to.be.reverted;
      });
    });

    describe("Functional tests: borrow should be blocked", () => {
      let user: Signer;
      let userAddress: string;

      before(async () => {
        userAddress = "0x000000000000000000000000000000000000dEaD";
        user = await initMainnetUser(userAddress, parseUnits("10", 18));
      });

      for (const market of ALL_MARKETS) {
        const info = MARKET_INFO[market.vToken];
        if (!info) continue;

        it(`${market.symbol} should revert when trying to borrow`, async () => {
          const vToken = new ethers.Contract(market.vToken, VTOKEN_ABI, ethers.provider);
          const borrowAmount = parseUnits("1", info.decimals);

          await expect(vToken.connect(user).borrow(borrowAmount)).to.be.revertedWithCustomError(
            comptroller,
            "BorrowNotAllowedInPool",
          );
        });
      }
    });

    describe("E-Mode pools remain functional after Core Pool changes", () => {
      let emodeUser: Signer;
      let emodeUserAddress: string;

      before(async () => {
        emodeUserAddress = "0x0000000000000000000000000000000000000001";
        emodeUser = await initMainnetUser(emodeUserAddress, parseUnits("10", 18));

        // Fund user with LINK
        const linkWhale = await initMainnetUser(LINK_WHALE, parseUnits("1", 18));
        await linkToken.connect(linkWhale).transfer(emodeUserAddress, parseUnits("50", 18));

        // Enter LINK E-Mode pool (pool 4)
        await comptroller.connect(emodeUser).enterPool(EMODE_LINK_POOL_ID);

        // Supply LINK as collateral in E-Mode
        await linkToken.connect(emodeUser).approve(vLINK, parseUnits("50", 18));
        await comptroller.connect(emodeUser).enterMarkets([vLINK]);
        await vLinkToken.connect(emodeUser).mint(parseUnits("50", 18));
      });

      it("should allow supplying LINK in E-Mode pool", async () => {
        expect(await vLinkToken.balanceOf(emodeUserAddress)).to.be.gt(0);
      });

      it("LINK should retain non-zero CF in E-Mode pool (pool 4)", async () => {
        const data = await comptroller.poolMarkets(EMODE_LINK_POOL_ID, vLINK);
        expect(data.collateralFactorMantissa).to.equal(parseUnits("0.63", 18));
        expect(data.isBorrowAllowed).to.equal(true);
      });

      it("should allow borrowing USDT against LINK collateral in E-Mode", async () => {
        const borrowAmount = parseUnits("1", 18);
        await expect(vUsdtToken.connect(emodeUser).borrow(borrowAmount)).to.not.be.reverted;
        expect(await usdtToken.balanceOf(emodeUserAddress)).to.be.gte(borrowAmount);
      });

      it("should have positive account liquidity in E-Mode", async () => {
        const [error, liquidity, shortfall] = await comptroller.getAccountLiquidity(emodeUserAddress);
        expect(error).to.equal(0);
        expect(liquidity).to.be.gt(0);
        expect(shortfall).to.equal(0);
      });
    });

    describe("Core Pool: supply works, LT > 0 increases health factor", () => {
      let supplier: Signer;
      let supplierAddress: string;

      before(async () => {
        supplierAddress = "0x0000000000000000000000000000000000000002";
        supplier = await initMainnetUser(supplierAddress, parseUnits("10", 18));

        // Fund user with LINK
        const linkWhale = await initMainnetUser(LINK_WHALE, parseUnits("1", 18));
        await linkToken.connect(linkWhale).transfer(supplierAddress, parseUnits("50", 18));
      });

      it("should allow minting vLINK (supply) in Core Pool", async () => {
        const mintAmount = parseUnits("50", 18);
        await linkToken.connect(supplier).approve(vLINK, mintAmount);
        await comptroller.connect(supplier).enterMarkets([vLINK]);

        await expect(vLinkToken.connect(supplier).mint(mintAmount)).to.not.be.reverted;
        expect(await vLinkToken.balanceOf(supplierAddress)).to.be.gt(0);
      });

      it("should have positive health margin despite CF=0 (getAccountLiquidity uses LT)", async () => {
        // getAccountLiquidity uses LT for the health calculation, NOT CF.
        // With CF=0 and LT=0.63, supply still contributes to account health.
        const [error, liquidity, shortfall] = await comptroller.getAccountLiquidity(supplierAddress);
        expect(error).to.equal(0);
        expect(liquidity).to.be.gt(0); // LT > 0 → positive health margin
        expect(shortfall).to.equal(0);
      });

      it("supplying more should increase health factor for existing borrowers (LT > 0)", async () => {
        // The Core Pool borrower (set up pre-VIP) has 100 LINK supply + 1 LINK borrow.
        // After VIP, CF=0 but LT=0.63 — supply still contributes to health factor.
        const [error, , shortfall] = await comptroller.getAccountLiquidity(corePoolBorrowerAddress);
        expect(error).to.equal(0);
        expect(shortfall).to.equal(0); // Position is healthy (LT-based health margin)

        // Record health margin before additional supply
        const [, liquidityBefore] = await comptroller.getAccountLiquidity(corePoolBorrowerAddress);
        expect(liquidityBefore).to.be.gt(0);

        // Supply additional LINK to the borrower's position
        const additionalAmount = parseUnits("50", 18);
        const linkWhale = await initMainnetUser(LINK_WHALE, parseUnits("1", 18));
        await linkToken.connect(linkWhale).transfer(corePoolBorrowerAddress, additionalAmount);
        await linkToken.connect(corePoolBorrower).approve(vLINK, additionalAmount);
        await vLinkToken.connect(corePoolBorrower).mint(additionalAmount);

        // Health margin should increase: more supply with LT > 0 → better health
        const [errorAfter, liquidityAfter, shortfallAfter] = await comptroller.getAccountLiquidity(
          corePoolBorrowerAddress,
        );
        expect(errorAfter).to.equal(0);
        expect(shortfallAfter).to.equal(0);
        expect(liquidityAfter).to.be.gt(liquidityBefore);
      });
    });

    describe("Core Pool: existing debt can be repaid", () => {
      it("should still have an active LINK borrow after VIP", async () => {
        const borrowBalance = await vLinkToken.callStatic.borrowBalanceCurrent(corePoolBorrowerAddress);
        expect(borrowBalance).to.be.gt(0);
      });

      it("should allow repaying existing LINK borrow", async () => {
        // Ensure borrower has enough LINK to cover debt + interest
        const borrowBalance: BigNumber = await vLinkToken.callStatic.borrowBalanceCurrent(corePoolBorrowerAddress);
        const buffer = borrowBalance.add(parseUnits("1", 18)); // extra buffer for interest accrual
        const currentBalance: BigNumber = await linkToken.balanceOf(corePoolBorrowerAddress);
        if (currentBalance.lt(buffer)) {
          const linkWhale = await initMainnetUser(LINK_WHALE, parseUnits("1", 18));
          await linkToken.connect(linkWhale).transfer(corePoolBorrowerAddress, buffer.sub(currentBalance));
        }

        // Use MaxUint256 to repay exact outstanding balance (avoids dust from interest accrual)
        await linkToken.connect(corePoolBorrower).approve(vLINK, ethers.constants.MaxUint256);
        await expect(vLinkToken.connect(corePoolBorrower).repayBorrow(ethers.constants.MaxUint256)).to.not.be.reverted;

        const borrowBalanceAfter = await vLinkToken.callStatic.borrowBalanceCurrent(corePoolBorrowerAddress);
        expect(borrowBalanceAfter).to.equal(0);
      });

      it("should NOT allow new borrows after repaying", async () => {
        await expect(vLinkToken.connect(corePoolBorrower).borrow(parseUnits("1", 18))).to.be.revertedWithCustomError(
          comptroller,
          "BorrowNotAllowedInPool",
        );
      });
    });

    describe("Core Pool: users can still withdraw", () => {
      it("should allow redeeming vLINK (withdraw) from Core Pool", async () => {
        // The Core Pool borrower has repaid all debt above, so they can freely redeem
        const vTokenBalance: BigNumber = await vLinkToken.balanceOf(corePoolBorrowerAddress);
        expect(vTokenBalance).to.be.gt(0);

        const linkBalanceBefore: BigNumber = await linkToken.balanceOf(corePoolBorrowerAddress);
        await expect(vLinkToken.connect(corePoolBorrower).redeem(vTokenBalance)).to.not.be.reverted;

        const linkBalanceAfter: BigNumber = await linkToken.balanceOf(corePoolBorrowerAddress);
        expect(linkBalanceAfter).to.be.gt(linkBalanceBefore);

        const vTokenBalanceAfter = await vLinkToken.balanceOf(corePoolBorrowerAddress);
        expect(vTokenBalanceAfter).to.equal(0);
      });

      it("should allow partial redeem via redeemUnderlying", async () => {
        // Use the supplier (from borrow-power test) who still has vLINK
        const supplierAddress = "0x0000000000000000000000000000000000000002";
        const supplier = await initMainnetUser(supplierAddress, parseUnits("1", 18));

        const redeemAmount = parseUnits("10", 18);
        const linkBalanceBefore: BigNumber = await linkToken.balanceOf(supplierAddress);
        await expect(vLinkToken.connect(supplier).redeemUnderlying(redeemAmount)).to.not.be.reverted;

        const linkBalanceAfter: BigNumber = await linkToken.balanceOf(supplierAddress);
        expect(linkBalanceAfter.sub(linkBalanceBefore)).to.equal(redeemAmount);
      });
    });
  });
});
