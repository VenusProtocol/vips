import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import { REWARDS_DISTRIBUTOR, vip017, vweETH, weETH } from "../../../proposals/sepolia/vip-017";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardsDistributor.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { sepolia } = NETWORK_ADDRESSES;
const LIQUID_STAKED_COMPTROLLER = "0xd79CeB8EF8188E44b7Eb899094e8A3A4d7A1e236";
const USDC = "0x772d68929655ce7234C8C94256526ddA66Ef641E";

forking(5673551, () => {
  let resilientOracle: Contract;
  let poolRegistry: Contract;
  let vweETHContract: Contract;
  let comptroller: Contract;
  let rewardDistributor: Contract;

  before(async () => {
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, sepolia.RESILIENT_ORACLE);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, sepolia.POOL_REGISTRY);
    vweETHContract = await ethers.getContractAt(VTOKEN_ABI, vweETH);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, LIQUID_STAKED_COMPTROLLER);
    rewardDistributor = await ethers.getContractAt(REWARD_DISTRIBUTOR_ABI, REWARDS_DISTRIBUTOR);
  });

  describe("Pre-VIP behavior", () => {
    it("check price", async () => {
      await expect(resilientOracle.getPrice(weETH)).to.be.reverted;
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip017());
    });

    it("check price", async () => {
      expect(await resilientOracle.getPrice(weETH)).to.be.closeTo(parseUnits("3700", 18), parseUnits("50", 18));
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
      expect(await vweETHContract.owner()).to.equal(sepolia.GUARDIAN);
    });

    it("check supply", async () => {
      const expectedSupply = parseUnits("5", 8);
      expect(await vweETHContract.balanceOf(sepolia.VTREASURY)).to.equal(expectedSupply);
    });

    it("check reward token", async () => {
      expect(await rewardDistributor.rewardToken()).to.equal(USDC);
    });

    it("check reward speed", async () => {
      expect(await rewardDistributor.rewardTokenSupplySpeeds(vweETH)).to.equal("23148148148148148");
    });

    it("check rewards distributor ownership", async () => {
      expect(await rewardDistributor.owner()).to.equal(sepolia.GUARDIAN);
    });
  });
});
