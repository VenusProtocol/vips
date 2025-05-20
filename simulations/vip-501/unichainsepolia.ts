import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NORMAL_TIMELOCK, forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip501, {
  COMPTROLLER_CORE,
  DAYS_30,
  WEETH_ORACLE,
  WSTETH_ORACLE,
  exchangeRatePercentage,
  increaseExchangeRateByPercentage,
  weETHMarket,
  wstETHMarket,
} from "../../vips/vip-501/bsctestnet";
import CORRELATED_TOKEN_ORACLE_ABI from "./abi/CorrelatedTokenOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import PRICE_ORACLE_ABI from "./abi/resilientOracle.json";
import VTOKEN_ABI from "./abi/vToken.json";

const PSR = "0xcCcFc9B37A5575ae270352CC85D55C3C52a646C0";

const ONE_YEAR = 31536000;
const BLOCKS_PER_YEAR = BigNumber.from("31536000"); // equal to seconds in a year as it is timebased deployment

forking(20881282, async () => {
  let comptroller: Contract;
  let oracle: Contract;

  describe("Contracts setup", () => {
    checkVToken(weETHMarket.vToken.address, weETHMarket.vToken);
    checkVToken(wstETHMarket.vToken.address, wstETHMarket.vToken);
  });

  testForkedNetworkVipCommands("add weETH and wstETH market", await vip501());

  describe("Post-Execution state", () => {
    let vweETH: Contract;
    let vwstETH: Contract;

    before(async () => {
      vweETH = await ethers.getContractAt(VTOKEN_ABI, weETHMarket.vToken.address);
      vwstETH = await ethers.getContractAt(VTOKEN_ABI, wstETHMarket.vToken.address);
      comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
      oracle = await ethers.getContractAt(PRICE_ORACLE_ABI, await comptroller.oracle());
    });

    describe("PoolRegistry state", () => {
      it("should register weETH vToken in Core pool Comptroller", async () => {
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.include(weETHMarket.vToken.address);
      });

      it("should register wstETH vToken in Core pool Comptroller", async () => {
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.include(wstETHMarket.vToken.address);
      });
    });

    describe("Ownership", () => {
      it(`should transfer ownership of ${weETHMarket.vToken.address} to NORMAL_TIMELOCK`, async () => {
        expect(await vweETH.owner()).to.equal(NORMAL_TIMELOCK);
      });

      it(`should transfer ownership of ${wstETHMarket.vToken.address} to NORMAL_TIMELOCK`, async () => {
        expect(await vwstETH.owner()).to.equal(NORMAL_TIMELOCK);
      });
    });

    describe("ProtocolShareReserve", () => {
      it(`should set PSR for ${weETHMarket.vToken.address}`, async () => {
        expect(await vweETH.protocolShareReserve()).to.equal(PSR);
      });

      it(`should set PSR for ${wstETHMarket.vToken.address}`, async () => {
        expect(await vwstETH.protocolShareReserve()).to.equal(PSR);
      });
    });

    describe("Risk parameters", () => {
      let vToken: Contract;
      let comptroller: Contract;

      describe("risk parameters for weETH", () => {
        before(async () => {
          vToken = await ethers.getContractAt(VTOKEN_ABI, weETHMarket.vToken.address);
          comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
        });

        it(`should set reserve factor to 0.4`, async () => {
          expect(await vToken.reserveFactorMantissa()).to.equal(weETHMarket.riskParameters.reserveFactor);
        });

        it(`should set collateral factor to 0.7`, async () => {
          const market = await comptroller.markets(weETHMarket.vToken.address);
          expect(market.collateralFactorMantissa).to.equal(weETHMarket.riskParameters.collateralFactor);
        });

        it(`should set liquidation threshold to 0.75`, async () => {
          const market = await comptroller.markets(weETHMarket.vToken.address);
          expect(market.liquidationThresholdMantissa).to.equal(weETHMarket.riskParameters.liquidationThreshold);
        });

        it(`should set protocol seize share to 0.05`, async () => {
          expect(await vToken.protocolSeizeShareMantissa()).to.equal(parseUnits("0.05", 18));
        });

        it(`should set supply cap to 4000`, async () => {
          expect(await comptroller.supplyCaps(weETHMarket.vToken.address)).to.equal(
            weETHMarket.riskParameters.supplyCap,
          );
        });

        it(`should set borrow cap to 400`, async () => {
          expect(await comptroller.borrowCaps(weETHMarket.vToken.address)).to.equal(
            weETHMarket.riskParameters.borrowCap,
          );
        });
      });

      describe("risk parameters for wstETH", () => {
        before(async () => {
          vToken = await ethers.getContractAt(VTOKEN_ABI, wstETHMarket.vToken.address);
          comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
        });

        it(`should set reserve factor to 0.25`, async () => {
          expect(await vToken.reserveFactorMantissa()).to.equal(wstETHMarket.riskParameters.reserveFactor);
        });

        it(`should set collateral factor to 0.7`, async () => {
          const market = await comptroller.markets(wstETHMarket.vToken.address);
          expect(market.collateralFactorMantissa).to.equal(wstETHMarket.riskParameters.collateralFactor);
        });

        it(`should set liquidation threshold to 0.725`, async () => {
          const market = await comptroller.markets(wstETHMarket.vToken.address);
          expect(market.liquidationThresholdMantissa).to.equal(wstETHMarket.riskParameters.liquidationThreshold);
        });

        it(`should set protocol seize share to 0.05`, async () => {
          expect(await vToken.protocolSeizeShareMantissa()).to.equal(parseUnits("0.05", 18));
        });

        it(`should set supply cap to 14000`, async () => {
          expect(await comptroller.supplyCaps(wstETHMarket.vToken.address)).to.equal(
            wstETHMarket.riskParameters.supplyCap,
          );
        });

        it(`should set borrow cap to 7000`, async () => {
          expect(await comptroller.borrowCaps(wstETHMarket.vToken.address)).to.equal(
            wstETHMarket.riskParameters.borrowCap,
          );
        });
      });
    });

    describe("Prices", () => {
      it("get correct price from oracle for weETH", async () => {
        const price = await oracle.getUnderlyingPrice(weETHMarket.vToken.address);
        expect(price).to.equal(parseUnits("2534.7277552", 18));
      });

      it("get correct price from oracle for wstETH", async () => {
        const price = await oracle.getUnderlyingPrice(wstETHMarket.vToken.address);
        expect(price).to.equal(parseUnits("2534.7277552", 18));
      });
    });

    describe("Capped oracles", () => {
      for (const oracleConfigs of [
        {
          underlyingSymbol: "weETH",
          oracleAddres: WEETH_ORACLE,
          expectedConfiguration: weETHMarket.cappedOracles,
        },
        {
          underlyingSymbol: "wstETH",
          oracleAddres: WSTETH_ORACLE,
          expectedConfiguration: wstETHMarket.cappedOracles,
        },
      ]) {
        const correlatedOracle = new ethers.Contract(
          oracleConfigs.oracleAddres,
          CORRELATED_TOKEN_ORACLE_ABI,
          ethers.provider,
        );
        const expectedMaxExchangeRate = increaseExchangeRateByPercentage(
          oracleConfigs.expectedConfiguration.exchangeRateValue,
          oracleConfigs.expectedConfiguration.snapshotGapBps,
        );
        describe(`Configuration for ${oracleConfigs.underlyingSymbol}`, () => {
          it(`annual growth = ${formatUnits(oracleConfigs.expectedConfiguration.annualGrowthRate, 18)}`, async () => {
            expect(await correlatedOracle.growthRatePerSecond()).to.equal(
              oracleConfigs.expectedConfiguration.annualGrowthRate.div(ONE_YEAR),
            );
          });
          it(`snapshot interval = ${
            oracleConfigs.expectedConfiguration.snapshotIntervalInSeconds / DAYS_30
          } months`, async () => {
            expect(await correlatedOracle.snapshotInterval()).to.equal(
              oracleConfigs.expectedConfiguration.snapshotIntervalInSeconds,
            );
          });
          it(`snapshot gap = ${oracleConfigs.expectedConfiguration.snapshotGapBps} bps`, async () => {
            expect(await correlatedOracle.snapshotGap()).to.equal(
              exchangeRatePercentage(
                oracleConfigs.expectedConfiguration.exchangeRateValue,
                oracleConfigs.expectedConfiguration.snapshotGapBps,
              ),
            );
          });
          it(`snapshot maxExchangeRate = ${formatUnits(
            expectedMaxExchangeRate,
            18,
          )} (current exchange rate = ${formatUnits(
            oracleConfigs.expectedConfiguration.exchangeRateValue,
            18,
          )})`, async () => {
            expect(await correlatedOracle.snapshotMaxExchangeRate()).to.equal(expectedMaxExchangeRate);
          });
          it(`snapshot timestamp = ${oracleConfigs.expectedConfiguration.exchangeRateTimestamp}`, async () => {
            expect(await correlatedOracle.snapshotTimestamp()).to.equal(
              oracleConfigs.expectedConfiguration.exchangeRateTimestamp,
            );
          });
        });
      }
    });

    it("Interest rates for weETH", async () => {
      checkInterestRate(
        weETHMarket.interestRateModel.address,
        "vweETH",
        {
          base: "0",
          multiplier: "0.09",
          jump: "3",
          kink: "0.45",
        },
        BLOCKS_PER_YEAR,
      );
    });
    it("Interest rates for wstETH", async () => {
      checkInterestRate(
        wstETHMarket.interestRateModel.address,
        "vwstETH",
        {
          base: "0",
          multiplier: "0.15",
          jump: "3",
          kink: "0.45",
        },
        BLOCKS_PER_YEAR,
      );
    });
    it("check isolated pools", async () => {
      checkIsolatedPoolsComptrollers();
    });
  });
});
