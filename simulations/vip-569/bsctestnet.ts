import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip569 from "../../vips/vip-569/bsctestnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import DIAMOND_ABI from "./abi/Diamond.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const OLD_MARKET_FACET = "0x0A7A88aB6aB40417Bd6bF1EB3907EFF06D24C2FC";

const NEW_MARKET_FACET = "0x8e0e15C99Ab0985cB39B2FE36532E5692730eBA9";

// Function selector for enterMarketBehalf(address,address)
const ENTER_MARKET_BEHALF_SELECTOR = "0xd585c3c6";

// Test accounts
const TEST_USER = "0x14A1c22EF6d2eF6cE33c0b018d8A34D02021e5c8";
const TEST_DELEGATE = "0x9cc6f5f16498fceef4d00a350bd8f8921d304dc9";
const VUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";

forking(73659707, async () => {
  const provider = ethers.provider;
  let unitroller: Contract;

  let marketFacetFunctionSelectors: string[];

  before(async () => {
    unitroller = new ethers.Contract(bsctestnet.UNITROLLER, COMPTROLLER_ABI, provider);

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

  testVip("vip-569", await vip569(), {
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
