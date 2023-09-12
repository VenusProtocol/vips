import { expect } from "chai";
import { BigNumberish } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import { vip155 } from "../../../vips/vip-155/vip-155";
import ERC20_ABI from "./abi/erc20.json";
import REWARDS_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";

interface RewardsDistributorConfig {
  pool: string;
  address: string;
  token: string;
  vToken: string;
  borrowSpeed: BigNumberish;
  supplySpeed: BigNumberish;
  totalRewardsToDistribute: BigNumberish;
  lastRewardsBlock: BigNumberish;
}

const expectedBswConfig: RewardsDistributorConfig = {
  pool: "0x3344417c9360b963ca93A4e8305361AEde340Ab9",
  address: "0x7524116CEC937ef17B5998436F16d1306c4F7EF8",
  token: "0x965F527D9159dCe6288a2219DB51fc6Eef120dD1",
  vToken: "0x8f657dFD3a1354DEB4545765fE6840cc54AFd379",
  borrowSpeed: parseUnits("19300", 18).div(2).div(864000),
  supplySpeed: parseUnits("19300", 18).div(2).div(864000),
  totalRewardsToDistribute: parseUnits("19300", 18),
  lastRewardsBlock: 30828632 + 864000,
};

forking(30726850, () => {
  testVip("VIP-155", vip155());

  describe("Rewards distributors configuration", () => {
    let rewardsDistributor: Contract;

    before(async () => {
      rewardsDistributor = await ethers.getContractAt(REWARDS_DISTRIBUTOR_ABI, expectedBswConfig.address);
    });

    it(`should have rewardToken = "${expectedBswConfig.token}"`, async () => {
      expect(await rewardsDistributor.rewardToken()).to.equal(expectedBswConfig.token);
    });

    it(`should have borrowSpeed = ${expectedBswConfig.borrowSpeed.toString()}`, async () => {
      expect(await rewardsDistributor.rewardTokenBorrowSpeeds(expectedBswConfig.vToken)).to.equal(
        expectedBswConfig.borrowSpeed,
      );
    });

    it(`should have supplySpeed = ${expectedBswConfig.supplySpeed.toString()}`, async () => {
      expect(await rewardsDistributor.rewardTokenSupplySpeeds(expectedBswConfig.vToken)).to.equal(
        expectedBswConfig.supplySpeed,
      );
    });

    it(`should have balance = ${expectedBswConfig.totalRewardsToDistribute.toString()}`, async () => {
      const token = await ethers.getContractAt(ERC20_ABI, expectedBswConfig.token);
      expect(await token.balanceOf(rewardsDistributor.address)).to.be.greaterThan(
        expectedBswConfig.totalRewardsToDistribute,
      );
    });

    it(`should have last rewards block equal to ${expectedBswConfig.lastRewardsBlock} for supply side`, async () => {
      const state = await rewardsDistributor.rewardTokenSupplyState(expectedBswConfig.vToken);
      expect(await state.lastRewardingBlock).to.equal(expectedBswConfig.lastRewardsBlock);
    });

    it(`should have last rewards block equal to ${expectedBswConfig.lastRewardsBlock} for borrow side`, async () => {
      const state = await rewardsDistributor.rewardTokenBorrowState(expectedBswConfig.vToken);
      expect(await state.lastRewardingBlock).to.equal(expectedBswConfig.lastRewardsBlock);
    });
  });
});
