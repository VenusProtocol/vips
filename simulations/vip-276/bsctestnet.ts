import { TransactionResponse } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import { checkCorePoolComptroller } from "../../src/vip-framework/checks/checkCorePoolComptroller";
import { checkIsolatedPoolsComptrollers } from "../../src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { performVTokenBasicAndBehalfActions } from "../../src/vtokenUpgradesHelper";
import {
  COMPTROLLER_BEACON,
  CORE_MARKETS,
  NATIVE_TOKEN_GATEWAY,
  NEW_COMPTROLLER_IMPLEMENTATION,
  NEW_VBEP20_DELEGATE_IMPL,
  NEW_VTOKEN_IMPLEMENTATION,
  UNITROLLER,
  VTOKEN_BEACON,
  vip276,
} from "../../vips/vip-276/bsctestnet";
import BEACON_ABI from "./abi/Beacon.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import UNITROLLER_ABI from "./abi/CorePoolComptroller.json";
import DIAMOND_ABI from "./abi/Diamond.json";
import MOCK_TOKEN_ABI from "./abi/MockToken.json";
import NATIVE_TOKEN_GATEWAY_ABI from "./abi/NativeTokenGateway.json";
import VBEP_20_DELEGATE_ABI from "./abi/VBep20Delegate.json";
import VEBEP_20_DELEGATOR_ABI from "./abi/VBep20Delegator.json";
import VTOKEN_ABI from "./abi/VToken.json";

const OLD_COMPTROLLER_IMPLEMENTATION = "0x329Bc34E6A46243d21955A4369cD66bdD52E6C22";
const OLD_VTOKEN_IMPLEMENTATION = "0xe21251bc79ee0abeba71faabdc2ad36762a0b82f";

const VWBNB_LIQUID_STAKED_BNB = "0x231dED0Dfc99634e52EE1a1329586bc970d773b3";
const VBNBX_LIQUID_STAKED_BNB = "0x644A149853E5507AdF3e682218b8AC86cdD62951";
const POOL_LIQUID_STAKED_BNB = "0x596B11acAACF03217287939f88d63b51d3771704";

const BNBX = "0x327d6E6FAC0228070884e913263CFF9eFed4a2C8";
const WBNB = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";

const USER_1 = "0x03862dFa5D0be8F64509C001cb8C6188194469DF";
const USER_2 = "0xb07A7f0A252bc7a3a26aa3c3C9D9c38aD8a6f02F";

const TOKEN_HOLDER = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";
const WBNB_HOLDER = "0xbABAd3C68E95BD76FaFd53e17A8cbdBcad31134d";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";

const OLD_MARKET_FACET = "0x1B9806d9d2925e8Cd318E268e562eeb7e02C6E00";
const NEW_MARKET_FACET = "0xbcA3d5E7a66D97E0415662c2394Ed2605944b614";

const provider = ethers.provider;
let user1: SignerWithAddress;
let user2: SignerWithAddress;
let impersonatedTimelock: SignerWithAddress;
let comptroller: Contract;
let unitroller: Contract;
let vWbnb: Contract;
let vBnbx: Contract;
let bnbx: Contract;
let wbnb: Contract;
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
let marketFacetSelectors: string[];

