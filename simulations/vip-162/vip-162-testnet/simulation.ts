import { expect } from "chai";
import { ethers } from "hardhat";
import { forking, testVip } from "../../../src/vip-framework";

import COMPTROLLER_BEACON_ABI from "./abi/COMPTROLLER_BEACON.json";
import REWARDS_DISTRIBUTOR_ABI from "./abi/REWARDS_DISTRIBUTOR.json";
import { vip162Testnet } from "../../../vips/vip-162/vip-162-testnet";

const COMPTROLLER_BEACON = "0xdDDD7725C073105fB2AbfCbdeC16708fC4c24B74";
const OLD_IMPL = "0x80691DaD6dAb8a028FFE68bb8045f2547d210f9D";
const NEW_IMPL = "0x069705246364d60c5503bF19b4A714ab412521a0";
const HAY_REWARDS_DISTRIBUTOR = "0xFFfC3fC29AFdc14408F1461d9AD4Ba976E25dcDc";
const SD_REWARDS_DISTRIBUTOR = "0x37fA1e5613455223F09e179DFAEBba61d7505C97";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";

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

  testVip("VIP-162 HAY and SD Rewards", vip162Testnet(), {
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
