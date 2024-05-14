import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
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
  FRAX,
  REWARDS_DISTRIBUTOR_XVS,
  VTOKEN_RECIEVER,
  XVS,
  XVS_REWARD_TRANSFER,
  sFRAX,
  vFRAX,
  vip026,
  vsFRAX,
} from "../../../proposals/ethereum/vip-026";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardsDistributor.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { ethereum } = NETWORK_ADDRESSES;
const BLOCKS_PER_YEAR = BigNumber.from(2628000); // assuming a block is mined every 12 seconds

interface RiskParameters {
  borrowCap: string;
  supplyCap: string;
  collateralFactor: string;
  liquidationThreshold: string;
  reserveFactor: string;
  initialSupply: string;
}

const vFrax_riskParameters: RiskParameters = {
  borrowCap: "8000000",
  supplyCap: "10000000",
  collateralFactor: "0.75",
  liquidationThreshold: "0.80",
  reserveFactor: "0.1",
  initialSupply: "5000",
};

const vsFrax_riskParameters: RiskParameters = {
  borrowCap: "1000000",
  supplyCap: "10000000",
  collateralFactor: "0.75",
  liquidationThreshold: "0.80",
  reserveFactor: "0.1",
  initialSupply: "4800",
};

interface InterestRateModelSpec {
  vToken: string;
  kink: string;
  base: string;
  multiplier: string;
  jump: string;
}

const vFrax_interestRateModel: InterestRateModelSpec = {
  vToken: "vFRAX_Core",
  kink: "0.8",
  base: "0",
  multiplier: "0.15",
  jump: "2.5",
};

const vsFrax_interestRateModel: InterestRateModelSpec = {
  vToken: "vsFRAX_Core",
  kink: "0.8",
  base: "0",
  multiplier: "0.15",
  jump: "2.5",
};

