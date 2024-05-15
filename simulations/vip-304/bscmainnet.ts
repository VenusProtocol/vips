import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { forking, testVip } from "../../src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "../../src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "../../src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "../../src/vip-framework/checks/interestRateModel";
import {
  checkRewardsDistributor,
  checkRewardsDistributorPool,
} from "../../src/vip-framework/checks/rewardsDistributor";
import vip304, {
  BABYDOGE,
  COMPTROLLER,
  RESILIENT_ORACLE,
  REWARDS_AMOUNT,
  REWARDS_DISTRIBUTOR,
  TREASURY,
  USDT,
  USDT_PRIME_CONVERTER,
  VBABYDOGE,
  VUSDT,
  BINANCE_ORACLE
} from "../../vips/vip-304/bscmainnet";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardsDistributor.json";
import SINGLE_TOKEN_CONVERTER from "./abi/SingleTokenConverter.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import VTOKEN_ABI from "./abi/vToken.json";
import { setMaxStaleCoreAssets, setMaxStalePeriod } from "../../src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;
const BLOCKS_PER_YEAR = BigNumber.from("10512000");

interface RiskParameters {
  borrowCap: string;
  supplyCap: string;
  collateralFactor: string;
  liquidationThreshold: string;
  reserveFactor: string;
  initialSupply: string;
  vTokenReceiver: string;
}

const vBabyDoge_riskParameters: RiskParameters = {
  borrowCap: parseUnits("800000000000000", 9).toString(),
  supplyCap: parseUnits("1600000000000000", 9).toString(),
  collateralFactor: "0.3",
  liquidationThreshold: "0.4",
  reserveFactor: "0.25",
  initialSupply: parseUnits("27917365987868.178893572", 9).toString(),
  vTokenReceiver: TREASURY,
};

const vUSDT_riskParameters: RiskParameters = {
  borrowCap: parseUnits("900000", 18).toString(),
  supplyCap: parseUnits("1000000", 18).toString(),
  collateralFactor: "0.75",
  liquidationThreshold: "0.77",
  reserveFactor: "0.1",
  initialSupply: parseUnits("5000", 18).toString(),
  vTokenReceiver: TREASURY,
};

interface InterestRateModelSpec {
  vToken: string;
  kink: string;
  base: string;
  multiplier: string;
  jump: string;
}

const vBabyDoge_interestRateModel: InterestRateModelSpec = {
  vToken: "vBabyDoge_Meme",
  kink: "0.45",
  base: "0.02",
  multiplier: "0.2",
  jump: "3",
};

const vUSDT_interestRateModel: InterestRateModelSpec = {
  vToken: "vUSDT_Meme",
  kink: "0.8",
  base: "0",
  multiplier: "0.175",
  jump: "2.5",
};

const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";

