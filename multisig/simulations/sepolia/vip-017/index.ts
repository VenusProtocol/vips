import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { initMainnetUser } from "../../../../src/utils";
import { NORMAL_TIMELOCK, forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "../../../../src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import vip017, {
  COMPTROLLER_BEACON,
  COMPTROLLER_CORE_ADDRESS,
  MOCK_WETH,
  NATIVE_TOKEN_GATEWAY,
  NEW_COMPTROLLER_IMPLEMENTATION,
  NEW_VTOKEN_IMPLEMENTATION,
  ORIGINAL_POOL_REGISTRY_IMP,
  POOL_REGISTRY,
  PROXY_ADMIN,
  VTOKEN_BEACON,
  VWETH_CORE,
  WETH,
} from "../../../proposals/sepolia/vip-017/index";
import BEACON_ABI from "./abi/Beacon.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import NATIVE_TOKEN_GATEWAY_ABI from "./abi/NativeTokenGateway.json";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import VTOKEN_ABI from "./abi/VToken.json";

const OLD_COMPTROLLER_IMPLEMENTATION = "0x0bA3dBDb53a367e9132587c7Fc985153A2E25f08";
const OLD_VTOKEN_IMPLEMENTATION = "0xa4Fd54cACdA379FB7CaA783B83Cc846f8ac0Faa6";

const VCRV_USD_CORE = "0xA09cFAd2e138fe6d8FF62df803892cbCb79ED082";
const CRV_USD = "0x36421d873abCa3E2bE6BB3c819C0CF26374F63b6";

const WST_ETH = "0x9b87Ea90FDb55e1A0f17FBEdDcF7EB0ac4d50493";
const VTREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";

const USER_1 = "0x6f057A858171e187124ddEDF034dAc63De5dE5dB";
const USER_2 = "0x058F25CDeA0B2a66DbDAA51e39f75bd964a0dBe7";
const WST_ETH_HOLDER = "0x0a95088403229331FeF1EB26a11F9d6C8E73f23D";

