import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { NORMAL_TIMELOCK, forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "../../../../src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import vip008, {
  COMPTROLLER_BEACON,
  NATIVE_TOKEN_GATEWAY_VWETH_CORE,
  NATIVE_TOKEN_GATEWAY_VWETH_LST,
  NEW_COMPTROLLER_IMPLEMENTATION,
  NEW_VTOKEN_IMPLEMENTATION,
  VTOKEN_BEACON,
} from "../../../proposals/ethereum/vip-008";
import BEACON_ABI from "./abi/Beacon.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import NATIVE_TOKEN_GATEWAY_ABI from "./abi/NativeTokenGateway.json";

const OLD_COMPTROLLER_IMPLEMENTATION = "0x4e9d41D91Abb8590Dba0dcb37C682D312a245fC4";
const OLD_VTOKEN_IMPLEMENTATION = "0x48Df4806e6734B5881f59AE7237988D3dA50891e";

const VCRV_USD_CORE = "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202";
const CORE_POOL = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";

const USER_1 = "0x9026A229b535ecF0162Dfe48fDeb3c75f7b2A7AE";
const USER_2 = "0x7041bB74553fD011268Da863496dA3CBE4Ab8787";

forking(19447800, () => {
  const provider = ethers.provider;
  let comptroller: Contract;
  let comptrollerBeacon: Contract;
  let vtokenBeacon: Contract;
  let nativeTokenGatewayCore: Contract;
  let nativeTokenGatewayLst: Contract;

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
    nativeTokenGatewayCore = new ethers.Contract(NATIVE_TOKEN_GATEWAY_VWETH_CORE, NATIVE_TOKEN_GATEWAY_ABI, provider);
    nativeTokenGatewayLst = new ethers.Contract(NATIVE_TOKEN_GATEWAY_VWETH_LST, NATIVE_TOKEN_GATEWAY_ABI, provider);

    comptrollerBeacon = new ethers.Contract(COMPTROLLER_BEACON, BEACON_ABI, provider);
    comptroller = new ethers.Contract(CORE_POOL, COMPTROLLER_ABI, provider);

    vtokenBeacon = new ethers.Contract(VTOKEN_BEACON, BEACON_ABI, provider);

    accessControlManager = await comptroller.accessControlManager();
    closeFactorMantissa = await comptroller.closeFactorMantissa();
    allMarkets = await comptroller.getAllMarkets();
    rewardsDistributors = await comptroller.getRewardDistributors();
    marketListed = await comptroller.isMarketListed(VCRV_USD_CORE);
    liquidationIncentiveMantissa = await comptroller.liquidationIncentiveMantissa();
    maxLoopsLimit = await comptroller.maxLoopsLimit();
    minLiquidatableCollateral = await comptroller.minLiquidatableCollateral();
    oracle = await comptroller.oracle();
    owner = await comptroller.owner();
    poolRegistry = await comptroller.poolRegistry();
    prime = await comptroller.prime();
  });

  describe("Pre-VIP behaviour", async () => {
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
      await pretendExecutingVip(vip008());
    });

    it("comptroller should have new implementation", async () => {
      expect((await comptrollerBeacon.implementation()).toLowerCase()).to.equal(
        NEW_COMPTROLLER_IMPLEMENTATION.toLowerCase(),
      );
    });

    it("vToken should have new implementation", async () => {
      expect((await vtokenBeacon.implementation()).toLowerCase()).to.equal(NEW_VTOKEN_IMPLEMENTATION.toLowerCase());
    });

    it("timelock should be the owner of NativeTokenGateway contract for core pool market", async () => {
      expect(await nativeTokenGatewayCore.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("timelock should be the owner of NativeTokenGateway contract for lst pool market", async () => {
      expect(await nativeTokenGatewayLst.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("storage layout of comptroller should be consistent", async () => {
      expect(await comptroller.accessControlManager()).to.equal(accessControlManager);
      expect(await comptroller.closeFactorMantissa()).to.equal(closeFactorMantissa);
      expect(await comptroller.getAllMarkets()).to.deep.equal(allMarkets);
      expect(await comptroller.getRewardDistributors()).to.deep.equal(rewardsDistributors);
      expect(await comptroller.isMarketListed(VCRV_USD_CORE)).to.equal(marketListed);
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
