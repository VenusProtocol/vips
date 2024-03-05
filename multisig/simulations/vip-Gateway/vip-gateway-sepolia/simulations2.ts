import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { initMainnetUser } from "../../../../src/utils";
import { NORMAL_TIMELOCK, forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "../../../../src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import {
  COMPTROLLER_BEACON,
  COMPTROLLER_LIQUID_STAKED_ETH,
  MOCK_WETH,
  NATIVE_TOKEN_GATEWAY,
  NEW_COMPTROLLER_IMPLEMENTATION,
  NEW_VTOKEN_IMPLEMENTATION,
  ORIGINAL_POOL_REGISTRY_IMP,
  POOL_REGISTRY,
  PROXY_ADMIN,
  VTOKEN_BEACON,
  VWETH_LIQUID_STAKED_ETH,
  WETH,
  vipGateway,
} from "../../../proposals/vip-Gateway/vip-gateway-sepolia2";
import BEACON_ABI from "../abi/Beacon.json";
import COMPTROLLER_ABI from "../abi/Comptroller.json";
import ERC20_ABI from "../abi/ERC20.json";
import NATIVE_TOKEN_GATEWAY_ABI from "../abi/NativeTokenGateway.json";
import POOL_REGISTRY_ABI from "../abi/PoolRegistry.json";
import PROXY_ADMIN_ABI from "../abi/ProxyAdmin.json";

const { sepolia } = NETWORK_ADDRESSES;

const OLD_COMPTROLLER_IMPLEMENTATION = "0xF37e2f9366Db8F26B1fAf16700C6858c09C8E754";
const OLD_VTOKEN_IMPLEMENTATION = "0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE";

const VCRV_USD_CORE = sepolia.VCRVUSD_CORE;

const WST_ETH = "0x9b87Ea90FDb55e1A0f17FBEdDcF7EB0ac4d50493";
const VTREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";

const USER_1 = "0x6f057A858171e187124ddEDF034dAc63De5dE5dB";
const USER_2 = "0x058F25CDeA0B2a66DbDAA51e39f75bd964a0dBe7";
const WST_ETH_HOLDER = "0x0a95088403229331FeF1EB26a11F9d6C8E73f23D";

forking(5415505, () => {
  const provider = ethers.provider;
  let wstEthHolder: Signer;
  let comptroller: Contract;
  let wstEth: Contract;
  let comptrollerBeacon: Contract;
  let vtokenBeacon: Contract;
  let nativeTokenGateway: Contract;
  let poolRegistry: Contract;
  let proxyAdmin: Contract;

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
  let poolRegistryAddress: string;
  let prime: string;

  before(async () => {
    wstEthHolder = await initMainnetUser(WST_ETH_HOLDER, parseUnits("2"));

    nativeTokenGateway = new ethers.Contract(NATIVE_TOKEN_GATEWAY, NATIVE_TOKEN_GATEWAY_ABI, provider);

    comptrollerBeacon = new ethers.Contract(COMPTROLLER_BEACON, BEACON_ABI, provider);
    comptroller = new ethers.Contract(COMPTROLLER_LIQUID_STAKED_ETH, COMPTROLLER_ABI, provider);

    vtokenBeacon = new ethers.Contract(VTOKEN_BEACON, BEACON_ABI, provider);
    wstEth = new ethers.Contract(WST_ETH, ERC20_ABI, provider);

    poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, provider);
    proxyAdmin = new ethers.Contract(PROXY_ADMIN, PROXY_ADMIN_ABI, provider);

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
    poolRegistryAddress = await comptroller.poolRegistry();
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

    it("pool registry should have original implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(POOL_REGISTRY)).to.equal(ORIGINAL_POOL_REGISTRY_IMP);
    });

    it("getVTokenForAsset should return vweth liquid staked eth address for mock_weth and zero_address for weth ", async () => {
      expect(await poolRegistry.getVTokenForAsset(COMPTROLLER_LIQUID_STAKED_ETH, MOCK_WETH)).to.be.equal(
        VWETH_LIQUID_STAKED_ETH,
      );
      expect(await poolRegistry.getVTokenForAsset(COMPTROLLER_LIQUID_STAKED_ETH, WETH)).to.be.equal(
        ethers.constants.AddressZero,
      );
    });

    it("getPoolsSupportedByAsset should return one pool address for mock_weth and one pool address for weth", async () => {
      const poolsForMockWeth = await poolRegistry.getPoolsSupportedByAsset(MOCK_WETH);
      expect(poolsForMockWeth.length).to.be.equal(1);

      const poolsForWeth = await poolRegistry.getPoolsSupportedByAsset(WETH);
      expect(poolsForWeth.length).to.be.equal(1);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vipGateway());
    });

    it("pool registry should have original implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(POOL_REGISTRY)).to.equal(ORIGINAL_POOL_REGISTRY_IMP);
    });

    it("getVTokenForAsset should return vweth liquid staked eth address for weth and zero_address for mock_weth ", async () => {
      expect(await poolRegistry.getVTokenForAsset(COMPTROLLER_LIQUID_STAKED_ETH, WETH)).to.be.equal(
        VWETH_LIQUID_STAKED_ETH,
      );
      expect(await poolRegistry.getVTokenForAsset(COMPTROLLER_LIQUID_STAKED_ETH, MOCK_WETH)).to.be.equal(
        ethers.constants.AddressZero,
      );
    });

    it("getPoolsSupportedByAsset should return two pool address for weth and zero pool address for mock_weth", async () => {
      const poolsForWeth = await poolRegistry.getPoolsSupportedByAsset(WETH);
      expect(poolsForWeth.length).to.be.equal(2);

      const poolsForMockWeth = await poolRegistry.getPoolsSupportedByAsset(MOCK_WETH);
      expect(poolsForMockWeth.length).to.be.equal(0);
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
      expect(await comptroller.isMarketListed(VCRV_USD_CORE)).to.equal(marketListed);
      expect(await comptroller.liquidationIncentiveMantissa()).to.equal(liquidationIncentiveMantissa);
      expect(await comptroller.maxLoopsLimit()).to.equal(maxLoopsLimit);
      expect(await comptroller.minLiquidatableCollateral()).to.equal(minLiquidatableCollateral);
      expect(await comptroller.oracle()).to.equal(oracle);
      expect(await comptroller.owner()).to.equal(owner);
      expect(await comptroller.poolRegistry()).to.equal(poolRegistryAddress);
      expect(await comptroller.prime()).to.equal(prime);
      expect(await comptroller.approvedDelegates(USER_1, USER_2)).to.equal(false);
    });

    describe("generic tests", () => {
      before(async () => {
        // sending some funds to treasury so that it is able to perform actions `checkIsolatedPoolsComptrollers()` function
        await wstEth.connect(wstEthHolder).transfer(VTREASURY, parseUnits("5", 18));
      });

      checkIsolatedPoolsComptrollers();
    });
  });
});
