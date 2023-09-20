import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vipComptrollerBeaconUpgradeTestnet } from "../../../vips/vip-isolated-pools-comptroller-upgrade/vip-comptroller-upgrade-testnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_BEACON_ABI from "./abi/comptroller-beacon.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const OLD_COMPTROLLER_IMPLEMENTATION = "0x069705246364d60c5503bF19b4A714ab412521a0";
const NEW_COMPTROLLER_IMPLEMENTATION = "0xa764a2eAc5C59DFb23E43850cBA89117f1c9f5AB";
const COMPTROLLER_BEACON = "0xdDDD7725C073105fB2AbfCbdeC16708fC4c24B74";
const POOL_STABLECOIN = "0x10b57706AD2345e590c2eA4DC02faef0d9f5b08B";
const POOL_DEFI = "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD";
const POOL_GAMEFI = "0x1F4f0989C51f12DAcacD4025018176711f3Bf289";
const POOL_LIQUID_STAKED_BNB = "0x596B11acAACF03217287939f88d63b51d3771704";
const POOL_TRON = "0x11537D023f489E4EF0C7157cc729C7B69CbE0c97";
const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";

function matchValues(array1: string[], array2: string[]) {
  for (let i = 0; i < array1.length; i++) {
    expect(array1[i]).to.equal(array2[i]);
  }
}

