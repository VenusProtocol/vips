import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { bypassStalePrices } from "src/vip-framework/oracleStaleness";

import {
  ACM,
  ADAPTER_SWAPS,
  COLLATERAL_GATEWAY,
  COLLATERAL_MARKETS,
  LIQUIDITY_MARKETS,
  NORMAL_TIMELOCK,
  SPOKE_COMPTROLLER,
  SPOKE_POOL_REGISTRY,
} from "../../vips/vip-670/addresses/bscmainnet";
import vip672, { ENTER_MARKET_FOR_ACCOUNT_SIGNATURE } from "../../vips/vip-672/bscmainnet";
import ACM_ABI from "../vip-670/abi/AccessControlManager.json";
import GATEWAY_ABI from "../vip-670/abi/CollateralGateway.json";
import ERC20_ABI from "../vip-670/abi/ERC20.json";
import COMPTROLLER_ABI from "../vip-670/abi/SpokeComptroller.json";
import VTOKEN_ABI from "../vip-670/abi/VToken.json";

const { parseEther, keccak256, defaultAbiCoder, hexZeroPad } = ethers.utils;
const { MaxUint256, AddressZero } = ethers.constants;
const SUPPLY = parseEther("1");
const USER = ethers.utils.getAddress(ethers.utils.hexDataSlice(ethers.utils.id("vip-672 spoke user"), 12));
const CORE_VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
// Same token funding fixture as VIP-670: bStocks use OZ v5's ERC-7201 ERC20 namespace.
// Only test-user balances are injected. Deployed code, listing, permissions and caps remain real.
const OZ5_ERC20_STORAGE = "0x52c63247e1f47db19d5ce0460030c497f067ca4cebf71ba98eeadabe20bace00";
const [qqqb, spyb] = COLLATERAL_MARKETS;

