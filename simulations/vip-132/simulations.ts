import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumberish } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { initMainnetUser, setMaxStalePeriodInBinanceOracle, setMaxStalePeriodInChainlinkOracle } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip132 } from "../../vips/vip-132";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import RATE_MODEL_ABI from "./abi/rateModel.json";
import SWAP_ROUTER_ABI from "./abi/swapRouter.json";
import VTOKEN_ABI from "./abi/vToken.json";

const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
const USDT_FEED = "0xB97Ad0E74fa7d920791E90258A6E2085088b4320";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
const COMPTROLLER_STABLECOINS = "0x94c1495cD4c557f1560Cbd68EAB0d197e6291571";
const SWAP_ROUTER_STABLECOINS = "0x50d8ac56FC8525dcA9F41b12De0dbc6bDf7771e3";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

const HAY = "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const USDD = "0xd17479997F34dd9156Deef8F95A52D81D265be9c";
const VHAY_STABLECOINS = "0xCa2D81AA7C09A1a025De797600A7081146dceEd9";
const VUSDT_STABLECOINS = "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B";
const VUSDD_STABLECOINS = "0xc3a45ad8812189cAb659aD99E64B1376f6aCD035";

const VHAY_RECEIVER = "0x09702Ea135d9D707DD51f530864f2B9220aAD87B";
const VUSDD_RECEIVER = "0x3DdfA8eC3052539b6C9549F12cEA2C295cfF5296";

