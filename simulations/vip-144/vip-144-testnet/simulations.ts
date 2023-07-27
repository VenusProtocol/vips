import { expect } from "chai";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import { vip144Testnet } from "../../../vips/vip-144/vip-144-testnet";
import BEACON_ABI from "./abi/beacon.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";

const VBIFI = "0xEF949287834Be010C1A5EDd757c385FB9b644E4A";
const BIFI = "0x5B662703775171c4212F2FBAdb7F92e64116c154";
const VBSW = "0x5e68913fbbfb91af30366ab1B21324410b49a308";
const BSW = "0x7FCC76fc1F573d8Eb445c236Cc282246bC562bCE";
const VBSW_USER = "0x03862dFa5D0be8F64509C001cb8C6188194469DF";
const COMPTROLLER_DEFI = "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD";
const BEACON = "0xdDDD7725C073105fB2AbfCbdeC16708fC4c24B74";
const OLD_IMPL_COMPTROLLER = "0x80691DaD6dAb8a028FFE68bb8045f2547d210f9D";
const POOL_REGISTRY_PROXY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
const POOL_REGISTRY_OLD_IMPL = "0xed659A02c5f63f299C28F6A246143326b922e3d9";
const PROXY_ADMIN = "0xef480a5654b231ff7d80A0681F938f3Db71a6Ca6";

forking(31917221, () => {
  let comptroller: ethers.Contract;
  let poolRegistry: ethers.Contract;
  let beacon: ethers.Contract;
  let expectedComptrollerStorage;
  let expectedPoolStorage;
  const provider = ethers.provider;

  async function fetchComptrollerStorage() {
    const acm = await poolRegistry.accessControlManager();
    const allPools = await poolRegistry.getAllPools();
    const poolByComptroller = await poolRegistry.getPoolByComptroller(COMPTROLLER_DEFI);
    const poolByAsset = await poolRegistry.getPoolsSupportedByAsset(BSW);
    const vTokenForAsset = await poolRegistry.getVTokenForAsset(COMPTROLLER_DEFI, BSW);
    const owner = await poolRegistry.owner();
    const pendingOwner = await poolRegistry.pendingOwner();

    return {
      acm,
      allPools,
      poolByComptroller,
      poolByAsset,
      vTokenForAsset,
      owner,
      pendingOwner,
    };
  }

  async function fetchPoolRegistryStorage() {
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
    poolRegistry = new ethers.Contract(POOL_REGISTRY_PROXY, POOL_REGISTRY_ABI, provider);
    beacon = new ethers.Contract(BEACON, BEACON_ABI, provider);
    expectedComptrollerStorage = await fetchComptrollerStorage();
    expectedPoolStorage = await fetchPoolRegistryStorage();
  });

  testVip("VIP-144 Remove BIFI Market", vip144Testnet());

  describe("Post-VIP behavior", async () => {
    it("Comptroller Implementation should be = 0x80691DaD6dAb8a028FFE68bb8045f2547d210f9D", async () => {
      expect(await beacon.implementation()).equals(OLD_IMPL_COMPTROLLER);
    });

    it("Pool Registry Implementation should be = 0xed659A02c5f63f299C28F6A246143326b922e3d9", async () => {
      const ProxyAdminInterface = [`function getProxyImplementation(address) view returns (address)`];
      const proxyAdmin = new ethers.Contract(PROXY_ADMIN, ProxyAdminInterface, provider);
      const result = await proxyAdmin.getProxyImplementation(POOL_REGISTRY_PROXY);
      expect(result).to.equal(POOL_REGISTRY_OLD_IMPL);
    });

    it("Market should not listed", async () => {
      expect((await comptroller.markets(VBIFI)).isListed).equals(false);
    });

    it("Market should not include in list", async () => {
      expect(await comptroller.getAllMarkets()).to.not.include(VBIFI);
    });

    it("Empty Pool by asset", async () => {
      const poolByAsset = await poolRegistry.getPoolsSupportedByAsset(BIFI);

      expect(poolByAsset).to.be.an("array").that.is.empty;
    });

    it("Empty Vtoken By Asset", async () => {
      const vTokenForAsset = await poolRegistry.getVTokenForAsset(COMPTROLLER_DEFI, BIFI);
      expect(vTokenForAsset).equals(ethers.constants.AddressZero);
    });

    it("Should match storage of BSW market", async () => {
      const actualStorage = await fetchComptrollerStorage();
      expect(expectedComptrollerStorage).to.deep.equal(actualStorage);
    });

    it("Should match storage of Pool Registry", async () => {
      const actualStorage = await fetchPoolRegistryStorage();
      expect(expectedPoolStorage).to.deep.equal(actualStorage);
    });
  });
});