// VIP-668/669/670 have executed on mainnet at this block; no replay or manual Spoke grants.
forking(129144152, async () => {
  const provider = ethers.provider;
  const comptroller = new Contract(SPOKE_COMPTROLLER, COMPTROLLER_ABI, provider);
  const acm = new Contract(ACM, ACM_ABI, provider);
  const mayEnter = () =>
    acm.callStatic.isAllowedToCall(COLLATERAL_GATEWAY, ENTER_MARKET_FOR_ACCOUNT_SIGNATURE, {
      from: SPOKE_COMPTROLLER,
    });
  before(async () => {
    // Governance time travel must not age the real feeds out of their valid windows.
    await bypassStalePrices(COLLATERAL_MARKETS.map(m => m.underlying));
  });

  testVip("VIP-672 with Spoke prerequisites", await vip672());

  async function userFixture() {
    const user = await initMainnetUser(USER, parseEther("10"));
    const timelock = await initMainnetUser(NORMAL_TIMELOCK, parseEther("10"));
    const gateway = new Contract(COLLATERAL_GATEWAY, GATEWAY_ABI, user);
    const markets = COLLATERAL_MARKETS.map(m => ({
      ...m,
      token: new Contract(m.underlying, ERC20_ABI, user),
      receipt: new Contract(m.vToken, VTOKEN_ABI, user),
    }));
    for (const m of markets) {
      const slot = keccak256(defaultAbiCoder.encode(["address", "bytes32"], [USER, OZ5_ERC20_STORAGE]));
      await provider.send("hardhat_setStorageAt", [m.underlying, slot, hexZeroPad(SUPPLY.mul(10).toHexString(), 32)]);
      expect(await m.token.balanceOf(USER)).to.equal(SUPPLY.mul(10));
      await m.token.approve(gateway.address, MaxUint256);
    }
    return { user, timelock, gateway, markets };
  }

  async function snapshot(f: Awaited<ReturnType<typeof userFixture>>) {
    return Promise.all(
      f.markets.map(async m => ({
        wallet: (await m.token.balanceOf(USER)).toString(),
        receipts: (await m.receipt.balanceOf(USER)).toString(),
        cash: (await m.token.balanceOf(m.vToken)).toString(),
        totalSupply: (await m.receipt.totalSupply()).toString(),
        allowance: (await m.token.allowance(USER, COLLATERAL_GATEWAY)).toString(),
        collateral: await comptroller.checkMembership(USER, m.vToken),
      })),
    );
  }

  async function noResidue(f: Awaited<ReturnType<typeof userFixture>>) {
    for (const m of f.markets) {
      expect(await m.token.balanceOf(COLLATERAL_GATEWAY)).to.equal(0);
      expect(await m.receipt.balanceOf(COLLATERAL_GATEWAY)).to.equal(0);
      expect(await m.token.allowance(COLLATERAL_GATEWAY, m.vToken)).to.equal(0);
    }
  }

  describe("Post-VIP CollateralGateway Spoke flows", () => {
    it("uses the real registry and the Spoke grant from VIP-670", async () => {
      const f = await loadFixture(userFixture);
      expect(await f.gateway.POOL_REGISTRY()).to.equal(SPOKE_POOL_REGISTRY);
      expect(await mayEnter()).to.equal(true);
      for (const m of f.markets) {
        expect((await comptroller.markets(m.vToken)).isListed).to.equal(true);
        expect(await comptroller.checkMembership(USER, m.vToken)).to.equal(false);
      }
    });

    for (const [index, market] of COLLATERAL_MARKETS.entries()) {
      it(`supplies ${market.symbol} for the user and automatically enables collateral, including repeat supply`, async () => {
        const f = await loadFixture(userFixture);
        const m = f.markets[index];
        const cashBefore = await m.token.balanceOf(m.vToken);
        const expectedReceipts = SUPPLY.mul(parseEther("1")).div(await m.receipt.exchangeRateStored());
        for (let i = 1; i <= 2; i++) {
          await expect(f.gateway.supplyAndEnterSpokeMarkets([m.vToken], [SUPPLY]))
            .to.emit(f.gateway, "SuppliedToSpoke")
            .withArgs(USER, m.vToken, SUPPLY, expectedReceipts);
          expect(await m.receipt.balanceOf(USER)).to.equal(expectedReceipts.mul(i));
          expect(await m.token.balanceOf(USER)).to.equal(SUPPLY.mul(10 - i));
          expect(await m.token.balanceOf(m.vToken)).to.equal(cashBefore.add(SUPPLY.mul(i)));
          expect(await comptroller.checkMembership(USER, m.vToken)).to.equal(true);
        }
        const [err, power, shortfall] = await comptroller.getBorrowingPower(USER);
        expect(err).to.equal(0);
        expect(power).to.be.gt(0);
        expect(shortfall).to.equal(0);
        expect(await comptroller.getAssetsIn(USER)).to.deep.equal([m.vToken]);
        await noResidue(f);
      });
    }

    it("supplies both collateral markets atomically in one transaction", async () => {
      const f = await loadFixture(userFixture);
      await f.gateway.supplyAndEnterSpokeMarkets([qqqb.vToken, spyb.vToken], [SUPPLY, SUPPLY.mul(2)]);
      for (const [i, m] of f.markets.entries()) {
        expect(await m.token.balanceOf(USER)).to.equal(SUPPLY.mul(10 - (i + 1)));
        expect(await m.receipt.balanceOf(USER)).to.be.gt(0);
        expect(await comptroller.checkMembership(USER, m.vToken)).to.equal(true);
      }
      expect(await comptroller.getAssetsIn(USER)).to.deep.equal([qqqb.vToken, spyb.vToken]);
      await noResidue(f);
    });

    it("enables collateral for existing supplied positions without moving tokens, and is idempotent", async () => {
      const f = await loadFixture(userFixture);
      for (const m of f.markets) {
        await m.token.approve(m.vToken, SUPPLY);
        await m.receipt.mint(SUPPLY);
        await m.token.approve(COLLATERAL_GATEWAY, 0);
        expect(await comptroller.checkMembership(USER, m.vToken)).to.equal(false);
      }
      const before = await snapshot(f);
      const expected = before.map(m => ({ ...m, collateral: true }));
      await f.gateway.enterSpokeMarkets([qqqb.vToken, spyb.vToken]);
      expect(await snapshot(f)).to.deep.equal(expected);
      await f.gateway.enterSpokeMarkets([qqqb.vToken, spyb.vToken, qqqb.vToken]);
      expect(await snapshot(f)).to.deep.equal(expected);
      expect(await comptroller.getAssetsIn(USER)).to.deep.equal([qqqb.vToken, spyb.vToken]);
      await noResidue(f);
    });

    it("rolls back both supplies when the second token has no allowance", async () => {
      const f = await loadFixture(userFixture);
      await f.markets[1].token.approve(COLLATERAL_GATEWAY, 0);
      const before = await snapshot(f);
      await expect(f.gateway.supplyAndEnterSpokeMarkets([qqqb.vToken, spyb.vToken], [SUPPLY, SUPPLY])).to.be.reverted;
      expect(await snapshot(f)).to.deep.equal(before);
      await noResidue(f);
    });

    it("rolls back minting and rejects enter-only when the Spoke ACM permission is revoked", async () => {
      const f = await loadFixture(userFixture);
      await acm
        .connect(f.timelock)
        .revokeCallPermission(SPOKE_COMPTROLLER, ENTER_MARKET_FOR_ACCOUNT_SIGNATURE, COLLATERAL_GATEWAY);
      expect(await mayEnter()).to.equal(false);
      const before = await snapshot(f);
      await expect(f.gateway.supplyAndEnterSpokeMarkets([qqqb.vToken], [SUPPLY]))
        .to.be.revertedWithCustomError(comptroller, "Unauthorized")
        .withArgs(COLLATERAL_GATEWAY, SPOKE_COMPTROLLER, ENTER_MARKET_FOR_ACCOUNT_SIGNATURE);
      await expect(f.gateway.enterSpokeMarkets([qqqb.vToken]))
        .to.be.revertedWithCustomError(comptroller, "Unauthorized")
        .withArgs(COLLATERAL_GATEWAY, SPOKE_COMPTROLLER, ENTER_MARKET_FOR_ACCOUNT_SIGNATURE);
      expect(await snapshot(f)).to.deep.equal(before);
      await noResidue(f);
    });

    for (const m of LIQUIDITY_MARKETS) {
      it(`respects the ${m.symbol} Spoke supply allowlist and rolls back the preceding collateral supply`, async () => {
        const f = await loadFixture(userFixture);
        const token = new Contract(m.underlying, ERC20_ABI, f.user);
        // Fund from the existing Core market's cash, as VIP-670's fixture does.
        const coreMarket = ADAPTER_SWAPS.find(s =>
          s.name.startsWith(`CoreSource_${m.stack.name.replace("Hub_", "")}:`),
        );
        if (!coreMarket) throw new Error(`Missing Core market for ${m.symbol}`);
        const cashHolder = await initMainnetUser(coreMarket.resource, parseEther("1"));
        await token.connect(cashHolder).transfer(USER, SUPPLY);
        await token.approve(COLLATERAL_GATEWAY, MaxUint256);
        expect(await comptroller.isSupplyAllowlistEnabled(m.vToken)).to.equal(true);
        expect(await comptroller.isAllowedSupplier(m.vToken, USER)).to.equal(false);
        const before = await snapshot(f);
        await expect(f.gateway.supplyAndEnterSpokeMarkets([qqqb.vToken, m.vToken], [SUPPLY, SUPPLY]))
          .to.be.revertedWithCustomError(comptroller, "SupplyNotAllowed")
          .withArgs(m.vToken, USER);
        expect(await snapshot(f)).to.deep.equal(before);
        expect(await token.balanceOf(USER)).to.equal(SUPPLY);
        expect(await token.balanceOf(COLLATERAL_GATEWAY)).to.equal(0);
        expect(await token.allowance(COLLATERAL_GATEWAY, m.vToken)).to.equal(0);
        expect(await comptroller.checkMembership(USER, m.vToken)).to.equal(false);
        await noResidue(f);
      });
    }

    for (const enterOnly of [false, true]) {
      it(`rejects a Core market and atomically rolls back ${enterOnly ? "enter-only" : "supply"} batches`, async () => {
        const f = await loadFixture(userFixture);
        const before = await snapshot(f);
        const tx = enterOnly
          ? f.gateway.enterSpokeMarkets([qqqb.vToken, CORE_VUSDT])
          : f.gateway.supplyAndEnterSpokeMarkets([qqqb.vToken, CORE_VUSDT], [SUPPLY, SUPPLY]);
        await expect(tx).to.be.revertedWithCustomError(f.gateway, "MarketNotRegistered").withArgs(CORE_VUSDT);
        expect(await snapshot(f)).to.deep.equal(before);
        await noResidue(f);
      });
    }

    it("rejects empty/mismatched arrays, zero amounts and zero markets without changing state", async () => {
      const f = await loadFixture(userFixture);
      const before = await snapshot(f);
      await expect(f.gateway.supplyAndEnterSpokeMarkets([], [])).to.be.revertedWithCustomError(
        f.gateway,
        "InvalidArrayLength",
      );
      await expect(f.gateway.enterSpokeMarkets([])).to.be.revertedWithCustomError(f.gateway, "InvalidArrayLength");
      await expect(f.gateway.supplyAndEnterSpokeMarkets([qqqb.vToken], [])).to.be.revertedWithCustomError(
        f.gateway,
        "InvalidArrayLength",
      );
      await expect(f.gateway.supplyAndEnterSpokeMarkets([qqqb.vToken], [0])).to.be.revertedWithCustomError(
        f.gateway,
        "ZeroAmount",
      );
      await expect(f.gateway.supplyAndEnterSpokeMarkets([AddressZero], [SUPPLY])).to.be.revertedWithCustomError(
        f.gateway,
        "ZeroAddress",
      );
      // Unlike supply, enter-only has no explicit zero-address guard: reading its comptroller reverts.
      await expect(f.gateway.enterSpokeMarkets([AddressZero])).to.be.revertedWithoutReason();
      expect(await snapshot(f)).to.deep.equal(before);
      await noResidue(f);
    });
  });
});
