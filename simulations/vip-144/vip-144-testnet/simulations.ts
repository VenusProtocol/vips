import { expect } from "chai";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import { vip144Testnet } from "../../../vips/vip-144/vip-144-testnet";
import BEACON_ABI from "./abi/beacon.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const VBIFI = "0xEF949287834Be010C1A5EDd757c385FB9b644E4A";
const VBSW = "0x5e68913fbbfb91af30366ab1B21324410b49a308";
const VBSW_USER = "0x03862dFa5D0be8F64509C001cb8C6188194469DF";
const COMPTROLLER_DEFI = "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD";
const BEACON = "0xdDDD7725C073105fB2AbfCbdeC16708fC4c24B74";
const OLD_IMPL = "0x80691DaD6dAb8a028FFE68bb8045f2547d210f9D";

forking(31685191, () => {
  let comptroller: ethers.Contract;
  let beacon: ethers.Contract;
  let expectedStorage;
  const provider = ethers.provider;

  async function fetchStorage() {
    const acm = await comptroller.accessControlManager();
    const accountAssets = await comptroller.accountAssets(VBSW_USER, 0);
    const actionPaused = await comptroller.actionPaused(VBSW, 0);
    const borrowCaps = await comptroller.borrowCaps(VBSW);
    const checkMemebership = await comptroller.checkMembership(VBSW_USER, VBSW);
    const closeFactorMantissa = await comptroller.closeFactorMantissa();
    const accountLiquidity = await comptroller.getAccountLiquidity(VBSW_USER);
    let allMarketsAfter = await comptroller.getAllMarkets();
    allMarketsAfter = allMarketsAfter.filter(item => item !== VBIFI);
    allMarketsAfter.sort();
    const assetsIn = await comptroller.getAssetsIn(VBSW_USER);
    const borrowingPower = await comptroller.getBorrowingPower(VBSW_USER);
    const rewardDistributors = await comptroller.getRewardDistributors();
    const liquidationIncentive = await comptroller.liquidationIncentiveMantissa();
    const oracle = await comptroller.oracle();
    const owner = await comptroller.owner();
    const poolRegistry = await comptroller.poolRegistry();
    const supplyCaps = await comptroller.supplyCaps(VBSW);

    return {
      acm,
      accountAssets,
      actionPaused,
      borrowCaps,
      checkMemebership,
      closeFactorMantissa,
      accountLiquidity,
      allMarketsAfter,
      assetsIn,
      borrowingPower,
      rewardDistributors,
      liquidationIncentive,
      oracle,
      owner,
      poolRegistry,
      supplyCaps,
    };
  }

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER_DEFI, COMPTROLLER_ABI, provider);
    beacon = new ethers.Contract(BEACON, BEACON_ABI, provider);
    expectedStorage = await fetchStorage();
  });

  testVip("VIP-144 Remove BIFI Market", vip144Testnet());

  describe("Post-VIP behavior", async () => {
    it("Implementation should be = 0x80691DaD6dAb8a028FFE68bb8045f2547d210f9D", async () => {
      expect(await beacon.implementation()).equals(OLD_IMPL);
    });

    it("Market should not listed", async () => {
      expect((await comptroller.markets(VBIFI)).isListed).equals(false);
    });

    it("Market should not include in list", async () => {
      expect(await comptroller.getAllMarkets()).to.not.include(VBIFI);
    });

    it("Should match storage of BSW market", async () => {
      const actualStorage = await fetchStorage();
      expect(expectedStorage).to.deep.equal(actualStorage);
    });
  });
});
