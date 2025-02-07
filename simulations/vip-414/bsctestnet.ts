import { expect } from "chai";
import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { NORMAL_TIMELOCK, forking, testVip } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip414, { COMPTROLLER, PRIME, newMarkets, tokens } from "../../vips/vip-414/bsctestnet";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const BLOCKS_PER_YEAR = BigNumber.from("10512000");

const { POOL_REGISTRY, CHAINLINK_ORACLE, RESILIENT_ORACLE } = NETWORK_ADDRESSES["bsctestnet"];
const CHAINLINK_BTC_FEED = "0x5741306c21795FdCBb9b265Ea0255F499DFe515C";

forking(46833870, async () => {
  const provider = ethers.provider;
  const oracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, provider);
  const comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);

  before(async () => {
    await setMaxStalePeriodInChainlinkOracle(
      CHAINLINK_ORACLE,
      tokens["BTCB"].address,
      CHAINLINK_BTC_FEED,
      NORMAL_TIMELOCK,
    );
  });

  describe("vTokens deployment", () => {
    for (const market of Object.values(newMarkets)) {
      checkVToken(market.vToken.address, market.vToken);
    }
  });

  testVip("BTC pool VIP", await vip414());

  describe("Post-VIP state", () => {
    describe("Oracle configuration", async () => {
      it("has the correct PT-SolvBTC.BBN-27MAR2025 price", async () => {
        const price = await oracle.getPrice(tokens["PT-SolvBTC.BBN-27MAR2025"].address);
        expect(price).to.be.eq(parseUnits("103875.623346032842532014", 18));
      });
    });

    describe("PoolRegistry state", () => {
      let registeredPools: { name: string; creator: string; comptroller: string }[];

      before(async () => {
        registeredPools = await poolRegistry.getAllPools();
      });

      it("should have 8 pools", async () => {
        expect(registeredPools).to.have.lengthOf(8);
      });

      it("should register BTC pool in PoolRegistry", async () => {
        const pool = registeredPools[7];
        expect(pool.name).to.equal("BTC");
        expect(pool.creator).to.equal(NORMAL_TIMELOCK);
        expect(pool.comptroller).to.equal(COMPTROLLER);
      });

      it("should register vTokens in BTC pool Comptroller", async () => {
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.deep.equal(Object.values(newMarkets).map(({ vToken }) => vToken.address));
      });

      for (const [symbol, { vToken }] of Object.entries(newMarkets)) {
        it(`should register ${symbol} in PoolRegistry`, async () => {
          const registeredVToken = await poolRegistry.getVTokenForAsset(COMPTROLLER, vToken.underlying.address);
          expect(registeredVToken).to.equal(vToken.address);
        });
      }
    });

    describe("BTC Comptroller", () => {
      const comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);

      it("should have the correct price oracle", async () => {
        expect(await comptroller.oracle()).to.equal(RESILIENT_ORACLE);
      });

      it("should have close factor = 0.5", async () => {
        expect(await comptroller.closeFactorMantissa()).to.equal(parseUnits("0.5", 18));
      });

      it("should have liquidation incentive = 1.03", async () => {
        expect(await comptroller.liquidationIncentiveMantissa()).to.equal(parseUnits("1.03", 18));
      });

      it("should have minLiquidatableCollateral = $100", async () => {
        expect(await comptroller.minLiquidatableCollateral()).to.equal(parseUnits("100", 18));
      });

      it("should have owner = NORMAL_TIMELOCK", async () => {
        expect(await comptroller.owner()).to.equal(NORMAL_TIMELOCK);
      });

      it(`should have prime token = ${PRIME}`, async () => {
        expect(await comptroller.prime()).to.equal(PRIME);
      });
    });

    describe("Risk parameters", () => {
      for (const market of Object.values(newMarkets)) {
        checkRiskParameters(market.vToken.address, market.vToken, market.riskParameters);
      }

      it("should pause brrowing on PT-SolvBTC.BBN-27MAR2025", async () => {
        expect(await comptroller.actionPaused(newMarkets["vPT-SolvBTC.BBN-27MAR2025_BTC"].vToken.address, 2)).to.equal(
          true,
        );
      });
    });

    describe("Ownership and initial supply", () => {
      for (const { vToken: vTokenSpec, initialSupply } of Object.values(newMarkets)) {
        const vTokenContract = new ethers.Contract(vTokenSpec.address, VTOKEN_ABI, provider);
        const underlyingSymbol = vTokenSpec.underlying.symbol;

        describe(`${vTokenSpec.symbol}`, () => {
          it(`should have owner = normal timelock`, async () => {
            expect(await vTokenContract.owner()).to.equal(NORMAL_TIMELOCK);
          });

          // Initial exchange rate should account for decimal transformations such that
          // the string representation is the same (i.e. 1 vToken == 1 underlying)
          const multiplier = 10 ** (vTokenSpec.underlying.decimals - vTokenSpec.decimals);
          const vTokenSupply = initialSupply.amount.div(multiplier);
          const underlyingSupplyString = formatUnits(initialSupply.amount, vTokenSpec.underlying.decimals);
          const vTokenSupplyString = formatUnits(vTokenSupply, vTokenSpec.decimals);

          it(`should have initial supply = ${vTokenSupplyString} ${vTokenSpec.symbol}`, async () => {
            expect(await vTokenContract.balanceOf(initialSupply.vTokenReceiver)).to.equal(vTokenSupply);
          });

          it(`should balance of underlying = ${underlyingSupplyString} ${underlyingSymbol}`, async () => {
            expect(await vTokenContract.balanceOf(initialSupply.vTokenReceiver)).to.equal(vTokenSupply);
          });
        });
      }
    });

    describe("Interest rates", () => {
      for (const { vToken, interestRateModel } of Object.values(newMarkets)) {
        checkInterestRate(interestRateModel.address, vToken.symbol, interestRateModel, BLOCKS_PER_YEAR);
      }
    });

    checkIsolatedPoolsComptrollers();
  });
});
