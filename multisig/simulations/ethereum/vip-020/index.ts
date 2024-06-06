import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { checkIsolatedPoolsComptrollers } from "../../../../src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "../../../../src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "../../../../src/vip-framework/checks/interestRateModel";
import {
  checkRewardsDistributor,
  checkRewardsDistributorPool,
} from "../../../../src/vip-framework/checks/rewardsDistributor";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import {
  COMPTROLLER,
  MULTISIG,
  REWARDS_DISTRIBUTOR,
  USDC,
  USDC_REWARD_TRANSFER,
  vip020,
  vweETH,
  weETH,
} from "../../../proposals/ethereum/vip-020";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardsDistributor.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { ethereum } = NETWORK_ADDRESSES;
const WeETH_ORACLE_NON_EQUIVALENCE = "0x660c6d8c5fddc4f47c749e0f7e03634513f23e0e";
const BLOCKS_PER_YEAR = BigNumber.from(2628000); // assuming a block is mined every 12 seconds
const LIQUID_STAKED_COMPTROLLER = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";
const WEETH_HOLDER = "0x267ed5f71EE47D3E45Bb1569Aa37889a2d10f91e";

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
  borrowCap: "750",
  supplyCap: "7500",
  collateralFactor: "0.9",
  liquidationThreshold: "0.93",
  reserveFactor: "0.20",
  initialSupply: "2.76191022",
  vTokenReceiver: MULTISIG,
};

interface InterestRateModelSpec {
  vToken: string;
  kink: string;
  base: string;
  multiplier: string;
  jump: string;
}

const interestRateModel: InterestRateModelSpec = {
  vToken: "vweETH_LiquidStakedETH",
  kink: "0.45",
  base: "0",
  multiplier: "0.09",
  jump: "0.75",
};

forking(19640453, async () => {
  let resilientOracle: Contract;
  let poolRegistry: Contract;
  let vweETHContract: Contract;
  let comptroller: Contract;
  let rewardDistributor: Contract;
  let usdc: Contract;
  let nonEquivalenceOracle: Contract;

  before(async () => {
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, ethereum.RESILIENT_ORACLE);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, ethereum.POOL_REGISTRY);
    vweETHContract = await ethers.getContractAt(VTOKEN_ABI, vweETH);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
    rewardDistributor = await ethers.getContractAt(REWARD_DISTRIBUTOR_ABI, REWARDS_DISTRIBUTOR);
    usdc = await ethers.getContractAt(ERC20_ABI, USDC);
    nonEquivalenceOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, WeETH_ORACLE_NON_EQUIVALENCE);
  });

  describe("Pre-VIP behavior", () => {
    it("check price", async () => {
      await expect(resilientOracle.getPrice(weETH)).to.be.reverted;
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip020());
    });

    it("check price", async () => {
      expect(await resilientOracle.getPrice(weETH)).to.be.closeTo(parseUnits("3570", 18), parseUnits("10", 18));
    });

    it("check non-equivalence oracle price", async () => {
      expect(await nonEquivalenceOracle.getPrice(weETH)).to.be.closeTo(parseUnits("3570", 18), parseUnits("10", 18));
    });

    it("should have 3 markets in liquid staked pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(3);
    });

    it("should add vweETH to the pool", async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(comptroller.address, weETH);
      expect(registeredVToken).to.equal(vweETH);
    });

    it("check ownership", async () => {
      expect(await vweETHContract.owner()).to.equal(ethereum.GUARDIAN);
    });

    it("check supply", async () => {
      const expectedSupply = parseUnits("2.76191022", 8);
      expect(await vweETHContract.balanceOf(MULTISIG)).to.equal(expectedSupply);
    });

    it("check reward token", async () => {
      expect(await rewardDistributor.rewardToken()).to.equal(USDC);
    });

    it("check reward speed", async () => {
      expect(await rewardDistributor.rewardTokenSupplySpeeds(vweETH)).to.equal("23148");
    });

    it("check rewards distributor ownership", async () => {
      expect(await rewardDistributor.owner()).to.equal(ethereum.GUARDIAN);
    });

    it(`rewards distributor should have balance`, async () => {
      expect(await usdc.balanceOf(rewardDistributor.address)).to.equal(USDC_REWARD_TRANSFER);
    });

    it(`should be registered in Comptroller`, async () => {
      expect(await comptroller.getRewardDistributors()).to.contain(rewardDistributor.address);
    });

    it(`should mint initial supply`, async () => {
      const expectedSupply = parseUnits(riskParameters.initialSupply, 8);
      const vToken = await ethers.getContractAt(VTOKEN_ABI, vweETH);
      expect(await vToken.balanceOf(riskParameters.vTokenReceiver)).to.equal(expectedSupply);
    });

    describe(`check risk parameters`, () => {
      let vToken: Contract;
      let comptroller: Contract;
      let underlyingDecimals: number;

      before(async () => {
        vToken = await ethers.getContractAt(VTOKEN_ABI, vweETH);
        comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
        const underlyingAddress = weETH;
        const underlying = await ethers.getContractAt(ERC20_ABI, underlyingAddress);
        underlyingDecimals = await underlying.decimals();
      });

      it(`check reserve factor`, async () => {
        expect(await vToken.reserveFactorMantissa()).to.equal(parseUnits(riskParameters.reserveFactor, 18));
      });

      it(`check CF`, async () => {
        const market = await comptroller.markets(vweETH);
        expect(market.collateralFactorMantissa).to.equal(parseUnits(riskParameters.collateralFactor, 18));
      });

      it(`check liquidation threshold`, async () => {
        const market = await comptroller.markets(vweETH);
        expect(market.liquidationThresholdMantissa).to.equal(parseUnits(riskParameters.liquidationThreshold, 18));
      });

      it(`check protocol seize share`, async () => {
        expect(await vToken.protocolSeizeShareMantissa()).to.equal(parseUnits("0.01", 18));
      });

      it(`check supply cap`, async () => {
        expect(await comptroller.supplyCaps(vweETH)).to.equal(parseUnits(riskParameters.supplyCap, underlyingDecimals));
      });

      it(`check borrow cap`, async () => {
        expect(await comptroller.borrowCaps(vweETH)).to.equal(parseUnits(riskParameters.borrowCap, underlyingDecimals));
      });

      it("Interest rates", async () => {
        checkInterestRate(
          await vweETHContract.interestRateModel(),
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
      await checkIsolatedPoolsComptrollers({
        [LIQUID_STAKED_COMPTROLLER]: WEETH_HOLDER,
      });

      await checkVToken(vweETH, {
        name: "Venus weETH (Liquid Staked ETH)",
        symbol: "vweETH_LiquidStakedETH",
        decimals: 8,
        underlying: weETH,
        exchangeRate: parseUnits("10000000036.747831323259998399", 18),
        comptroller: COMPTROLLER,
      });
    });

    it("generic reward tests", async () => {
      await checkRewardsDistributor("RewardsDistributor_LST_2_WEETH", {
        pool: LIQUID_STAKED_COMPTROLLER,
        address: REWARDS_DISTRIBUTOR,
        token: USDC,
        vToken: vweETH,
        borrowSpeed: "0",
        supplySpeed: "23148",
        totalRewardsToDistribute: parseUnits("5000", 6),
      });

      await checkRewardsDistributorPool(LIQUID_STAKED_COMPTROLLER, 3);
    });
  });
});