forking(29441800, () => {
  let poolRegistry: Contract;
  let comptroller: Contract;
  let swapRouter: Contract;
  let vHAY: Contract;
  let vUSDT: Contract;
  let vUSDD: Contract;

  before(async () => {
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_STABLECOINS);
    swapRouter = await ethers.getContractAt(SWAP_ROUTER_ABI, SWAP_ROUTER_STABLECOINS);
    vHAY = await ethers.getContractAt(VTOKEN_ABI, VHAY_STABLECOINS);
    vUSDT = await ethers.getContractAt(VTOKEN_ABI, VUSDT_STABLECOINS);
    vUSDD = await ethers.getContractAt(VTOKEN_ABI, VUSDD_STABLECOINS);
    await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, "HAY");
    await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, "USDD");
    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, USDT, USDT_FEED, NORMAL_TIMELOCK);
  });

  describe("Contracts setup", () => {
    const checkVToken = (
      vTokenAddress: string,
      {
        name,
        symbol,
        decimals,
        underlying,
        exchangeRate,
      }: {
        name: string;
        symbol: string;
        decimals: BigNumberish;
        underlying: string;
        exchangeRate: BigNumberish;
      },
    ) => {
      describe(symbol, () => {
        let vToken: Contract;

        before(async () => {
          vToken = await ethers.getContractAt(VTOKEN_ABI, vTokenAddress);
        });

        it(`should have name = "${name}"`, async () => {
          expect(await vToken.name()).to.equal(name);
        });

        it(`should have symbol = "${symbol}"`, async () => {
          expect(await vToken.symbol()).to.equal(symbol);
        });

        it(`should have ${decimals.toString()} decimals`, async () => {
          expect(await vToken.decimals()).to.equal(decimals);
        });

        it(`should have underlying = "${underlying}"`, async () => {
          expect(await vToken.underlying()).to.equal(underlying);
        });

        it(`should have initial exchange rate of ${exchangeRate.toString()}`, async () => {
          expect(await vToken.exchangeRateStored()).to.equal(exchangeRate);
        });

        it("should have the correct Comptroller", async () => {
          expect(await vToken.exchangeRateStored()).to.equal(exchangeRate);
        });
      });
    };

    checkVToken(VHAY_STABLECOINS, {
      name: "Venus HAY (Stablecoins)",
      symbol: "vHAY_Stablecoins",
      decimals: 8,
      underlying: HAY,
      exchangeRate: parseUnits("1", 28),
    });

    checkVToken(VUSDT_STABLECOINS, {
      name: "Venus USDT (Stablecoins)",
      symbol: "vUSDT_Stablecoins",
      decimals: 8,
      underlying: USDT,
      exchangeRate: parseUnits("1", 28),
    });

    checkVToken(VUSDD_STABLECOINS, {
      name: "Venus USDD (Stablecoins)",
      symbol: "vUSDD_Stablecoins",
      decimals: 8,
      underlying: USDD,
      exchangeRate: parseUnits("1", 28),
    });
  });

  testVip("VIP-132 IL", vip132());

  describe("Post-VIP state", () => {
    describe("PoolRegistry state", () => {
      it("should register pool's Comptroller in PoolRegistry", async () => {
        const pools = await poolRegistry.getAllPools();
        expect(pools).to.have.lengthOf(1);
        const pool = pools[0];
        expect(pool.name).to.equal("Stablecoins");
        expect(pool.creator).to.equal(NORMAL_TIMELOCK);
        expect(pool.comptroller).to.equal(COMPTROLLER_STABLECOINS);
      });

      it("should register pool's vTokens in Comptroller", async () => {
        const vTokens = await comptroller.getAllMarkets();
        expect(vTokens).to.have.lengthOf(3);
        expect(vTokens).to.include(VHAY_STABLECOINS);
        expect(vTokens).to.include(VUSDT_STABLECOINS);
        expect(vTokens).to.include(VUSDD_STABLECOINS);
      });

      it("should register vHAY_Stablecoins in PoolRegistry", async () => {
        const vHAYActual = await poolRegistry.getVTokenForAsset(COMPTROLLER_STABLECOINS, HAY);
        expect(vHAYActual).to.equal(VHAY_STABLECOINS);
      });

      it("should register vUSDT_Stablecoins in PoolRegistry", async () => {
        const vUSDTActual = await poolRegistry.getVTokenForAsset(COMPTROLLER_STABLECOINS, USDT);
        expect(vUSDTActual).to.equal(VUSDT_STABLECOINS);
      });

      it("should register vUSDD_Stablecoins in PoolRegistry", async () => {
        const vUSDDActual = await poolRegistry.getVTokenForAsset(COMPTROLLER_STABLECOINS, USDD);
        expect(vUSDDActual).to.equal(VUSDD_STABLECOINS);
      });
    });

    describe("Ownership", () => {
      it("should transfer ownership of PoolRegistry to Timelock", async () => {
        expect(await poolRegistry.owner()).to.equal(NORMAL_TIMELOCK);
      });

      it("should transfer ownership of Comptroller to Timelock", async () => {
        expect(await comptroller.owner()).to.equal(NORMAL_TIMELOCK);
      });

      it("should transfer ownership of SwapRouter to Timelock", async () => {
        expect(await swapRouter.owner()).to.equal(NORMAL_TIMELOCK);
      });

      it("should transfer ownership of vHAY_Stablecoins to Timelock", async () => {
        expect(await vHAY.owner()).to.equal(NORMAL_TIMELOCK);
      });

      it("should transfer ownership of vUSDT_Stablecoins to Timelock", async () => {
        expect(await vUSDT.owner()).to.equal(NORMAL_TIMELOCK);
      });

      it("should transfer ownership of vUSDD_Stablecoins to Timelock", async () => {
        expect(await vUSDD.owner()).to.equal(NORMAL_TIMELOCK);
      });
    });

    describe("Initial supply", () => {
      it(`should mint 25,000 vHAY_Stablecoins to ${VHAY_RECEIVER}`, async () => {
        expect(await vHAY.balanceOf(VHAY_RECEIVER)).to.equal(parseUnits("25000", 8));
      });

      it(`should mint 10,000 vUSDT_Stablecoins to Treasury`, async () => {
        expect(await vUSDT.balanceOf(TREASURY)).to.equal(parseUnits("10000", 8));
      });

      it(`should mint 10,000 vUSDD_Stablecoins to ${VUSDD_RECEIVER}`, async () => {
        expect(await vUSDD.balanceOf(VUSDD_RECEIVER)).to.equal(parseUnits("10000", 8));
      });
    });

    describe("Market and risk parameters", () => {
      const checkInterestRate = (
        vTokenAddress: string,
        symbol: string,
        {
          base,
          multiplier,
          jump,
          kink,
        }: {
          base: string;
          multiplier: string;
          jump: string;
          kink: string;
        },
      ) => {
        describe(`${symbol} interest rate model`, () => {
          const BLOCKS_PER_YEAR = 10512000;
          let rateModel: Contract;

          before(async () => {
            const vToken = await ethers.getContractAt(VTOKEN_ABI, vTokenAddress);
            rateModel = await ethers.getContractAt(RATE_MODEL_ABI, await vToken.interestRateModel());
          });

          it(`should have base = ${base}`, async () => {
            const basePerBlock = parseUnits(base, 18).div(BLOCKS_PER_YEAR);
            expect(await rateModel.baseRatePerBlock()).to.equal(basePerBlock);
          });

          it(`should have jump = ${jump}`, async () => {
            const jumpPerBlock = parseUnits(jump, 18).div(BLOCKS_PER_YEAR);
            expect(await rateModel.jumpMultiplierPerBlock()).to.equal(jumpPerBlock);
          });

          it(`should have multiplier = ${multiplier}`, async () => {
            const multiplierPerBlock = parseUnits(multiplier, 18).div(BLOCKS_PER_YEAR);
            expect(await rateModel.multiplierPerBlock()).to.equal(multiplierPerBlock);
          });

          it(`should have kink = ${kink}`, async () => {
            expect(await rateModel.kink()).to.equal(parseUnits(kink, 18));
          });
        });
      };

      describe("Interest rate models", () => {
        checkInterestRate(VHAY_STABLECOINS, "vHAY_Stablecoins", {
          base: "0.02",
          multiplier: "0.1",
          jump: "3",
          kink: "0.8",
        });

        checkInterestRate(VUSDT_STABLECOINS, "vUSDT_Stablecoins", {
          base: "0.02",
          multiplier: "0.05",
          jump: "2.5",
          kink: "0.6",
        });

        checkInterestRate(VUSDD_STABLECOINS, "vUSDD_Stablecoins", {
          base: "0.02",
          multiplier: "0.1",
          jump: "3",
          kink: "0.8",
        });
      });

      describe("Reserve factors", () => {
        it("should set vHAY_Stablecoins reserve factor to 0.2", async () => {
          expect(await vHAY.reserveFactorMantissa()).to.equal(parseUnits("0.2", 18));
        });

        it("should set vUSDT_Stablecoins reserve factor to 0.1", async () => {
          expect(await vUSDT.reserveFactorMantissa()).to.equal(parseUnits("0.1", 18));
        });

        it("should set vUSDD_Stablecoins reserve factor to 0.1", async () => {
          expect(await vUSDD.reserveFactorMantissa()).to.equal(parseUnits("0.1", 18));
        });
      });

      describe("Collateral factors", () => {
        it("should set vHAY_Stablecoins collateral factor to 0.65", async () => {
          const market = await comptroller.markets(VHAY_STABLECOINS);
          expect(market.collateralFactorMantissa).to.equal(parseUnits("0.65", 18));
        });

        it("should set vUSDT_Stablecoins collateral factor to 0.8", async () => {
          const market = await comptroller.markets(VUSDT_STABLECOINS);
          expect(market.collateralFactorMantissa).to.equal(parseUnits("0.8", 18));
        });

        it("should set vUSDD_Stablecoins collateral factor to 0.65", async () => {
          const market = await comptroller.markets(VUSDD_STABLECOINS);
          expect(market.collateralFactorMantissa).to.equal(parseUnits("0.65", 18));
        });
      });

      describe("Liquidation thresholds", () => {
        it("should set vHAY_Stablecoins liquidation threshold to 0.7", async () => {
          const market = await comptroller.markets(VHAY_STABLECOINS);
          expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.7", 18));
        });

        it("should set vUSDT_Stablecoins liquidation threshold to 0.88", async () => {
          const market = await comptroller.markets(VUSDT_STABLECOINS);
          expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.88", 18));
        });

        it("should set vUSDD_Stablecoins liquidation threshold to 0.7", async () => {
          const market = await comptroller.markets(VUSDD_STABLECOINS);
          expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.7", 18));
        });
      });

      describe("Protocol seize share", () => {
        it("should set protocol seize share to 0.05 for all markets", async () => {
          await Promise.all(
            [vHAY, vUSDT, vUSDD].map(async vToken => {
              expect(await vToken.protocolSeizeShareMantissa()).to.equal(parseUnits("0.05", 18));
            }),
          );
        });
      });

      describe("Caps", () => {
        it("should set vHAY_Stablecoins supply cap to 500,000", async () => {
          expect(await comptroller.supplyCaps(VHAY_STABLECOINS)).to.equal(parseUnits("500000", 18));
        });

        it("should set vHAY_Stablecoins borrow cap to 200,000", async () => {
          expect(await comptroller.borrowCaps(VHAY_STABLECOINS)).to.equal(parseUnits("200000", 18));
        });

        it("should set vUSDT_Stablecoins supply cap to 1,000,000", async () => {
          expect(await comptroller.supplyCaps(VUSDT_STABLECOINS)).to.equal(parseUnits("1000000", 18));
        });

        it("should set vUSDT_Stablecoins borrow cap to 400,000", async () => {
          expect(await comptroller.borrowCaps(VUSDT_STABLECOINS)).to.equal(parseUnits("400000", 18));
        });

        it("should set vUSDD_Stablecoins supply cap to 1,000,000", async () => {
          expect(await comptroller.supplyCaps(VUSDD_STABLECOINS)).to.equal(parseUnits("1000000", 18));
        });

        it("should set vUSDD_Stablecoins borrow cap to 400,000", async () => {
          expect(await comptroller.borrowCaps(VUSDD_STABLECOINS)).to.equal(parseUnits("400000", 18));
        });
      });
    });

    describe("Pool configuration", () => {
      it("should set the correct price oracle", async () => {
        expect(await comptroller.oracle()).to.equal(RESILIENT_ORACLE);
      });

      it("should set close factor to 0.5", async () => {
        expect(await comptroller.closeFactorMantissa()).to.equal(parseUnits("0.5", 18));
      });

      it("should set liquidation incentive to 1.1", async () => {
        expect(await comptroller.liquidationIncentiveMantissa()).to.equal(parseUnits("1.1", 18));
      });

      it("should set minLiquidatableCollateral to $100", async () => {
        expect(await comptroller.minLiquidatableCollateral()).to.equal(parseUnits("100", 18));
      });
    });
  });

  describe("Basic supply/borrow/repay/redeem scenario", () => {
    let hay: Contract;
    let usdt: Contract;
    let usdd: Contract;
    let user: SignerWithAddress;

    before(async () => {
      [user] = await ethers.getSigners();
      const HAY_HOLDER = "0x0a1Fd12F73432928C190CAF0810b3B767A59717e";
      hay = await ethers.getContractAt(ERC20_ABI, HAY);
      usdt = await ethers.getContractAt(ERC20_ABI, USDT);
      usdd = await ethers.getContractAt(ERC20_ABI, USDD);
      const hayHolder = await initMainnetUser(HAY_HOLDER, parseUnits("1", 18));
      await hay.connect(hayHolder).transfer(user.address, parseUnits("100", 18));
    });

    it("should be possible to supply HAY", async () => {
      await hay.approve(vHAY.address, parseUnits("100", 18));
      await vHAY.mint(parseUnits("100", 18));
      expect(await vHAY.balanceOf(user.address)).to.equal(parseUnits("100", 8));
    });

    it("should be possible to enable HAY as collateral", async () => {
      await comptroller.enterMarkets([VHAY_STABLECOINS]);
      expect(await comptroller.getAssetsIn(user.address)).to.deep.equal([VHAY_STABLECOINS]);
    });

    it("should be possible to borrow USDT", async () => {
      await vUSDT.borrow(parseUnits("30", 18));
      expect(await vUSDT.borrowBalanceStored(user.address)).to.equal(parseUnits("30", 18));
      expect(await usdt.balanceOf(user.address)).to.equal(parseUnits("30", 18));
    });

    it("should be possible to borrow USDD", async () => {
      await vUSDD.borrow(parseUnits("34", 18));
      expect(await vUSDD.borrowBalanceStored(user.address)).to.equal(parseUnits("34", 18));
      expect(await usdd.balanceOf(user.address)).to.equal(parseUnits("34", 18));
    });

    it("should be possible to repay USDT", async () => {
      await usdt.approve(vUSDT.address, parseUnits("30", 18));
      await vUSDT.repayBorrow(parseUnits("30", 18));
      expect(await vUSDT.borrowBalanceStored(user.address)).to.be.lessThan(parseUnits("0.01", 18)); // Nonzero due to interest
      expect(await usdt.balanceOf(user.address)).to.equal(parseUnits("0", 18));
    });

    it("should be possible to redeem a part of HAY", async () => {
      await vHAY.redeemUnderlying(parseUnits("30", 18));
      expect(await hay.balanceOf(user.address)).to.equal(parseUnits("30", 18));
      expect(await vHAY.balanceOf(user.address)).to.equal(parseUnits("70", 8)); // No borrows in HAY => no interest
    });
  });
});
