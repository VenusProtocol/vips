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
const VHAY_STABLE_COIN = "0x170d3b2da05cc2124334240fB34ad1359e34C562";
const VBSW_DEFI = "0x5e68913fbbfb91af30366ab1B21324410b49a308";
const VRACA_GAMEFI = "0x1958035231E125830bA5d17D168cEa07Bb42184a";
const VANKRBNB_LIQUIDSTAKEDBNB = "0x57a664Dd7f1dE19545fEE9c86C949e3BF43d6D47";
const VBTT_TRON = "0x47793540757c6E6D84155B33cd8D9535CFdb9334";

function matchValues(array1: string[], array2: string[]) {
  for (let i = 0; i < array1.length; i++) {
    expect(array1[i]).to.equal(array2[i]);
  }
}

async function verifyAccessControlPermissions(
  accessControlManager: ethers.Contract,
  comptrollerSigner: ethers.Signer,
  values: string[],
) {
  const returnValues = [];
  for (let i = 0; i < values.length; i++) {
    returnValues.push(
      await accessControlManager
        .connect(comptrollerSigner)
        .isAllowedToCall(values[i], "setForcedLiquidation(address,bool)"),
    );
  }
  return returnValues;
}

async function verifySetForcedLiquidation(signers: ethers.Signer[], comptroller: ethers.Contract, vToken: string) {
  for (let i = 0; i < signers.length; i++) {
    await comptroller.connect(signers[i]).setForcedLiquidation(vToken, true);
    expect(await comptroller.isForcedLiquidationEnabled(vToken)).to.be.equal(true);
  }
}

forking(33504900, () => {
  const provider = ethers.provider;
  let comptrollerBeacon: ethers.Contract;
  let comptrollerStableCoin: ethers.Contract;
  let comptrollerDefi: ethers.Contract;
  let comptrollerGameFi: ethers.Contract;
  let comptrollerLiquidStakedBnb: ethers.Contract;
  let comptrollerTron: ethers.Contract;
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
    const timeLockArray: string[] = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];
    const boolArray: bool[] = [true, true, true];
    let accessControlManager: ethers.Contract;
    let comptrollerStableCoinSigner: ethers.Signer;
    let comptrollerDefiSigner: ethers.Signer;
    let comptrollerGameFiSigner: ethers.Signer;
    let comptrollerLiquidStakedBnbSigner: ethers.Signer;
    let comptrollerTronSigner: ethers.Signer;
    let normalTimeLockSigner: ethers.Signer;
    let fastTrackTimeLockSigner: ethers.Signer;
    let criticalTimeLockSigner: ethers.Signer;
    let timeLockSignersArray: ethers.Signer[];

    before(async () => {
      accessControlManager = new ethers.Contract(ACM, ACM_ABI, provider);
      comptrollerDefi = new ethers.Contract(POOL_DEFI, COMPTROLLER_ABI, provider);
      comptrollerGameFi = new ethers.Contract(POOL_GAMEFI, COMPTROLLER_ABI, provider);
      comptrollerLiquidStakedBnb = new ethers.Contract(POOL_LIQUID_STAKED_BNB, COMPTROLLER_ABI, provider);
      comptrollerTron = new ethers.Contract(POOL_TRON, COMPTROLLER_ABI, provider);

      comptrollerStableCoinSigner = await initMainnetUser(POOL_STABLECOIN, ethers.utils.parseEther("1"));
      comptrollerDefiSigner = await initMainnetUser(POOL_DEFI, ethers.utils.parseEther("1"));
      comptrollerGameFiSigner = await initMainnetUser(POOL_GAMEFI, ethers.utils.parseEther("1"));
      comptrollerLiquidStakedBnbSigner = await initMainnetUser(POOL_LIQUID_STAKED_BNB, ethers.utils.parseEther("1"));
      comptrollerTronSigner = await initMainnetUser(POOL_TRON, ethers.utils.parseEther("1"));

      normalTimeLockSigner = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      fastTrackTimeLockSigner = await initMainnetUser(FAST_TRACK_TIMELOCK, ethers.utils.parseEther("1"));
      criticalTimeLockSigner = await initMainnetUser(CRITICAL_TIMELOCK, ethers.utils.parseEther("1"));
      timeLockSignersArray = [normalTimeLockSigner, fastTrackTimeLockSigner, criticalTimeLockSigner];
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
      matchValues(
        boolArray,
        await verifyAccessControlPermissions(accessControlManager, comptrollerStableCoinSigner, timeLockArray),
      );
    });

    it("Pool Defi permissions", async () => {
      matchValues(
        boolArray,
        await verifyAccessControlPermissions(accessControlManager, comptrollerDefiSigner, timeLockArray),
      );
    });

    it("Pool GameFi permissions", async () => {
      matchValues(
        boolArray,
        await verifyAccessControlPermissions(accessControlManager, comptrollerGameFiSigner, timeLockArray),
      );
    });

    it("Pool Liquied Staked Bnb permissions", async () => {
      matchValues(
        boolArray,
        await verifyAccessControlPermissions(accessControlManager, comptrollerLiquidStakedBnbSigner, timeLockArray),
      );
    });

    it("Pool Tron permissions", async () => {
      matchValues(
        boolArray,
        await verifyAccessControlPermissions(accessControlManager, comptrollerTronSigner, timeLockArray),
      );
    });

    it("SetForcedLiquidation should work properly for stable coin pool", async () => {
      await verifySetForcedLiquidation(timeLockSignersArray, comptrollerStableCoin, VHAY_STABLE_COIN);
    });

    it("SetForcedLiquidation should work properly for defi pool", async () => {
      await verifySetForcedLiquidation(timeLockSignersArray, comptrollerDefi, VBSW_DEFI);
    });

    it("SetForcedLiquidation should work properly for gamefi pool", async () => {
      await verifySetForcedLiquidation(timeLockSignersArray, comptrollerGameFi, VRACA_GAMEFI);
    });

    it("SetForcedLiquidation should work properly for liquid staked bnb pool", async () => {
      await verifySetForcedLiquidation(timeLockSignersArray, comptrollerLiquidStakedBnb, VANKRBNB_LIQUIDSTAKEDBNB);
    });

    it("SetForcedLiquidation should work properly for tron pool", async () => {
      await verifySetForcedLiquidation(timeLockSignersArray, comptrollerTron, VBTT_TRON);
    });
  });
});