forking(38305470, () => {
  before(async () => {
    user1 = await initMainnetUser(USER_1, parseUnits("2"));
    user2 = await initMainnetUser(USER_2, parseUnits("2"));
    impersonatedTimelock = await initMainnetUser(NORMAL_TIMELOCK, parseUnits("2"));

    nativeTokenGateway = new ethers.Contract(NATIVE_TOKEN_GATEWAY, NATIVE_TOKEN_GATEWAY_ABI, provider);

    comptrollerBeacon = new ethers.Contract(COMPTROLLER_BEACON, BEACON_ABI, provider);
    comptroller = new ethers.Contract(POOL_LIQUID_STAKED_BNB, COMPTROLLER_ABI, provider);
    unitroller = new ethers.Contract(UNITROLLER, UNITROLLER_ABI, provider);

    vtokenBeacon = new ethers.Contract(VTOKEN_BEACON, BEACON_ABI, provider);
    vWbnb = new ethers.Contract(VWBNB_LIQUID_STAKED_BNB, VTOKEN_ABI, provider);
    vBnbx = new ethers.Contract(VBNBX_LIQUID_STAKED_BNB, VTOKEN_ABI, provider);

    bnbx = new ethers.Contract(BNBX, MOCK_TOKEN_ABI, provider);
    wbnb = new ethers.Contract(WBNB, MOCK_TOKEN_ABI, provider);

    marketFacetSelectors = await unitroller.facetFunctionSelectors(OLD_MARKET_FACET);

    accessControlManager = await comptroller.accessControlManager();
    closeFactorMantissa = await comptroller.closeFactorMantissa();
    allMarkets = await comptroller.getAllMarkets();
    rewardsDistributors = await comptroller.getRewardDistributors();
    marketListed = await comptroller.isMarketListed(VBNBX_LIQUID_STAKED_BNB);
    liquidationIncentiveMantissa = await comptroller.liquidationIncentiveMantissa();
    maxLoopsLimit = await comptroller.maxLoopsLimit();
    minLiquidatableCollateral = await comptroller.minLiquidatableCollateral();
    oracle = await comptroller.oracle();
    owner = await comptroller.owner();
    poolRegistry = await comptroller.poolRegistry();
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
  });

  testVip("VIP-Gateway", vip276(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [BEACON_ABI], ["Upgraded"], [2]);
      await expectEvents(txResponse, [NATIVE_TOKEN_GATEWAY_ABI], ["OwnershipTransferred"], [1]);
      await expectEvents(txResponse, [DIAMOND_ABI], ["DiamondCut"], [1]);
      await expectEvents(txResponse, [VEBEP_20_DELEGATOR_ABI], ["NewImplementation"], [23]);
      await expectEvents(
        txResponse,
        [VBEP_20_DELEGATE_ABI],
        ["NewProtocolShareReserve", "NewAccessControlManager", "NewReduceReservesBlockDelta"],
        [3, 3, 3],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("market facet function selectors should be replaced with new facet address", async () => {
      expect(await unitroller.facetFunctionSelectors(NEW_MARKET_FACET)).to.deep.equal(marketFacetSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_MARKET_FACET)).to.deep.equal([]);
    });

    it("unitroller should contain the new facet address", async () => {
      expect(await unitroller.facetAddresses()).to.include(NEW_MARKET_FACET);
      expect(await unitroller.facetAddresses()).to.not.include(OLD_MARKET_FACET);
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
      expect(await comptroller.isMarketListed(VBNBX_LIQUID_STAKED_BNB)).to.equal(marketListed);
      expect(await comptroller.liquidationIncentiveMantissa()).to.equal(liquidationIncentiveMantissa);
      expect(await comptroller.maxLoopsLimit()).to.equal(maxLoopsLimit);
      expect(await comptroller.minLiquidatableCollateral()).to.equal(minLiquidatableCollateral);
      expect(await comptroller.oracle()).to.equal(oracle);
      expect(await comptroller.owner()).to.equal(owner);
      expect(await comptroller.poolRegistry()).to.equal(poolRegistry);
      expect(await comptroller.prime()).to.equal(prime);
      expect(await comptroller.approvedDelegates(USER_1, USER_2)).to.equal(false);
    });

    describe("onBehalfTests", () => {
      before(async () => {
        // sending some WBNB to the vWBNB so that reduceReserves does not fail on vWBNB
        const wbnbHolder = await initMainnetUser(WBNB_HOLDER, parseUnits("1", 18));
        await wbnb.connect(wbnbHolder).transfer(vWbnb.address, parseUnits("5", 17));
      });

      beforeEach(async () => {
        await comptroller.connect(user1).enterMarkets([VBNBX_LIQUID_STAKED_BNB, VWBNB_LIQUID_STAKED_BNB]);
        if (await comptroller.approvedDelegates(user1.address, USER_2)) {
          await comptroller.connect(user1).updateDelegate(USER_2, false);
        }

        await bnbx.connect(user1).approve(vBnbx.address, parseUnits("1", 18));
        await vBnbx.connect(user1).mint(parseUnits("1", 18));
      });

      describe("borrowBehalf", () => {
        it("borrowBehalf should revert when approval is not given", async () => {
          await expect(vWbnb.connect(user2).borrowBehalf(USER_1, parseUnits("1", 8))).to.be.revertedWithCustomError(
            vWbnb,
            "DelegateNotApproved",
          );
        });

        it("borrowBehalf should work properly", async () => {
          await comptroller.connect(user1).updateDelegate(USER_2, true);

          const user2WbnbBalancePrevious = await wbnb.balanceOf(USER_2);
          await vWbnb.connect(user2).borrowBehalf(USER_1, parseUnits("1", 8));
          const user2WbnbBalanceNew = await wbnb.balanceOf(USER_2);

          expect(user2WbnbBalanceNew).to.greaterThan(user2WbnbBalancePrevious);
        });
      });

      describe("redeemBehalf", () => {
        it("redeemBehalf should revert when approval is not given", async () => {
          await expect(vBnbx.connect(user2).redeemBehalf(USER_1, parseUnits("1", 6))).to.be.revertedWithCustomError(
            vWbnb,
            "DelegateNotApproved",
          );
        });

        it("redeemBehalf should work properly", async () => {
          await comptroller.connect(user1).updateDelegate(USER_2, true);

          const user2BnbxBalancePrevious = await bnbx.balanceOf(USER_2);
          await vBnbx.connect(user2).redeemBehalf(USER_1, parseUnits("1", 8));
          const user2BnbxBalanceNew = await bnbx.balanceOf(USER_2);

          expect(user2BnbxBalanceNew).to.greaterThan(user2BnbxBalancePrevious);
        });
      });

      describe("redeemUnderlyingBehalf", () => {
        it("redeemUnderlyingBehalf should revert when approval is not given", async () => {
          await expect(
            vBnbx.connect(user2).redeemUnderlyingBehalf(USER_1, parseUnits("1", 6)),
          ).to.be.revertedWithCustomError(vWbnb, "DelegateNotApproved");
        });

        it("redeemUnderlyingBehalf should work properly", async () => {
          await comptroller.connect(user1).updateDelegate(USER_2, true);

          const user2BnbxBalancePrevious = await bnbx.balanceOf(USER_2);
          await vBnbx.connect(user2).redeemUnderlyingBehalf(USER_1, parseUnits("1", 18));
          const user2BnbxBalanceNew = await bnbx.balanceOf(USER_2);

          expect(user2BnbxBalanceNew).to.greaterThan(user2BnbxBalancePrevious);
        });
      });
    });

    describe("generic tests", async () => {
      checkCorePoolComptroller();
      checkIsolatedPoolsComptrollers();
    });
  });
});

