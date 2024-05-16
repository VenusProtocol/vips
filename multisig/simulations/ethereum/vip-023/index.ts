import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { checkIsolatedPoolsComptrollers } from "../../../../src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "../../../../src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "../../../../src/vip-framework/checks/interestRateModel";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import { COMPTROLLER, INITIAL_SUPPLY, PTweETH, VTREASURY, vPTweETH, vip023 } from "../../../proposals/ethereum/vip-023";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { ethereum } = NETWORK_ADDRESSES;

interface RiskParameters {
  borrowCap: string;
  supplyCap: string;
  collateralFactor: string;
  liquidationThreshold: string;
  reserveFactor: string;
  initialSupply: string;
  vTokenReceiver: string;
}

const riskParameters: RiskParameters = {
  borrowCap: "0",
  supplyCap: parseUnits("1200", 18).toString(),
  collateralFactor: "0.75",
  liquidationThreshold: "0.80",
  reserveFactor: "0.20",
  initialSupply: INITIAL_SUPPLY.toString(),
  vTokenReceiver: VTREASURY,
};

interface InterestRateModelSpec {
  vToken: string;
  kink: string;
  base: string;
  multiplier: string;
  jump: string;
}

const interestRateModel: InterestRateModelSpec = {
  vToken: "vPT-weETH-26DEC2024_LiquidStakedETH",
  kink: "0.45",
  base: "0",
  multiplier: "0.09",
  jump: "0.75",
};

const BLOCKS_PER_YEAR = BigNumber.from("2628000"); // assuming a block is mined every 12 seconds

forking(19882072, () => {
  let resilientOracle: Contract;
  let poolRegistry: Contract;
  let vPTweETHContract: Contract;
  let comptroller: Contract;

  before(async () => {
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, ethereum.RESILIENT_ORACLE);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, ethereum.POOL_REGISTRY);
    vPTweETHContract = await ethers.getContractAt(VTOKEN_ABI, vPTweETH);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
  });

  describe("Pre-VIP behavior", () => {
    it("check price", async () => {
      await expect(resilientOracle.getPrice(PTweETH)).to.be.reverted;
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip023());
    });

    it("check price", async () => {
      expect(await resilientOracle.getPrice(PTweETH)).to.be.closeTo(parseUnits("2755", 18), parseUnits("1", 18));
      expect(await resilientOracle.getUnderlyingPrice(vPTweETH)).to.be.closeTo(
        parseUnits("2755", 18),
        parseUnits("1", 18),
      );
    });

    it("should have 3 markets in liquid staked pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(4);
    });

    it("should add vPTweETH to the pool", async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(comptroller.address, PTweETH);
      expect(registeredVToken).to.equal(vPTweETH);
    });

    it("check ownership", async () => {
      expect(await vPTweETHContract.owner()).to.equal(ethereum.GUARDIAN);
    });

    it("check supply", async () => {
      const expectedSupply = parseUnits("1.79961879", 8);
      expect(await vPTweETHContract.balanceOf(ethereum.VTREASURY)).to.equal(expectedSupply);
    });

    describe(`check risk parameters`, () => {
      it(`check reserve factor`, async () => {
        expect(await vPTweETHContract.reserveFactorMantissa()).to.equal(parseUnits(riskParameters.reserveFactor, 18));
      });

      it(`check CF`, async () => {
        const market = await comptroller.markets(vPTweETH);
        expect(market.collateralFactorMantissa).to.equal(parseUnits(riskParameters.collateralFactor, 18));
      });

      it(`check liquidation threshold`, async () => {
        const market = await comptroller.markets(vPTweETH);
        expect(market.liquidationThresholdMantissa).to.equal(parseUnits(riskParameters.liquidationThreshold, 18));
      });

      it(`check protocol seize share`, async () => {
        expect(await vPTweETHContract.protocolSeizeShareMantissa()).to.equal(parseUnits("0.05", 18));
      });

      it(`check supply cap`, async () => {
        expect(await comptroller.supplyCaps(vPTweETH)).to.equal(riskParameters.supplyCap);
      });

      it(`check borrow cap`, async () => {
        expect(await comptroller.borrowCaps(vPTweETH)).to.equal(riskParameters.borrowCap);
      });

      it("Interest rates", async () => {
        checkInterestRate(
          await vPTweETHContract.interestRateModel(),
          interestRateModel.vToken,
          {
            base: interestRateModel.base,
            multiplier: interestRateModel.multiplier,
            jump: interestRateModel.jump,
            kink: interestRateModel.kink,
          },
          BLOCKS_PER_YEAR,
        );
      });
    });

    it("generic IL tests", async () => {
      const PTweETH_Holder = "0x38D43a6Cb8DA0E855A42fB6b0733A0498531d774";
      await checkIsolatedPoolsComptrollers({
        [COMPTROLLER]: PTweETH_Holder,
      });

      await checkVToken(vPTweETH, {
        name: "Venus PT-wETH-26DEC2024 (Liquid Staked ETH)",
        symbol: "vPT-weETH-26DEC2024_LiquidStakedETH",
        decimals: 8,
        underlying: PTweETH,
        exchangeRate: parseUnits("10000000013.293774522103094956", 18),
        comptroller: COMPTROLLER,
      });
    });
  });
});