forking(5367150, () => {
  const provider = ethers.provider;
  let user1: Signer;
  let user2: Signer;
  let wstEthHolder: Signer;
  let comptroller: Contract;
  let vWeth: Contract;
  let vcrvUsd: Contract;
  let crvUsd: Contract;
  let weth: Contract;
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
    user1 = await initMainnetUser(USER_1, parseUnits("2"));
    user2 = await initMainnetUser(USER_2, parseUnits("2"));
    wstEthHolder = await initMainnetUser(WST_ETH_HOLDER, parseUnits("2"));

    nativeTokenGateway = new ethers.Contract(NATIVE_TOKEN_GATEWAY, NATIVE_TOKEN_GATEWAY_ABI, provider);

    comptrollerBeacon = new ethers.Contract(COMPTROLLER_BEACON, BEACON_ABI, provider);
    comptroller = new ethers.Contract(COMPTROLLER_CORE_ADDRESS, COMPTROLLER_ABI, provider);

    vtokenBeacon = new ethers.Contract(VTOKEN_BEACON, BEACON_ABI, provider);
    vWeth = new ethers.Contract(VWETH_CORE, VTOKEN_ABI, provider);
    vcrvUsd = new ethers.Contract(VCRV_USD_CORE, VTOKEN_ABI, provider);

    crvUsd = new ethers.Contract(CRV_USD, ERC20_ABI, provider);
    weth = new ethers.Contract(WETH, ERC20_ABI, provider);
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

    it("getVTokenForAsset should return vweth address for mock_weth and zero_address for weth ", async () => {
      expect(await poolRegistry.getVTokenForAsset(COMPTROLLER_CORE_ADDRESS, MOCK_WETH)).to.be.equal(VWETH_CORE);
      expect(await poolRegistry.getVTokenForAsset(COMPTROLLER_CORE_ADDRESS, WETH)).to.be.equal(
        ethers.constants.AddressZero,
      );
    });

    it("getPoolsSupportedByAsset should return two pool address for mock_weth and zero pool address for weth", async () => {
      const poolsForMockWeth = await poolRegistry.getPoolsSupportedByAsset(MOCK_WETH);
      expect(poolsForMockWeth.length).to.be.equal(2);

      const poolsForWeth = await poolRegistry.getPoolsSupportedByAsset(WETH);
      expect(poolsForWeth.length).to.be.equal(0);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip017());
    });

    it("pool registry should have original implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(POOL_REGISTRY)).to.equal(ORIGINAL_POOL_REGISTRY_IMP);
    });

    it("getVTokenForAsset should return vweth address for weth and zero_address for mock_weth ", async () => {
      expect(await poolRegistry.getVTokenForAsset(COMPTROLLER_CORE_ADDRESS, WETH)).to.be.equal(VWETH_CORE);
      expect(await poolRegistry.getVTokenForAsset(COMPTROLLER_CORE_ADDRESS, MOCK_WETH)).to.be.equal(
        ethers.constants.AddressZero,
      );
    });

    it("getPoolsSupportedByAsset should return two pool address for weth and zero pool address for weth", async () => {
      const poolsForWeth = await poolRegistry.getPoolsSupportedByAsset(WETH);
      expect(poolsForWeth.length).to.be.equal(1);

      const poolsForMockWeth = await poolRegistry.getPoolsSupportedByAsset(MOCK_WETH);
      expect(poolsForMockWeth.length).to.be.equal(1);
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

    describe("onBehalfTests", () => {
      beforeEach(async () => {
        await comptroller.connect(user1).enterMarkets([VCRV_USD_CORE, VWETH_CORE]);
        await comptroller.connect(user1).updateDelegate(USER_2, false);

        await crvUsd.connect(user1).approve(vcrvUsd.address, parseUnits("1", 18));
        await vcrvUsd.connect(user1).mint(parseUnits("1", 18));
      });

      describe("borrowBehalf", () => {
        it("borrowBehalf should revert when approval is not given", async () => {
          await expect(vWeth.connect(user2).borrowBehalf(USER_1, parseUnits("1", 8))).to.be.revertedWithCustomError(
            vWeth,
            "DelegateNotApproved",
          );
        });

        it("borrowBehalf should work properly", async () => {
          await comptroller.connect(user1).updateDelegate(USER_2, true);

          const user2WethBalancePrevious = await weth.balanceOf(USER_2);
          await vWeth.connect(user2).borrowBehalf(USER_1, parseUnits("1", 8));
          const user2WethBalanceNew = await weth.balanceOf(USER_2);

          expect(user2WethBalanceNew).to.greaterThan(user2WethBalancePrevious);
        });
      });

      describe("redeemBehalf", () => {
        it("redeemBehalf should revert when approval is not given", async () => {
          await expect(vcrvUsd.connect(user2).redeemBehalf(USER_1, parseUnits("1", 6))).to.be.revertedWithCustomError(
            vWeth,
            "DelegateNotApproved",
          );
        });

        it("redeemBehalf should work properly", async () => {
          await comptroller.connect(user1).updateDelegate(USER_2, true);

          const user2BnbxBalancePrevious = await crvUsd.balanceOf(USER_2);
          await vcrvUsd.connect(user2).redeemBehalf(USER_1, parseUnits("1", 8));
          const user2BnbxBalanceNew = await crvUsd.balanceOf(USER_2);

          expect(user2BnbxBalanceNew).to.greaterThan(user2BnbxBalancePrevious);
        });
      });

      describe("redeemUnderlyingBehalf", () => {
        it("redeemUnderlyingBehalf should revert when approval is not given", async () => {
          await expect(
            vcrvUsd.connect(user2).redeemUnderlyingBehalf(USER_1, parseUnits("1", 6)),
          ).to.be.revertedWithCustomError(vWeth, "DelegateNotApproved");
        });

        it("redeemUnderlyingBehalf should work properly", async () => {
          await comptroller.connect(user1).updateDelegate(USER_2, true);

          const user2BnbxBalancePrevious = await crvUsd.balanceOf(USER_2);
          await vcrvUsd.connect(user2).redeemUnderlyingBehalf(USER_1, parseUnits("1", 18));
          const user2BnbxBalanceNew = await crvUsd.balanceOf(USER_2);

          expect(user2BnbxBalanceNew).to.greaterThan(user2BnbxBalancePrevious);
        });
      });
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
