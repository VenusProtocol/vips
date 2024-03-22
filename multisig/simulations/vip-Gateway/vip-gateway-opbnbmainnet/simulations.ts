import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { NORMAL_TIMELOCK, forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "../../../../src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import {
  COMPTROLLER_BEACON,
  NATIVE_TOKEN_GATEWAY,
  NEW_COMPTROLLER_IMPLEMENTATION,
  NEW_VTOKEN_IMPLEMENTATION,
  VTOKEN_BEACON,
  vipGateway,
} from "../../../proposals/vip-Gateway/vip-gateway-opbnbmainnet";
import BEACON_ABI from "../abi/Beacon.json";
import COMPTROLLER_ABI from "../abi/Comptroller.json";
import NATIVE_TOKEN_GATEWAY_ABI from "../abi/NativeTokenGateway.json";

const OLD_COMPTROLLER_IMPLEMENTATION = "0x557C69aDf4bB12305F00F62f1Ab71CAe9BFa3D46";
const OLD_VTOKEN_IMPLEMENTATION = "0x227c4D4176604908755be2B513A2b7bcA6f54a1F";

const VWBNB_CORE = "0x53d11cB8A0e5320Cd7229C3acc80d1A0707F2672";
const CORE_POOL = "0xD6e3E2A1d8d95caE355D15b3b9f8E5c2511874dd";

const USER_1 = "0x9026A229b535ecF0162Dfe48fDeb3c75f7b2A7AE";
const USER_2 = "0x7041bB74553fD011268Da863496dA3CBE4Ab8787";

forking(18647639, () => {
  const provider = ethers.provider;
  let comptroller: Contract;
  let comptrollerBeacon: Contract;
  let vtokenBeacon: Contract;
  let nativeTokenGateway: Contract;

  let accessControlManager: string;
  let closeFactorMantissa: BigNumber;
  let allMarkets: string[];
  let rewardsDistributors: string[];
  let marketListed: boolean;
  let liquidationIncentiveMantissa: BigNumber;
  let maxLoopsLimit: BigNumber;
  let minLiquidatableCollateral: BigNumber;
  let oracle: string;
  let owner: string;
  let poolRegistry: string;
  let prime: string;

  before(async () => {
    nativeTokenGateway = new ethers.Contract(NATIVE_TOKEN_GATEWAY, NATIVE_TOKEN_GATEWAY_ABI, provider);

    comptrollerBeacon = new ethers.Contract(COMPTROLLER_BEACON, BEACON_ABI, provider);
    comptroller = new ethers.Contract(CORE_POOL, COMPTROLLER_ABI, provider);

    vtokenBeacon = new ethers.Contract(VTOKEN_BEACON, BEACON_ABI, provider);

    accessControlManager = await comptroller.accessControlManager();
    closeFactorMantissa = await comptroller.closeFactorMantissa();
    allMarkets = await comptroller.getAllMarkets();
    rewardsDistributors = await comptroller.getRewardDistributors();
    marketListed = await comptroller.isMarketListed(VWBNB_CORE);
    liquidationIncentiveMantissa = await comptroller.liquidationIncentiveMantissa();
    maxLoopsLimit = await comptroller.maxLoopsLimit();
    minLiquidatableCollateral = await comptroller.minLiquidatableCollateral();
    oracle = await comptroller.oracle();
    owner = await comptroller.owner();
    poolRegistry = await comptroller.poolRegistry();
    prime = await comptroller.prime();
  });

  describe("Pre-VIP behavior", async () => {
    it("comptroller should have old implementation", async () => {
      expect((await comptrollerBeacon.implementation()).toLowerCase()).to.equal(
        OLD_COMPTROLLER_IMPLEMENTATION.toLowerCase(),
      );
    });

    it("vToken should have old implementation", async () => {
      expect((await vtokenBeacon.implementation()).toLowerCase()).to.equal(OLD_VTOKEN_IMPLEMENTATION.toLowerCase());
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vipGateway());
    });

    it("comptroller should have new implementation", async () => {
      expect((await comptrollerBeacon.implementation()).toLowerCase()).to.equal(
        NEW_COMPTROLLER_IMPLEMENTATION.toLowerCase(),
      );
    });

    it("vToken should have new implementation", async () => {
      expect((await vtokenBeacon.implementation()).toLowerCase()).to.equal(NEW_VTOKEN_IMPLEMENTATION.toLowerCase());
    });

    it("timelock should be the owner of NativeTokenGateway contract", async () => {
      expect(await nativeTokenGateway.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("storage layout of comptroller should be consistent", async () => {
      expect(await comptroller.accessControlManager()).to.equal(accessControlManager);
      expect(await comptroller.closeFactorMantissa()).to.equal(closeFactorMantissa);
      expect(await comptroller.getAllMarkets()).to.deep.equal(allMarkets);
      expect(await comptroller.getRewardDistributors()).to.deep.equal(rewardsDistributors);
      expect(await comptroller.isMarketListed(VWBNB_CORE)).to.equal(marketListed);
      expect(await comptroller.liquidationIncentiveMantissa()).to.equal(liquidationIncentiveMantissa);
      expect(await comptroller.maxLoopsLimit()).to.equal(maxLoopsLimit);
      expect(await comptroller.minLiquidatableCollateral()).to.equal(minLiquidatableCollateral);
      expect(await comptroller.oracle()).to.equal(oracle);
      expect(await comptroller.owner()).to.equal(owner);
      expect(await comptroller.poolRegistry()).to.equal(poolRegistry);
      expect(await comptroller.prime()).to.equal(prime);
      expect(await comptroller.approvedDelegates(USER_1, USER_2)).to.equal(false);
    });

    describe("generic tests", () => {
      checkIsolatedPoolsComptrollers();
    });
  });
});