forking(19812613, () => {
  let resilientOracle: Contract;
  let poolRegistry: Contract;
  let vFRAXContract: Contract;
  let vsFRAXContract: Contract;
  let comptroller: Contract;
  let rewardDistributor: Contract;
  let xvs: Contract;

  before(async () => {
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, ethereum.RESILIENT_ORACLE);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, ethereum.POOL_REGISTRY);
    vFRAXContract = await ethers.getContractAt(VTOKEN_ABI, vFRAX);
    vsFRAXContract = await ethers.getContractAt(VTOKEN_ABI, vsFRAX);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
    rewardDistributor = await ethers.getContractAt(REWARD_DISTRIBUTOR_ABI, REWARDS_DISTRIBUTOR_XVS);
    xvs = await ethers.getContractAt(ERC20_ABI, XVS);
  });

  describe("Pre-VIP behavior", () => {
    it("check FRAX price", async () => {
      await expect(resilientOracle.getPrice(FRAX)).to.be.reverted;
    });

    it("check sFRAX price", async () => {
      await expect(resilientOracle.getPrice(sFRAX)).to.be.reverted;
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip026());
    });

    it("check FRAX price", async () => {
      expect(await resilientOracle.getPrice(FRAX)).to.equal(parseUnits("0.99838881", 18));
    });

    it("check sFRAX price", async () => {
      expect(await resilientOracle.getPrice(sFRAX)).to.equal(parseUnits("1.041281810007921301", 18));
    });

    it("should have 9 markets in core pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(9);
    });

    it("should add vFRAX to the pool", async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(comptroller.address, FRAX);
      expect(registeredVToken).to.equal(vFRAX);
    });

    it("should add vsFRAX to the pool", async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(comptroller.address, sFRAX);
      expect(registeredVToken).to.equal(vsFRAX);
    });

    it("check vFRAX ownership", async () => {
      expect(await vFRAXContract.owner()).to.equal(ethereum.GUARDIAN);
    });

    it("check vsFRAX ownership", async () => {
      expect(await vsFRAXContract.owner()).to.equal(ethereum.GUARDIAN);
    });

    it("check vFRAX supply", async () => {
      const expectedSupply = parseUnits("5", 11);
      expect(await vFRAXContract.balanceOf(VTOKEN_RECIEVER)).to.equal(expectedSupply);
    });

    it("check vsFRAX supply", async () => {
      const expectedSupply = parseUnits("48", 10);
      expect(await vsFRAXContract.totalSupply()).to.equal(expectedSupply);
    });

    it("check reward token", async () => {
      expect(await rewardDistributor.rewardToken()).to.equal(XVS);
    });

    it(`rewards distributor should have balance`, async () => {
      expect(await xvs.balanceOf(rewardDistributor.address)).to.gte(XVS_REWARD_TRANSFER);
    });

    describe(`check risk parameters`, () => {
      it(`check reserve factor`, async () => {
        expect(await vFRAXContract.reserveFactorMantissa()).to.equal(
          parseUnits(vFrax_riskParameters.reserveFactor, 18),
        );
        expect(await vsFRAXContract.reserveFactorMantissa()).to.equal(
          parseUnits(vsFrax_riskParameters.reserveFactor, 18),
        );
      });

      it(`check CF`, async () => {
        let market = await comptroller.markets(vFRAX);
        expect(market.collateralFactorMantissa).to.equal(parseUnits(vFrax_riskParameters.collateralFactor, 18));

        market = await comptroller.markets(vsFRAX);
        expect(market.collateralFactorMantissa).to.equal(parseUnits(vsFrax_riskParameters.collateralFactor, 18));
      });

      it(`check liquidation threshold`, async () => {
        let market = await comptroller.markets(vFRAX);
        expect(market.liquidationThresholdMantissa).to.equal(parseUnits(vFrax_riskParameters.liquidationThreshold, 18));

        market = await comptroller.markets(vsFRAX);
        expect(market.liquidationThresholdMantissa).to.equal(
          parseUnits(vsFrax_riskParameters.liquidationThreshold, 18),
        );
      });

      it(`check protocol seize share`, async () => {
        expect(await vFRAXContract.protocolSeizeShareMantissa()).to.equal(parseUnits("0.05", 18));
        expect(await vsFRAXContract.protocolSeizeShareMantissa()).to.equal(parseUnits("0.05", 18));
      });

      it(`check supply cap`, async () => {
        expect(await comptroller.supplyCaps(vFRAX)).to.equal(parseUnits(vFrax_riskParameters.supplyCap, 18));
        expect(await comptroller.supplyCaps(vsFRAX)).to.equal(parseUnits(vsFrax_riskParameters.supplyCap, 18));
      });

      it(`check borrow cap`, async () => {
        expect(await comptroller.borrowCaps(vFRAX)).to.equal(parseUnits(vFrax_riskParameters.borrowCap, 18));
        expect(await comptroller.borrowCaps(vsFRAX)).to.equal(parseUnits(vsFrax_riskParameters.borrowCap, 18));
      });

      it("Interest rates", async () => {
        checkInterestRate(
          await vFRAXContract.interestRateModel(),
          vFrax_interestRateModel.vToken,
          {
            base: vFrax_interestRateModel.base,
            multiplier: vFrax_interestRateModel.multiplier,
            jump: vFrax_interestRateModel.jump,
            kink: vFrax_interestRateModel.kink,
          },
          BLOCKS_PER_YEAR,
        );

        checkInterestRate(
          await vsFRAXContract.interestRateModel(),
          vsFrax_interestRateModel.vToken,
          {
            base: vsFrax_interestRateModel.base,
            multiplier: vsFrax_interestRateModel.multiplier,
            jump: vsFrax_interestRateModel.jump,
            kink: vsFrax_interestRateModel.kink,
          },
          BLOCKS_PER_YEAR,
        );
      });
    });

    it("generic IL tests", async () => {
      const FRAX_HOLDER = "0xcE6431D21E3fb1036CE9973a3312368ED96F5CE7";
      await impersonateAccount(FRAX_HOLDER);

      await checkIsolatedPoolsComptrollers({
        [COMPTROLLER]: FRAX_HOLDER,
      });

      await checkVToken(vFRAX, {
        name: "Venus Frax (Core)",
        symbol: "vFRAX_Core",
        decimals: 8,
        underlying: FRAX,
        exchangeRate: parseUnits("10000000000", 18),
        comptroller: COMPTROLLER,
      });

      await checkVToken(vsFRAX, {
        name: "Venus Staked FRAX (Core)",
        symbol: "vsFRAX_Core",
        decimals: 8,
        underlying: sFRAX,
        exchangeRate: parseUnits("10000000000", 18),
        comptroller: COMPTROLLER,
      });
    });

    it("generic reward tests", async () => {
      await checkRewardsDistributor("RewardsDistributor_Core_0_FRAX", {
        pool: COMPTROLLER,
        address: REWARDS_DISTRIBUTOR_XVS,
        token: XVS,
        vToken: vFRAX,
        borrowSpeed: "2222222222222222",
        supplySpeed: "1481481481481481",
        totalRewardsToDistribute: parseUnits("2400", 18),
      });

      await checkRewardsDistributor("RewardsDistributor_Core_0_SFRAX", {
        pool: COMPTROLLER,
        address: REWARDS_DISTRIBUTOR_XVS,
        token: XVS,
        vToken: vsFRAX,
        borrowSpeed: "1481481481481481",
        supplySpeed: "2222222222222222",
        totalRewardsToDistribute: parseUnits("2400", 18),
      });

      await checkRewardsDistributorPool(COMPTROLLER, 2);
    });
  });
});
