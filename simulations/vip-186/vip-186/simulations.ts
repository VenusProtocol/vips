import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip186 } from "../../../vips/vip-186/vip-186";
import ACM_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_BEACON_ABI from "./abi/comptroller-beacon.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const OLD_COMPTROLLER_IMPLEMENTATION = "0x17a6ac4f7f01387303deB1D78f01aC0A0C1a75b0";
const NEW_COMPTROLLER_IMPLEMENTATION = "0x69Ca940186C29b6a9D64e1Be1C59fb7A466354E2";
const COMPTROLLER_BEACON = "0x38B4Efab9ea1bAcD19dC81f19c4D1C2F9DeAe1B2";
const POOL_STABLECOIN = "0x94c1495cD4c557f1560Cbd68EAB0d197e6291571";
const POOL_DEFI = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const POOL_GAMEFI = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";
const POOL_LIQUID_STAKED_BNB = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
const POOL_TRON = "0x23b4404E4E5eC5FF5a6FFb70B7d14E3FabF237B0";
const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const VHAY_STABLE_COIN = "0xCa2D81AA7C09A1a025De797600A7081146dceEd9";
const VBSW_DEFI = "0x8f657dFD3a1354DEB4545765fE6840cc54AFd379";
const VRACA_GAMEFI = "0xE5FE5527A5b76C75eedE77FdFA6B80D52444A465";
const VANKRBNB_LIQUIDSTAKEDBNB = "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f";
const VBTT_TRON = "0x49c26e12959345472E2Fd95E5f79F8381058d3Ee";

function matchValues(array1: (string | boolean)[], array2: string[]) {
  for (let i = 0; i < array1.length; i++) {
    expect(array1[i]).to.equal(array2[i]);
  }
}

async function verifyAccessControlPermissions(
  accessControlManager: Contract,
  comptrollerSigner: Signer,
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

async function verifySetForcedLiquidation(signers: Signer[], comptroller: Contract, vToken: string) {
  for (let i = 0; i < signers.length; i++) {
    await comptroller.connect(signers[i]).setForcedLiquidation(vToken, true);
    expect(await comptroller.isForcedLiquidationEnabled(vToken)).to.be.equal(true);
  }
}

forking(32567583, async () => {
  const provider = ethers.provider;
  let comptrollerBeacon: Contract;
  let comptrollerStableCoin: Contract;
  let comptrollerDefi: Contract;
  let comptrollerGameFi: Contract;
  let comptrollerLiquidStakedBnb: Contract;
  let comptrollerTron: Contract;
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

  testVip("vip186", await vip186(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_BEACON_ABI], ["Upgraded"], [1]);
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [15]);
    },
  });

  describe("Post-VIP behavior", () => {
    const timeLockArray: string[] = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];
    const boolArray: boolean[] = [true, true, true];
    let accessControlManager: Contract;
    let comptrollerStableCoinSigner: Signer;
    let comptrollerDefiSigner: Signer;
    let comptrollerGameFiSigner: Signer;
    let comptrollerLiquidStakedBnbSigner: Signer;
    let comptrollerTronSigner: Signer;
    let normalTimeLockSigner: Signer;
    let fastTrackTimeLockSigner: Signer;
    let criticalTimeLockSigner: Signer;
    let timeLockSignersArray: Signer[];

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
