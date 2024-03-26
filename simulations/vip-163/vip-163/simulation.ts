import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import {
  RewardsDistributorConfig,
  checkRewardsDistributor,
  checkRewardsDistributorPool,
} from "../../../src/vip-framework/checks/rewardsDistributor";
import { vip163 } from "../../../vips/vip-163/vip-163";
import COMPTROLLER_ABI from "./abi/COMPTROLLER.json";
import COMPTROLLER_BEACON_ABI from "./abi/COMPTROLLER_BEACON.json";
import REWARDS_DISTRIBUTOR_ABI from "./abi/REWARDS_DISTRIBUTOR.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

const COMPTROLLER_BEACON = "0x38B4Efab9ea1bAcD19dC81f19c4D1C2F9DeAe1B2";
const OLD_IMPL = "0x939C05e2E694db68cE54d80bf29926b09190aA0F";
const NEW_IMPL = "0x17a6ac4f7f01387303deB1D78f01aC0A0C1a75b0";
const HAY_REWARDS_DISTRIBUTOR = "0xA31185D804BF9209347698128984a43A67Ce6d11";
const SD_REWARDS_DISTRIBUTOR = "0xBE607b239a8776B47159e2b0E9E65a7F1DAA6478";
const STABLE_COINS_POOL = "0x94c1495cD4c557f1560Cbd68EAB0d197e6291571";
const LIQUID_STAKED_BNB_POOL = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
const HAY_TOKEN = "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5";
const SD_TOKEN = "0x3BC5AC0dFdC871B365d159f728dd1B9A0B5481E8";
const MARKET_BNBx = "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791";
const MARKET_HAY = "0xCa2D81AA7C09A1a025De797600A7081146dceEd9";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const hayRewardsDistributorConfig: RewardsDistributorConfig = {
  pool: STABLE_COINS_POOL,
  address: HAY_REWARDS_DISTRIBUTOR,
  token: HAY_TOKEN,
  vToken: MARKET_HAY,
  borrowSpeed: parseUnits("2000", 18).div(2).div(806400),
  supplySpeed: parseUnits("2000", 18).div(2).div(806400),
  totalRewardsToDistribute: parseUnits("2000", 18),
};

const sdRewardsDistributorConfig: RewardsDistributorConfig = {
  pool: LIQUID_STAKED_BNB_POOL,
  address: SD_REWARDS_DISTRIBUTOR,
  token: SD_TOKEN,
  vToken: MARKET_BNBx,
  borrowSpeed: 0,
  supplySpeed: parseUnits("2000", 18).div(864000),
  totalRewardsToDistribute: parseUnits("2000", 18),
};

forking(31166657, () => {
  let comptrollerBeacon: ethers.Contract;
  let hayRewardsDistributor: ethers.Contract;
  let sdRewardsDistributor: ethers.Contract;
  const provider = ethers.provider;

  before(async () => {
    comptrollerBeacon = new ethers.Contract(COMPTROLLER_BEACON, COMPTROLLER_BEACON_ABI, provider);
    hayRewardsDistributor = new ethers.Contract(HAY_REWARDS_DISTRIBUTOR, REWARDS_DISTRIBUTOR_ABI, provider);
    sdRewardsDistributor = new ethers.Contract(SD_REWARDS_DISTRIBUTOR, REWARDS_DISTRIBUTOR_ABI, provider);
  });
  describe("Pre-VIP behavior", async () => {
    describe("Comptroller Beacon", async () => {
      it("Validate beacon implementation", async () => {
        const comptrollerAddress = await comptrollerBeacon.implementation();
        expect(comptrollerAddress).to.equal(OLD_IMPL);
        expect(await hayRewardsDistributor.owner()).to.not.equal(NORMAL_TIMELOCK);
        expect(await sdRewardsDistributor.owner()).to.not.equal(NORMAL_TIMELOCK);
      });
    });
  });

  testVip("VIP-163 HAY and SD Rewards", vip163(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_BEACON_ABI, VTREASURY_ABI, COMPTROLLER_ABI, REWARDS_DISTRIBUTOR_ABI],
        [
          "Upgraded",
          "WithdrawTreasuryBEP20",
          "NewRewardsDistributor",
          "RewardTokenSupplySpeedUpdated",
          "RewardTokenBorrowSpeedUpdated",
        ],
        [1, 2, 2, 2, 1],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    describe("Comptroller Beacon", async () => {
      it("Validate beacon implementation", async () => {
        const comptrollerAddress = await comptrollerBeacon.implementation();
        expect(comptrollerAddress).to.equal(NEW_IMPL);
      });
    });

    describe("Pools configuration", () => {
      checkRewardsDistributorPool(STABLE_COINS_POOL, 2);
      checkRewardsDistributorPool(LIQUID_STAKED_BNB_POOL, 4);
    });

    checkRewardsDistributor("RewardsDistributor_HAY_Stablecoins", hayRewardsDistributorConfig);
    checkRewardsDistributor("RewardsDistributor_SD_LiquidStakedBNB", sdRewardsDistributorConfig);
  });
});
