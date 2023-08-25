import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testVip } from "../../../src/vip-framework";

import COMPTROLLER_BEACON_ABI from "./abi/COMPTROLLER_BEACON.json";
import REWARDS_DISTRIBUTOR_ABI from "./abi/REWARDS_DISTRIBUTOR.json";
import { vip162 } from "../../../vips/vip-162/vip-162";

const COMPTROLLER_BEACON = "0x38B4Efab9ea1bAcD19dC81f19c4D1C2F9DeAe1B2";
const OLD_IMPL = "0x939C05e2E694db68cE54d80bf29926b09190aA0F";
const NEW_IMPL = "0x17a6ac4f7f01387303deB1D78f01aC0A0C1a75b0";
const HAY_REWARDS_DISTRIBUTOR = "0xA31185D804BF9209347698128984a43A67Ce6d11";
const SD_REWARDS_DISTRIBUTOR = "0xBE607b239a8776B47159e2b0E9E65a7F1DAA6478";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

forking(31166657, () => {
  let comptrollerBeacon: ethers.Contract;
  let hayRewardsDistributor: ethers.Contract;
  let sdRewardsDistributor: ethers.Contract;
  const provider = ethers.provider;

  const toBlockRate = (ratePerYear: BigNumber): BigNumber => {
    const BLOCKS_PER_YEAR = BigNumber.from("10512000");
    return ratePerYear.div(BLOCKS_PER_YEAR);
  };

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

  testVip("VIP-162 HAY and SD Rewards", vip162(), {
    callbackAfterExecution: async txResponse => {},
  });

  describe("Post-VIP behavior", async () => {
    describe("Comptroller Beacon", async () => {
      it("Validate beacon implementation", async () => {
        const comptrollerAddress = await comptrollerBeacon.implementation();
        expect(comptrollerAddress).to.equal(NEW_IMPL);
        expect(await hayRewardsDistributor.owner()).to.equal(NORMAL_TIMELOCK);
        expect(await sdRewardsDistributor.owner()).to.equal(NORMAL_TIMELOCK);
      });
    });
  });
});
