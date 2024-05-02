import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import {
  vip025,
  FRAX,
  sFRAX,
  SFRAX_TO_FRAX_RATE
} from "../../../proposals/sepolia/vip-025";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardsDistributor.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { sepolia } = NETWORK_ADDRESSES;

forking(5821158, () => {
  let resilientOracle: Contract;
  // let poolRegistry: Contract;
  // let vweETHContract: Contract;
  // let comptroller: Contract;
  // let rewardDistributor: Contract;
  // let usdc: Contract;

  before(async () => {
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, sepolia.RESILIENT_ORACLE);
    // poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, sepolia.POOL_REGISTRY);
    // vweETHContract = await ethers.getContractAt(VTOKEN_ABI, vweETH);
    // comptroller = await ethers.getContractAt(COMPTROLLER_ABI, LIQUID_STAKED_COMPTROLLER);
    // rewardDistributor = await ethers.getContractAt(REWARD_DISTRIBUTOR_ABI, REWARDS_DISTRIBUTOR);
    // usdc = await ethers.getContractAt(ERC20_ABI, USDC);
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
    })

    // it("should have 3 markets in liquid staked pool", async () => {
    //   const poolVTokens = await comptroller.getAllMarkets();
    //   expect(poolVTokens).to.have.lengthOf(3);
    // });

    // it("should add vweETH to the pool", async () => {
    //   const registeredVToken = await poolRegistry.getVTokenForAsset(comptroller.address, weETH);
    //   expect(registeredVToken).to.equal(vweETH);
    // });

    // it("check ownership", async () => {
    //   expect(await vweETHContract.owner()).to.equal(sepolia.GUARDIAN);
    // });

    // it("check supply", async () => {
    //   const expectedSupply = parseUnits("5", 8);
    //   expect(await vweETHContract.balanceOf(sepolia.VTREASURY)).to.equal(expectedSupply);
    // });

    // it("check reward token", async () => {
    //   expect(await rewardDistributor.rewardToken()).to.equal(USDC);
    // });

    // it("check reward speed", async () => {
    //   expect(await rewardDistributor.rewardTokenSupplySpeeds(vweETH)).to.equal("23148");
    // });

    // it("check rewards distributor ownership", async () => {
    //   expect(await rewardDistributor.owner()).to.equal(sepolia.GUARDIAN);
    // });

    // it(`rewards distributor should have balance`, async () => {
    //   expect(await usdc.balanceOf(rewardDistributor.address)).to.equal(USDC_REWARD_TRANSFER);
    // });

    // it(`should be registered in Comptroller`, async () => {
    //   expect(await comptroller.getRewardDistributors()).to.contain(rewardDistributor.address);
    // });
  });
});
