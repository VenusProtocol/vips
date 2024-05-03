import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import {
  COMPTROLLER,
  FRAX,
  REWARDS_DISTRIBUTOR_vFRAX,
  REWARDS_DISTRIBUTOR_vsFRAX,
  SFRAX_TO_FRAX_RATE,
  XVS,
  XVS_REWARD_TRANSFER,
  sFRAX,
  vFRAX,
  vip025,
  vsFRAX,
} from "../../../proposals/sepolia/vip-025";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardsDistributor.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { sepolia } = NETWORK_ADDRESSES;

forking(5827248, () => {
  let resilientOracle: Contract;
  let poolRegistry: Contract;
  let vFRAXContract: Contract;
  let vsFRAXContract: Contract;
  let comptroller: Contract;
  let rewardDistributorFrax: Contract;
  let rewardDistributorSFrax: Contract;
  let xvs: Contract;

  before(async () => {
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, sepolia.RESILIENT_ORACLE);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, sepolia.POOL_REGISTRY);
    vFRAXContract = await ethers.getContractAt(VTOKEN_ABI, vFRAX);
    vsFRAXContract = await ethers.getContractAt(VTOKEN_ABI, vsFRAX);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
    rewardDistributorFrax = await ethers.getContractAt(REWARD_DISTRIBUTOR_ABI, REWARDS_DISTRIBUTOR_vFRAX);
    rewardDistributorSFrax = await ethers.getContractAt(REWARD_DISTRIBUTOR_ABI, REWARDS_DISTRIBUTOR_vsFRAX);
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
      await pretendExecutingVip(vip025());
    });

    it("check FRAX price", async () => {
      expect(await resilientOracle.getPrice(FRAX)).to.equal(parseUnits("1", 18));
    });

    it("check sFRAX price", async () => {
      expect(await resilientOracle.getPrice(sFRAX)).to.equal(SFRAX_TO_FRAX_RATE);
    });

    it("should have 10 markets in core pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(10);
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
      expect(await vFRAXContract.owner()).to.equal(sepolia.GUARDIAN);
    });

    it("check vsFRAX ownership", async () => {
      expect(await vsFRAXContract.owner()).to.equal(sepolia.GUARDIAN);
    });

    it("check vFRAX supply", async () => {
      const expectedSupply = parseUnits("5", 11);
      expect(await vFRAXContract.balanceOf(sepolia.VTREASURY)).to.equal(expectedSupply);
    });

    it("check vsFRAX supply", async () => {
      const expectedSupply = parseUnits("48", 10);
      expect(await vsFRAXContract.totalSupply()).to.equal(expectedSupply);
    });

    it("check vFRAX reward token", async () => {
      expect(await rewardDistributorFrax.rewardToken()).to.equal(XVS);
    });

    it("check vsFRAX reward token", async () => {
      expect(await rewardDistributorSFrax.rewardToken()).to.equal(XVS);
    });

    it("check vFRAX rewards distributor ownership", async () => {
      expect(await rewardDistributorFrax.owner()).to.equal(sepolia.GUARDIAN);
    });

    it("check vsFRAX rewards distributor ownership", async () => {
      expect(await rewardDistributorSFrax.owner()).to.equal(sepolia.GUARDIAN);
    });

    it(`vFRAX rewards distributor should have balance`, async () => {
      expect(await xvs.balanceOf(rewardDistributorFrax.address)).to.equal(XVS_REWARD_TRANSFER);
    });

    it(`vsFRAX rewards distributor should have balance`, async () => {
      expect(await xvs.balanceOf(rewardDistributorSFrax.address)).to.equal(XVS_REWARD_TRANSFER);
    });

    it(`vFRAX rewards distributor should be registered in Comptroller`, async () => {
      expect(await comptroller.getRewardDistributors()).to.contain(rewardDistributorFrax.address);
    });

    it(`vsFRAX rewards distributor should be registered in Comptroller`, async () => {
      expect(await comptroller.getRewardDistributors()).to.contain(rewardDistributorSFrax.address);
    });
  });
});
