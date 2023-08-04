import { expect } from "chai";
import { ethers } from "hardhat";

import { setMaxStalePeriodInChainlinkOracle } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip152 } from "../../../vips/vip-152/vip-152";
import BEACON_ABI from "./abi/beacon.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";

const VBSW = "0x8f657dFD3a1354DEB4545765fE6840cc54AFd379";
const BSW = "0x965F527D9159dCe6288a2219DB51fc6Eef120dD1";
const VBSW_USER = "0x57bdb8a1357aa19aa9add1a1acd888b9a5bd787f";
const OLD_IMPL_COMPTROLLER = "0x939C05e2E694db68cE54d80bf29926b09190aA0F";
const BEACON = "0x38B4Efab9ea1bAcD19dC81f19c4D1C2F9DeAe1B2";
const COMPTROLLER_DEFI = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const VBIFI = "0xC718c51958d3fd44f5F9580c9fFAC2F89815C909";
const BIFI = "0xCa3F508B8e4Dd382eE878A314789373D80A5190A";
const POOL_REGISTRY_PROXY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
const POOL_REGISTRY_OLD_IMPL = "0xc4953e157D057941A9a71273B0aF4d4477ED2770";
const PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const BSW_FEED = "0x08E70777b982a58D23D05E3D7714f44837c06A21";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

forking(30362200, () => {
  let comptroller: ethers.Contract;
  let poolRegistry: ethers.Contract;
  let beacon: ethers.Contract;
  let expectedComptrollerStorage;
  let expectedPoolStorage;
  const provider = ethers.provider;

  async function fetchPoolRegistryStorage() {
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

  async function fetchComptrollerStorage() {
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
    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, BSW, BSW_FEED, NORMAL_TIMELOCK);
  });

  testVip("VIP-152 Remove BIFI Market", vip152());

  describe("Post-VIP behavior", async () => {
    it("Comptroller Implementation should be = 0x939C05e2E694db68cE54d80bf29926b09190aA0F", async () => {
      expect(await beacon.implementation()).equals(OLD_IMPL_COMPTROLLER);
    });

    it("Pool Registry Implementation should be = 0xc4953e157D057941A9a71273B0aF4d4477ED2770", async () => {
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