forking(33504900, () => {
  const provider = ethers.provider;
  let comptrollerBeacon: ethers.Contract;
  let comptrollerStableCoin: ethers.Contract;
  let closeFactorMantissa: BigNumber;
  let markets: string[];
  let isComptroller: boolean;
  let maxLoopsLimit: number;
  let minLiquidatableCollateral: BigNumber;
  let oracle: string;
  let owner: string;
  let poolRegistry: string;
  let rewardDistributors: string[];

  beforeEach(async () => {
    comptrollerBeacon = new ethers.Contract(COMPTROLLER_BEACON, COMPTROLLER_BEACON_ABI, provider);
    comptrollerStableCoin = new ethers.Contract(POOL_STABLECOIN, COMPTROLLER_ABI, provider);

    closeFactorMantissa = await comptrollerStableCoin.closeFactorMantissa();
    markets = await comptrollerStableCoin.getAllMarkets();
    isComptroller = await comptrollerStableCoin.isComptroller();
    maxLoopsLimit = await comptrollerStableCoin.maxLoopsLimit();
    minLiquidatableCollateral = await comptrollerStableCoin.minLiquidatableCollateral();
    oracle = await comptrollerStableCoin.oracle();
    owner = await comptrollerStableCoin.owner();
    poolRegistry = await comptrollerStableCoin.poolRegistry();
    rewardDistributors = await comptrollerStableCoin.getRewardDistributors();
  });

  describe("Pre-VIP behavior", async () => {
    it("Comptroller beacon proxy should have old implementation", async () => {
      expect(await comptrollerBeacon.implementation()).to.equal(OLD_COMPTROLLER_IMPLEMENTATION);
    });
  });

  testVip("VIPComptrollerBeaconUpgradeTestnet", vipComptrollerBeaconUpgradeTestnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_BEACON_ABI], ["Upgraded"], [1]);
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [15]);
    },
  });

  describe("Post-VIP behavior", () => {
    let accessControlManager: ethers.Contract;
    let comptrollerStableCoinSigner: ethers.Signer;
    let comptrollerDefiSigner: ethers.Signer;
    let comptrollerGameFiSigner: ethers.Signer;
    let comptrollerLiquidStakedBnbSigner: ethers.Signer;
    let comptrollerTronSigner: ethers.Signer;

    before(async () => {
      accessControlManager = new ethers.Contract(ACM, ACM_ABI, provider);
      comptrollerStableCoinSigner = await initMainnetUser(POOL_STABLECOIN, ethers.utils.parseEther("1"));
      comptrollerDefiSigner = await initMainnetUser(POOL_DEFI, ethers.utils.parseEther("1"));
      comptrollerGameFiSigner = await initMainnetUser(POOL_GAMEFI, ethers.utils.parseEther("1"));
      comptrollerLiquidStakedBnbSigner = await initMainnetUser(POOL_LIQUID_STAKED_BNB, ethers.utils.parseEther("1"));
      comptrollerTronSigner = await initMainnetUser(POOL_TRON, ethers.utils.parseEther("1"));
    });

    it("Comptroller beacon implementation should be upgraded", async () => {
      expect(await comptrollerBeacon.implementation()).to.equal(NEW_COMPTROLLER_IMPLEMENTATION);
    });

    it("Storage layout should be same after upgarde", async () => {
      expect(await comptrollerStableCoin.accessControlManager()).to.equal(ACM);
      expect(await comptrollerStableCoin.closeFactorMantissa()).to.equal(closeFactorMantissa);
      expect(await comptrollerStableCoin.isComptroller()).to.equal(isComptroller);
      expect(await comptrollerStableCoin.maxLoopsLimit()).to.equal(maxLoopsLimit);
      expect(await comptrollerStableCoin.minLiquidatableCollateral()).to.equal(minLiquidatableCollateral);
      expect(await comptrollerStableCoin.oracle()).to.equal(oracle);
      expect(await comptrollerStableCoin.owner()).to.equal(owner);
      expect(await comptrollerStableCoin.poolRegistry()).to.equal(poolRegistry);

      const marketsAfterComptrollerUpgrade = await comptrollerStableCoin.getAllMarkets();
      const rewardDistributorsAfterComptrollerUpgrade = await comptrollerStableCoin.getRewardDistributors();

      expect(marketsAfterComptrollerUpgrade.length).to.equal(markets.length);
      expect(rewardDistributorsAfterComptrollerUpgrade.length).to.equal(rewardDistributors.length);

      matchValues(marketsAfterComptrollerUpgrade, markets);
      matchValues(rewardDistributorsAfterComptrollerUpgrade, rewardDistributors);
    });

    it("Pool StableCoin permissions", async () => {
      expect(
        await accessControlManager
          .connect(comptrollerStableCoinSigner)
          .isAllowedToCall(CRITICAL_TIMELOCK, "_setForcedLiquidation(address,bool)"),
      ).equals(true);
      expect(
        await accessControlManager
          .connect(comptrollerStableCoinSigner)
          .isAllowedToCall(FAST_TRACK_TIMELOCK, "_setForcedLiquidation(address,bool)"),
      ).equals(true);
      expect(
        await accessControlManager
          .connect(comptrollerStableCoinSigner)
          .isAllowedToCall(NORMAL_TIMELOCK, "_setForcedLiquidation(address,bool)"),
      ).equals(true);
    });

    it("Pool Defi permissions", async () => {
      expect(
        await accessControlManager
          .connect(comptrollerDefiSigner)
          .isAllowedToCall(CRITICAL_TIMELOCK, "_setForcedLiquidation(address,bool)"),
      ).equals(true);
      expect(
        await accessControlManager
          .connect(comptrollerDefiSigner)
          .isAllowedToCall(FAST_TRACK_TIMELOCK, "_setForcedLiquidation(address,bool)"),
      ).equals(true);
      expect(
        await accessControlManager
          .connect(comptrollerDefiSigner)
          .isAllowedToCall(NORMAL_TIMELOCK, "_setForcedLiquidation(address,bool)"),
      ).equals(true);
    });

    it("Pool GameFi permissions", async () => {
      expect(
        await accessControlManager
          .connect(comptrollerGameFiSigner)
          .isAllowedToCall(CRITICAL_TIMELOCK, "_setForcedLiquidation(address,bool)"),
      ).equals(true);
      expect(
        await accessControlManager
          .connect(comptrollerGameFiSigner)
          .isAllowedToCall(FAST_TRACK_TIMELOCK, "_setForcedLiquidation(address,bool)"),
      ).equals(true);
      expect(
        await accessControlManager
          .connect(comptrollerGameFiSigner)
          .isAllowedToCall(NORMAL_TIMELOCK, "_setForcedLiquidation(address,bool)"),
      ).equals(true);
    });

    it("Pool Liquied Staked Bnb permissions", async () => {
      expect(
        await accessControlManager
          .connect(comptrollerLiquidStakedBnbSigner)
          .isAllowedToCall(CRITICAL_TIMELOCK, "_setForcedLiquidation(address,bool)"),
      ).equals(true);
      expect(
        await accessControlManager
          .connect(comptrollerLiquidStakedBnbSigner)
          .isAllowedToCall(FAST_TRACK_TIMELOCK, "_setForcedLiquidation(address,bool)"),
      ).equals(true);
      expect(
        await accessControlManager
          .connect(comptrollerLiquidStakedBnbSigner)
          .isAllowedToCall(NORMAL_TIMELOCK, "_setForcedLiquidation(address,bool)"),
      ).equals(true);
    });

    it("Pool Tron permissions", async () => {
      expect(
        await accessControlManager
          .connect(comptrollerTronSigner)
          .isAllowedToCall(CRITICAL_TIMELOCK, "_setForcedLiquidation(address,bool)"),
      ).equals(true);
      expect(
        await accessControlManager
          .connect(comptrollerTronSigner)
          .isAllowedToCall(FAST_TRACK_TIMELOCK, "_setForcedLiquidation(address,bool)"),
      ).equals(true);
      expect(
        await accessControlManager
          .connect(comptrollerTronSigner)
          .isAllowedToCall(NORMAL_TIMELOCK, "_setForcedLiquidation(address,bool)"),
      ).equals(true);
    });
  });
});
