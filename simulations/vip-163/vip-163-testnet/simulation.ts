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
import { vip163Testnet } from "../../../vips/vip-163/vip-163-testnet";
import COMPTROLLER_ABI from "./abi/COMPTROLLER.json";
import COMPTROLLER_BEACON_ABI from "./abi/COMPTROLLER_BEACON.json";
import REWARDS_DISTRIBUTOR_ABI from "./abi/REWARDS_DISTRIBUTOR.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

const COMPTROLLER_BEACON = "0xdDDD7725C073105fB2AbfCbdeC16708fC4c24B74";
const OLD_IMPL = "0x80691DaD6dAb8a028FFE68bb8045f2547d210f9D";
const NEW_IMPL = "0x069705246364d60c5503bF19b4A714ab412521a0";
const HAY_REWARDS_DISTRIBUTOR = "0x2aBEf3602B688493fe698EF11D27DCa43a0CE4BE";
const SD_REWARDS_DISTRIBUTOR = "0x37fA1e5613455223F09e179DFAEBba61d7505C97";
const STABLE_COINS_POOL = "0x10b57706AD2345e590c2eA4DC02faef0d9f5b08B";
const LIQUID_STAKED_BNB_POOL = "0x596B11acAACF03217287939f88d63b51d3771704";
const HAY_TOKEN = "0xe73774DfCD551BF75650772dC2cC56a2B6323453";
const SD_TOKEN = "0xac7D6B77EBD1DB8C5a9f0896e5eB5d485CB677b3";
const MARKET_BNBx = "0x644A149853E5507AdF3e682218b8AC86cdD62951";
const MARKET_HAY = "0x170d3b2da05cc2124334240fB34ad1359e34C562";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";

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
  borrowSpeed: parseUnits("2000", 18).div(2).div(864000),
  supplySpeed: parseUnits("2000", 18).div(2).div(864000),
  totalRewardsToDistribute: parseUnits("2000", 18),
};

forking(32763372, () => {
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

  testVip("VIP-163 HAY and SD Rewards", vip163Testnet(), {
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
        [1, 2, 2, 2, 2],
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