// core pool vToken tests
forking(38305470, () => {
  let vToken: Contract;
  let underlying: Contract;
  let user: SignerWithAddress;
  const mintAmount = parseUnits("200", 18);
  const borrowAmount = parseUnits("50", 18);
  const repayAmount = parseUnits("50", 18);
  const redeemAmount = parseUnits("50", 18);
  const actions = [0, 1, 2, 3, 7]; // Mint, Redeem, Borrow, Repay, EnterMarket

  describe("VToken Tests", () => {
    // these are markets which do not contain `allocateTo` or `faucet` function in their underlying, so treating them as genuine markets i.e. (mock = false)
    const markets = ["vBTC", "vETH", "vLTC", "vXRP", "vXVS"];

    before(async () => {
      impersonatedTimelock = await initMainnetUser(NORMAL_TIMELOCK, parseUnits("2"));
      await pretendExecutingVip(vip276());
    });

    for (const market of CORE_MARKETS) {
      it(`Generic tests for mint, borrow, redeem, repay for ${market.name} should work`, async () => {
        user = await initMainnetUser(TOKEN_HOLDER, ethers.utils.parseEther("5"));
        user1 = await initMainnetUser(USER_1, ethers.utils.parseEther("5"));

        vToken = new ethers.Contract(market.address, VBEP_20_DELEGATE_ABI, provider);

        underlying = new ethers.Contract(await vToken.underlying(), MOCK_TOKEN_ABI, provider);
        await unitroller.connect(impersonatedTimelock)._setMarketBorrowCaps([market.address], [parseUnits("2", 48)]);
        await unitroller.connect(impersonatedTimelock)._setMarketSupplyCaps([market.address], [parseUnits("2", 48)]);
        await unitroller.connect(impersonatedTimelock)._setCollateralFactor(market.address, parseUnits("0.89", 18));
        await unitroller.connect(impersonatedTimelock)._setActionsPaused([market.address], actions, false);

        let isMock = true;
        if (markets.includes(market.name)) isMock = false;
        await performVTokenBasicAndBehalfActions(
          market.address,
          user,
          user1,
          mintAmount,
          borrowAmount,
          repayAmount,
          redeemAmount,
          vToken,
          underlying,
          unitroller,
          isMock,
        );
        expect(await vToken.implementation()).equals(NEW_VBEP20_DELEGATE_IMPL);
      });
    }
  });
});
