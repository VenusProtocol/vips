import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../src/utils";
import { NORMAL_TIMELOCK, forking, testVip } from "../../src/vip-framework";
import {
  COMPTROLLER_BEACON,
  NATIVE_TOKEN_GATEWAY,
  NEW_COMPTROLLER_IMPLEMENTATION,
  NEW_VTOKEN_IMPLEMENTATION,
  VTOKEN_BEACON,
  vipGateway,
} from "../../vips/vip-Gateway/bsctestnet";
import BEACON_ABI from "./abi/Beacon.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import NATIVE_TOKEN_GATEWAY_ABI from "./abi/NativeTokenGateway.json";
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

forking(37389851, () => {
  const provider = ethers.provider;
  let user1: Signer;
  let user2: Signer;
  let comptroller: ethers.Contract;
  let vWbnb: ethers.Contract;
  let vBnbx: ethers.Contract;
  let bnbx: ethers.Contract;
  let wbnb: ethers.Contract;
  let comptrollerBeacon: ethers.Contract;
  let vtokenBeacon: ethers.Contract;
  let nativeTokenGateway: ethers.Contract;

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
    user1 = await initMainnetUser(USER_1, parseUnits("2"));
    user2 = await initMainnetUser(USER_2, parseUnits("2"));

    nativeTokenGateway = new ethers.Contract(NATIVE_TOKEN_GATEWAY, NATIVE_TOKEN_GATEWAY_ABI, provider);

    comptrollerBeacon = new ethers.Contract(COMPTROLLER_BEACON, BEACON_ABI, provider);
    comptroller = new ethers.Contract(POOL_LIQUID_STAKED_BNB, COMPTROLLER_ABI, provider);

    vtokenBeacon = new ethers.Contract(VTOKEN_BEACON, BEACON_ABI, provider);
    vWbnb = new ethers.Contract(VWBNB_LIQUID_STAKED_BNB, VTOKEN_ABI, provider);
    vBnbx = new ethers.Contract(VBNBX_LIQUID_STAKED_BNB, VTOKEN_ABI, provider);

    bnbx = new ethers.Contract(BNBX, ERC20_ABI, provider);
    wbnb = new ethers.Contract(WBNB, ERC20_ABI, provider);

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

  testVip("VIP-Gateway", vipGateway(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [BEACON_ABI], ["Upgraded"], [2]);
      await expectEvents(txResponse, [NATIVE_TOKEN_GATEWAY_ABI], ["OwnershipTransferred"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
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
      beforeEach(async () => {
        await comptroller.connect(user1).enterMarkets([VBNBX_LIQUID_STAKED_BNB, VWBNB_LIQUID_STAKED_BNB]);
        await comptroller.connect(user1).updateDelegate(USER_2, false);

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
  });
});
