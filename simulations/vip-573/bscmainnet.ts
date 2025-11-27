import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip573 from "../../vips/vip-573/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import DIAMOND_ABI from "./abi/Diamond.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const OLD_MARKET_FACET = "0x7ec871BA4248CC443a994f2febeDFB96DAe444F1";

const NEW_MARKET_FACET = "0x87FdF72FA2fB29Cb43f03aCa261A8DC2C613a860";

// Function selector for enterMarketBehalf(address,address)
const ENTER_MARKET_BEHALF_SELECTOR = "0xd585c3c6";

// Test accounts
const TEST_USER = "0x14A1c22EF6d2eF6cE33c0b018d8A34D02021e5c8";
const TEST_DELEGATE = "0x9cc6f5f16498fceef4d00a350bd8f8921d304dc9";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";

forking(69618427, async () => {
  const provider = ethers.provider;
  let unitroller: Contract;

  let marketFacetFunctionSelectors: string[];

  before(async () => {
    unitroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, provider);

    // Get current MarketFacet function selectors
    marketFacetFunctionSelectors = await unitroller.facetFunctionSelectors(OLD_MARKET_FACET);
  });

  describe("Pre-VIP behavior", async () => {
    it("MarketFacet should have old implementation", async () => {
      expect(await unitroller.facetFunctionSelectors(OLD_MARKET_FACET)).to.deep.equal(marketFacetFunctionSelectors);
      expect(await unitroller.facetFunctionSelectors(NEW_MARKET_FACET)).to.deep.equal([]);
    });

    it("enterMarketBehalf function should not exist", async () => {
      expect(marketFacetFunctionSelectors).to.not.include(ENTER_MARKET_BEHALF_SELECTOR);
    });

    it("unitroller should contain old MarketFacet address", async () => {
      expect(await unitroller.facetAddresses()).to.include(OLD_MARKET_FACET);
      expect(await unitroller.facetAddresses()).to.not.include(NEW_MARKET_FACET);
    });
  });

  testVip("vip-573", await vip573(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [DIAMOND_ABI], ["DiamondCut"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("MarketFacet function selectors should be updated for new facet address", async () => {
      const newMarketFacetFunctionSelectors = [ENTER_MARKET_BEHALF_SELECTOR];

      const expectSelectors = [...marketFacetFunctionSelectors, ...newMarketFacetFunctionSelectors].sort();
      const updatedSelectors = [...(await unitroller.facetFunctionSelectors(NEW_MARKET_FACET))].sort();

      expect(updatedSelectors).to.deep.equal(expectSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_MARKET_FACET)).to.deep.equal([]);
    });

    it("unitroller should contain new MarketFacet address", async () => {
      expect(await unitroller.facetAddresses()).to.include(NEW_MARKET_FACET);
      expect(await unitroller.facetAddresses()).to.not.include(OLD_MARKET_FACET);
    });

    it("enterMarketBehalf function should exist in new facet", async () => {
      const newFacetSelectors = await unitroller.facetFunctionSelectors(NEW_MARKET_FACET);
      expect(newFacetSelectors).to.include(ENTER_MARKET_BEHALF_SELECTOR);
    });
    it("should allow approved delegate to enter market on behalf of user", async () => {
      const user = await initMainnetUser(TEST_USER, parseEther("10000"));

      // First, exit the market if already in it
      try {
        await unitroller.connect(user).exitMarket(VUSDT);
      } catch (e) {
        // Market might not be entered, continue
      }

      // Approve delegate
      await unitroller.connect(user).updateDelegate(TEST_DELEGATE, true);

      // Switch to delegate
      const delegate = await initMainnetUser(TEST_DELEGATE, parseEther("10000"));

      // Check membership before
      const membershipBefore = await unitroller.checkMembership(TEST_USER, VUSDT);
      expect(membershipBefore).to.be.false;

      await expect(await unitroller.connect(delegate).enterMarketBehalf(TEST_USER, VUSDT))
        .to.emit(unitroller, "MarketEntered")
        .withArgs(VUSDT, TEST_USER);

      // Check membership after
      const membershipAfter = await unitroller.checkMembership(TEST_USER, VUSDT);
      expect(membershipAfter).to.be.true;
    });

    it("should revert when unapproved delegate tries to enter market", async () => {
      const userSigner = await initMainnetUser(TEST_DELEGATE, parseEther("10000"));
      const comptroller = unitroller.connect(userSigner);

      try {
        await comptroller.exitMarket(VUSDT);
      } catch (e) {
        // Market might not be entered, continue
      }

      const delegateSigner = await initMainnetUser(TEST_USER, parseEther("10000"));
      const comptrollerDelegate = unitroller.connect(delegateSigner);

      // Should revert with NotAnApprovedDelegate
      await expect(comptrollerDelegate.enterMarketBehalf(TEST_DELEGATE, VUSDT)).to.be.revertedWithCustomError(
        comptrollerDelegate,
        "NotAnApprovedDelegate",
      );
    });
  });
});