forking(38742886, () => {
  const provider = ethers.provider;
  let oracle: Contract;
  let poolRegistry: Contract;
  let vBabyDoge: Contract;
  let Vusdt: Contract;
  let comptroller: Contract;
  let babyDoge: Contract;
  let rewardDistributor: Contract;
  let usdt: Contract;
  let usdtPrimeConverter: Contract;

  before(async () => {
    await impersonateAccount(bscmainnet.NORMAL_TIMELOCK);
    await impersonateAccount(TREASURY);
    await setBalance(TREASURY, ethers.utils.parseEther("5"));
    oracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, RESILIENT_ORACLE);
    poolRegistry = new ethers.Contract(bscmainnet.POOL_REGISTRY, POOL_REGISTRY_ABI, await ethers.getSigner(bscmainnet.NORMAL_TIMELOCK));
    vBabyDoge = await ethers.getContractAt(VTOKEN_ABI, VBABYDOGE);
    Vusdt = await ethers.getContractAt(VTOKEN_ABI, VUSDT);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
    rewardDistributor = await ethers.getContractAt(REWARD_DISTRIBUTOR_ABI, REWARDS_DISTRIBUTOR);
    babyDoge = await ethers.getContractAt(ERC20_ABI, BABYDOGE, await ethers.getSigner(bscmainnet.NORMAL_TIMELOCK));
    usdt = await ethers.getContractAt(ERC20_ABI, USDT, await ethers.getSigner(TREASURY));
    usdtPrimeConverter = await ethers.getContractAt(
      SINGLE_TOKEN_CONVERTER,
      USDT_PRIME_CONVERTER,
      await ethers.getSigner(bscmainnet.NORMAL_TIMELOCK),
    );

    await setMaxStalePeriod(oracle, usdt);
    await setMaxStaleCoreAssets(CHAINLINK_ORACLE, bscmainnet.NORMAL_TIMELOCK);
  });

  describe("Pre-VIP state", () => {
    it("check price", async () => {
      await expect(oracle.getPrice(BABYDOGE)).to.be.reverted;
    });
  });

  testVip("Add Meme Pool", vip304(31536000));

  describe("Post-VIP state", () => {
    it("check price", async () => {
      const price = await oracle.getPrice(BABYDOGE);
      expect(price).to.be.eq(parseUnits("0.000000001648807806000000000", 27));
    });

    it("should have 2 markets in meme pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(2);
    });

    it("should add vBabyDoge to the pool", async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(comptroller.address, BABYDOGE);
      expect(registeredVToken).to.equal(vBabyDoge.address);
    });

    it("should add vUSDT to the pool", async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(comptroller.address, USDT);
      expect(registeredVToken).to.equal(Vusdt.address);
    });

    it("check vBabyDoge ownership", async () => {
      expect(await vBabyDoge.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("check vUSDT ownership", async () => {
      expect(await Vusdt.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("check vBabyDoge supply", async () => {
      const expectedSupply = parseUnits("27917365987868.17889357", 8);
      expect(await vBabyDoge.balanceOf(TREASURY)).to.equal(expectedSupply);
    });

    it("check vUSDT supply", async () => {
      const expectedSupply = parseUnits("5000", 8);
      expect(await Vusdt.balanceOf(TREASURY)).to.equal(expectedSupply);
    });

    it("check reward token", async () => {
      expect(await rewardDistributor.rewardToken()).to.equal(BABYDOGE);
    });

    it(`rewards distributor should have balance`, async () => {
      expect(await babyDoge.balanceOf(rewardDistributor.address)).to.gte(REWARDS_AMOUNT);
    });

    describe(`check risk parameters`, () => {
      it(`check reserve factor`, async () => {
        expect(await vBabyDoge.reserveFactorMantissa()).to.equal(
          parseUnits(vBabyDoge_riskParameters.reserveFactor, 18),
        );
        expect(await Vusdt.reserveFactorMantissa()).to.equal(parseUnits(vUSDT_riskParameters.reserveFactor, 18));
      });

      it(`check CF`, async () => {
        let market = await comptroller.markets(VBABYDOGE);
        expect(market.collateralFactorMantissa).to.equal(parseUnits(vBabyDoge_riskParameters.collateralFactor, 18));

        market = await comptroller.markets(VUSDT);
        expect(market.collateralFactorMantissa).to.equal(parseUnits(vUSDT_riskParameters.collateralFactor, 18));
      });

      it(`check liquidation threshold`, async () => {
        let market = await comptroller.markets(VBABYDOGE);
        expect(market.liquidationThresholdMantissa).to.equal(
          parseUnits(vBabyDoge_riskParameters.liquidationThreshold, 18),
        );

        market = await comptroller.markets(VUSDT);
        expect(market.liquidationThresholdMantissa).to.equal(parseUnits(vUSDT_riskParameters.liquidationThreshold, 18));
      });

      it(`check protocol seize share`, async () => {
        expect(await vBabyDoge.protocolSeizeShareMantissa()).to.equal(parseUnits("0.05", 18));
        expect(await Vusdt.protocolSeizeShareMantissa()).to.equal(parseUnits("0.05", 18));
      });

      it(`check supply cap`, async () => {
        expect(await comptroller.supplyCaps(VBABYDOGE)).to.equal(vBabyDoge_riskParameters.supplyCap);
        expect(await comptroller.supplyCaps(VUSDT)).to.equal(vUSDT_riskParameters.supplyCap);
      });

      it(`check borrow cap`, async () => {
        expect(await comptroller.borrowCaps(VBABYDOGE)).to.equal(vBabyDoge_riskParameters.borrowCap);
        expect(await comptroller.borrowCaps(VUSDT)).to.equal(vUSDT_riskParameters.borrowCap);
      });

      it("Interest rates", async () => {
        checkInterestRate(
          await vBabyDoge.interestRateModel(),
          vBabyDoge_interestRateModel.vToken,
          {
            base: vBabyDoge_interestRateModel.base,
            multiplier: vBabyDoge_interestRateModel.multiplier,
            jump: vBabyDoge_interestRateModel.jump,
            kink: vBabyDoge_interestRateModel.kink,
          },
          BLOCKS_PER_YEAR,
        );

        checkInterestRate(
          await Vusdt.interestRateModel(),
          vUSDT_interestRateModel.vToken,
          {
            base: vUSDT_interestRateModel.base,
            multiplier: vUSDT_interestRateModel.multiplier,
            jump: vUSDT_interestRateModel.jump,
            kink: vUSDT_interestRateModel.kink,
          },
          BLOCKS_PER_YEAR,
        );
      });
    });

    it("generic IL tests", async () => {
      const HOLDER = "0xB7b0eB5d4FE3C4bC0d822D775D87a2C5080DB761";
      await checkIsolatedPoolsComptrollers({
        [COMPTROLLER]: HOLDER,
      });

      await checkVToken(VBABYDOGE, {
        name: "Venus BabyDoge (Meme)",
        symbol: "vBabyDoge_Meme",
        decimals: 8,
        underlying: BABYDOGE,
        exchangeRate: parseUnits("10", 18),
        comptroller: COMPTROLLER,
      });

      await checkVToken(VUSDT, {
        name: "Venus USDT (Meme)",
        symbol: "vUSDT_Meme",
        decimals: 8,
        underlying: USDT,
        exchangeRate: parseUnits("10000000000", 18),
        comptroller: COMPTROLLER,
      });
    });

    it("generic reward tests", async () => {
      await checkRewardsDistributor("RewardsDistributor_MEME_0_BABYDOGE", {
        pool: COMPTROLLER,
        address: REWARDS_DISTRIBUTOR,
        token: BABYDOGE,
        vToken: VBABYDOGE,
        borrowSpeed: "12134623477230768",
        supplySpeed: "12134623477230768",
        totalRewardsToDistribute: parseUnits("15726472026491.075844320", 9),
      });

      await checkRewardsDistributorPool(COMPTROLLER, 1);
    });

    // it("BabyDoge conversion", async () => {
    //   const usdtAmount = parseUnits("100", 18);
    //   await usdt.transfer(bscmainnet.NORMAL_TIMELOCK, usdtAmount);
    //   await usdt
    //     .connect(await ethers.getSigner(bscmainnet.NORMAL_TIMELOCK))
    //     .approve(usdtPrimeConverter.address, usdtAmount);

    //   const babyDogeAmount = parseUnits("50000000000", 9);
    //   await babyDoge.faucet(babyDogeAmount); // ~$89
    //   await babyDoge.transfer(usdtPrimeConverter.address, babyDogeAmount);

    //   const usdtBalanceBefore = await usdt.balanceOf(bscmainnet.NORMAL_TIMELOCK);
    //   const babyDogeBalanceBefore = await babyDoge.balanceOf(bscmainnet.NORMAL_TIMELOCK);

    //   await usdtPrimeConverter.convertForExactTokens(
    //     usdtAmount,
    //     babyDogeAmount,
    //     usdt.address,
    //     babyDoge.address,
    //     bscmainnet.NORMAL_TIMELOCK,
    //   );

    //   const usdtBalanceAfter = await usdt.balanceOf(bscmainnet.NORMAL_TIMELOCK);
    //   const babyDogeBalanceAfter = await babyDoge.balanceOf(bscmainnet.NORMAL_TIMELOCK);

    //   expect(usdtBalanceBefore.sub(usdtBalanceAfter)).to.be.equal(parseUnits("89.261753", 18));
    //   expect(babyDogeBalanceAfter.sub(babyDogeBalanceBefore)).to.be.equal(babyDogeAmount);
    // });
  });
});
