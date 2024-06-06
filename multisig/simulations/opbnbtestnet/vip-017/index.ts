import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { NORMAL_TIMELOCK, forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "../../../../src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import vip017, {
  COMPTROLLER_BEACON,
  COMPTROLLER_CORE,
  MOCK_WBNB,
  NATIVE_TOKEN_GATEWAY,
  NEW_COMPTROLLER_IMPLEMENTATION,
  NEW_VTOKEN_IMPLEMENTATION,
  ORIGINAL_POOL_REGISTRY_IMP,
  POOL_REGISTRY,
  PROXY_ADMIN,
  VTOKEN_BEACON,
  WBNB,
} from "../../../proposals/opbnbtestnet/vip-017/index";
import BEACON_ABI from "./abi/Beacon.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import NATIVE_TOKEN_GATEWAY_ABI from "./abi/NativeTokenGateway.json";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";

const OLD_COMPTROLLER_IMPLEMENTATION = "0xA693FbB4C5F479142e4Fb253B06FC113E5EB1536";
const OLD_VTOKEN_IMPLEMENTATION = "0xd1fC255c701a42b8eDe64eE92049444FF23626A0";

const VWBNB_CORE = "0xD36a31AcD3d901AeD998da6E24e848798378474e";
const CORE_POOL = "0x2FCABb31E57F010D623D8d68e1E18Aed11d5A388";

const USER_1 = "0x9026A229b535ecF0162Dfe48fDeb3c75f7b2A7AE";
const USER_2 = "0x7041bB74553fD011268Da863496dA3CBE4Ab8787";

forking(22849558, async () => {
  const provider = ethers.provider;
  let comptroller: Contract;
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
    nativeTokenGateway = new ethers.Contract(NATIVE_TOKEN_GATEWAY, NATIVE_TOKEN_GATEWAY_ABI, provider);

    comptrollerBeacon = new ethers.Contract(COMPTROLLER_BEACON, BEACON_ABI, provider);
    comptroller = new ethers.Contract(CORE_POOL, COMPTROLLER_ABI, provider);

    vtokenBeacon = new ethers.Contract(VTOKEN_BEACON, BEACON_ABI, provider);

    poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, provider);
    proxyAdmin = new ethers.Contract(PROXY_ADMIN, PROXY_ADMIN_ABI, provider);

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
    poolRegistryAddress = await comptroller.poolRegistry();
    prime = await comptroller.prime();
  });

  describe("Pre-VIP behaviour", async () => {
    it("comptroller should have old implementations", async () => {
      expect((await comptrollerBeacon.implementation()).toLowerCase()).to.equal(
        OLD_COMPTROLLER_IMPLEMENTATION.toLowerCase(),
      );
    });

    it("vToken should have old implementations", async () => {
      expect((await vtokenBeacon.implementation()).toLowerCase()).to.equal(OLD_VTOKEN_IMPLEMENTATION.toLowerCase());
    });

    it("pool registry should have original implementation", async () => {
      expect((await proxyAdmin.getProxyImplementation(POOL_REGISTRY)).toLowerCase()).to.equal(
        ORIGINAL_POOL_REGISTRY_IMP.toLowerCase(),
      );
    });

    it("getVTokenForAsset should return vwbnb core address for mock_wbnb and zero_address for wbnb ", async () => {
      expect(await poolRegistry.getVTokenForAsset(COMPTROLLER_CORE, MOCK_WBNB)).to.be.equal(VWBNB_CORE);
      expect(await poolRegistry.getVTokenForAsset(COMPTROLLER_CORE, WBNB)).to.be.equal(ethers.constants.AddressZero);
    });

    it("getPoolsSupportedByAsset should return one pool address for mock_wbnb and zero pool address for wbnb", async () => {
      const poolsForMockWeth = await poolRegistry.getPoolsSupportedByAsset(MOCK_WBNB);
      expect(poolsForMockWeth.length).to.be.equal(1);

      const poolsForWeth = await poolRegistry.getPoolsSupportedByAsset(WBNB);
      expect(poolsForWeth.length).to.be.equal(0);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip017());
    });

    it("pool registry should have original implementation", async () => {
      expect((await proxyAdmin.getProxyImplementation(POOL_REGISTRY)).toLowerCase()).to.equal(
        ORIGINAL_POOL_REGISTRY_IMP.toLowerCase(),
      );
    });

    it("getVTokenForAsset should return vwbnb core address for wbnb and zero_address for mock_wbnb ", async () => {
      expect(await poolRegistry.getVTokenForAsset(COMPTROLLER_CORE, WBNB)).to.be.equal(VWBNB_CORE);
      expect(await poolRegistry.getVTokenForAsset(COMPTROLLER_CORE, MOCK_WBNB)).to.be.equal(
        ethers.constants.AddressZero,
      );
    });

    it("getPoolsSupportedByAsset should return one pool address for wbnb and zero pool address for mock_wbnb", async () => {
      const poolsForWeth = await poolRegistry.getPoolsSupportedByAsset(WBNB);
      expect(poolsForWeth.length).to.be.equal(1);

      const poolsForMockWeth = await poolRegistry.getPoolsSupportedByAsset(MOCK_WBNB);
      expect(poolsForMockWeth.length).to.be.equal(0);
    });

    it("comptroller should have new implementations", async () => {
      expect((await comptrollerBeacon.implementation()).toLowerCase()).to.equal(
        NEW_COMPTROLLER_IMPLEMENTATION.toLowerCase(),
      );
    });

    it("vToken should have new implementations", async () => {
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
      expect(await comptroller.poolRegistry()).to.equal(poolRegistryAddress);
      expect(await comptroller.prime()).to.equal(prime);
      expect(await comptroller.approvedDelegates(USER_1, USER_2)).to.equal(false);
    });

    describe("generic tests", () => {
      checkIsolatedPoolsComptrollers();
    });
  });
});
