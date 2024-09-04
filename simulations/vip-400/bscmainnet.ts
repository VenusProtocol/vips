import { expect } from "chai";
import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { setMaxStaleCoreAssets } from "src/utils";
import { NORMAL_TIMELOCK, forking, testVip } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip400, {
  CHAINLINK_ORACLE,
  COMPTROLLER,
  POOL_REGISTRY,
  RESILIENT_ORACLE,
  WEETH,
  WSTETH,
  newMarkets,
} from "../../vips/vip-400/bscmainnet";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const BLOCKS_PER_YEAR = BigNumber.from("10512000");
const ONE_YEAR = 365 * 24 * 3600;

forking(41956930, async () => {
  const provider = ethers.provider;
  const oracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, provider);
  const comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);

  before(async () => {
    await setMaxStaleCoreAssets(CHAINLINK_ORACLE, NORMAL_TIMELOCK);
  });

  describe("vTokens deployment", () => {
    for (const market of Object.values(newMarkets)) {
      checkVToken(market.vToken.address, market.vToken);
    }
  });

  testVip("LST ETH pool VIP", await vip400({ chainlinkStalePeriod: ONE_YEAR, redstoneStalePeriod: ONE_YEAR }));

  describe("Post-VIP state", () => {
    describe("Oracle configuration", async () => {
      it("has the correct weETH price", async () => {
        const price = await oracle.getPrice(WEETH);
        expect(price).to.be.eq(parseUnits("2509.425684209024827300", 18));
      });

      it("has the correct wstETH price", async () => {
        const price = await oracle.getPrice(WSTETH);
        expect(price).to.be.eq(parseUnits("2509.425684209024827300", 18)); // TODO: Use the correct feed for wstETH
      });
    });

    describe("PoolRegistry state", () => {
      let registeredPools: { name: string; creator: string; comptroller: string }[];

      before(async () => {
        registeredPools = await poolRegistry.getAllPools();
      });

      it("should have 7 pools", async () => {
        expect(registeredPools).to.have.lengthOf(7);
      });

      it("should register Liquid staked ETH pool in PoolRegistry", async () => {
        const pool = registeredPools[6];
        expect(pool.name).to.equal("Liquid Staked ETH");
        expect(pool.creator).to.equal(NORMAL_TIMELOCK);
        expect(pool.comptroller).to.equal(COMPTROLLER);
      });

      it("should register vTokens in Liquid staked ETH pool Comptroller", async () => {
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

    describe("LST ETH Comptroller", () => {
      const comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);

      it("should have the correct price oracle", async () => {
        expect(await comptroller.oracle()).to.equal(RESILIENT_ORACLE);
      });

      it("should have close factor = 0.5", async () => {
        expect(await comptroller.closeFactorMantissa()).to.equal(parseUnits("0.5", 18));
      });

      it("should have liquidation incentive = 1.02", async () => {
        expect(await comptroller.liquidationIncentiveMantissa()).to.equal(parseUnits("1.02", 18));
      });

      it("should have minLiquidatableCollateral = $100", async () => {
        expect(await comptroller.minLiquidatableCollateral()).to.equal(parseUnits("100", 18));
      });

      it("should have owner = NORMAL_TIMELOCK", async () => {
        expect(await comptroller.owner()).to.equal(NORMAL_TIMELOCK);
      });
    });

    describe("Risk parameters", () => {
      for (const market of Object.values(newMarkets)) {
        checkRiskParameters(market.vToken.address, market.vToken, market.riskParameters);
      }
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
          const underlyingSupplyString = formatUnits(initialSupply.amount, vTokenSpec.underlying.decimals);
          const vTokenSupply = parseUnits(underlyingSupplyString, vTokenSpec.decimals);

          it(`should have initial supply = ${underlyingSupplyString} ${vTokenSpec.symbol}`, async () => {
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
