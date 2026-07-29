import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip664, {
  BUYBACKS,
  DEV_RECIPIENT,
  FULL_REDEEM_MARKETS,
  GUARDIAN,
  THIRD_PARTY_TOKENS,
  TOKEN_REDEEMER,
  VETH_REDEEM_AMOUNT,
  VTREASURY,
  vETH_LiquidStakedETH,
} from "../../vips/vip-664/bscmainnet";
import VTREASURY_ABI from "./abi/VTreasury.json";
import ERC20_ABI from "./abi/erc20.json";
import OWNABLE2STEP_ABI from "./abi/ownable2Step.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const { NORMAL_TIMELOCK } = bscmainnet;

const FORK_BLOCK = 112790000;

// Every redeemed market (12 fully + vETH partially).
const ALL_MARKETS = [...FULL_REDEEM_MARKETS, vETH_LiquidStakedETH];

// One WithdrawTreasuryBEP20 per redeemed market (13) plus one per third-party token (8).
const EXPECTED_WITHDRAWALS = ALL_MARKETS.length + THIRD_PARTY_TOKENS.length;

forking(FORK_BLOCK, async () => {
  const buybackContracts: Contract[] = [];
  const vTokenContracts: Contract[] = [];
  const thirdPartyContracts: Contract[] = [];

  // Unique underlying tokens across the redeemed markets (the 5 USDT markets share one underlying).
  const underlyingByMarket: string[] = [];
  const uniqueUnderlyings: string[] = [];
  const underlyingContracts: Record<string, Contract> = {};

  const buybackOwnerBefore: string[] = [];
  const buybackPendingBefore: string[] = [];
  const treasuryVTokenBefore: BigNumber[] = [];
  const treasuryUnderlyingBefore: Record<string, BigNumber> = {};
  const treasuryThirdPartyBefore: BigNumber[] = [];
  const devThirdPartyBefore: BigNumber[] = [];
  let treasuryEthBefore: BigNumber;

  // vETH's underlying (ETH), resolved in before().
  let treasuryEthKey: string;

  before(async () => {
    for (const b of BUYBACKS) {
      const c = new ethers.Contract(b, OWNABLE2STEP_ABI, ethers.provider);
      buybackContracts.push(c);
      buybackOwnerBefore.push(await c.owner());
      buybackPendingBefore.push(await c.pendingOwner());
    }

    for (const market of ALL_MARKETS) {
      const c = new ethers.Contract(market, VTOKEN_ABI, ethers.provider);
      vTokenContracts.push(c);
      treasuryVTokenBefore.push(await c.balanceOf(VTREASURY));
      const underlying = (await c.underlying()) as string;
      underlyingByMarket.push(underlying);
      if (!uniqueUnderlyings.includes(underlying)) {
        uniqueUnderlyings.push(underlying);
        underlyingContracts[underlying] = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      }
    }
    // vETH's underlying (ETH) — the market whose treasury delta we can assert exactly.
    treasuryEthKey = underlyingByMarket[ALL_MARKETS.indexOf(vETH_LiquidStakedETH)];

    for (const u of uniqueUnderlyings) {
      treasuryUnderlyingBefore[u] = await underlyingContracts[u].balanceOf(VTREASURY);
    }
    treasuryEthBefore = treasuryUnderlyingBefore[treasuryEthKey];

    for (const t of THIRD_PARTY_TOKENS) {
      const c = new ethers.Contract(t, ERC20_ABI, ethers.provider);
      thirdPartyContracts.push(c);
      treasuryThirdPartyBefore.push(await c.balanceOf(VTREASURY));
      devThirdPartyBefore.push(await c.balanceOf(DEV_RECIPIENT));
    }
  });

  describe("Pre-VIP state", () => {
    it("each TokenBuyback is owned by the Normal Timelock with no pending owner", async () => {
      for (let i = 0; i < BUYBACKS.length; i++) {
        expect(buybackOwnerBefore[i], `buyback ${BUYBACKS[i]} owner`).to.equal(NORMAL_TIMELOCK);
        expect(buybackPendingBefore[i], `buyback ${BUYBACKS[i]} pendingOwner`).to.equal(ethers.constants.AddressZero);
      }
    });

    it("VTreasury holds a non-zero balance of every redeemed market's vToken", async () => {
      for (let i = 0; i < ALL_MARKETS.length; i++) {
        expect(treasuryVTokenBefore[i], `treasury vToken ${ALL_MARKETS[i]}`).to.be.gt(0);
      }
    });

    it("VTreasury holds a non-zero balance of every third-party token", async () => {
      for (let i = 0; i < THIRD_PARTY_TOKENS.length; i++) {
        expect(treasuryThirdPartyBefore[i], `treasury ${THIRD_PARTY_TOKENS[i]}`).to.be.gt(0);
      }
    });

    it("vETH market cash covers the redeem amount", async () => {
      // 1.99 ETH must be redeemable from the market at execution time.
      const cash = await new ethers.Contract(vETH_LiquidStakedETH, VTOKEN_ABI, ethers.provider).getCash();
      expect(cash, "vETH market cash").to.be.gte(VETH_REDEEM_AMOUNT);
    });
  });

  testVip("VIP-664 Treasury Fund Cleanup Phase 2", await vip664(), {
    proposer: "0x34221485302f6F2029660a000908B5FCABB9BC6e",
    supporters: [
      "0x5176671de05380379399b669ed276feec99d59cb",
      "0xc444949e0054a23c44fc45789738bdf64aed2391",
      "0xeBA4b3c462B9C16f7CCaF4BE6f4D3c17c377411E",
    ],
    callbackAfterExecution: async txResponse => {
      // Part 1: six two-step ownership transfers started.
      await expectEvents(txResponse, [OWNABLE2STEP_ABI], ["OwnershipTransferStarted"], [BUYBACKS.length]);
      // Part 2 + Part 3: one treasury withdrawal per redeemed market and per third-party token.
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [EXPECTED_WITHDRAWALS]);
    },
  });

  describe("Post-VIP state — Part 1 (buyback ownership)", () => {
    it("each TokenBuyback now has the Guardian as pendingOwner, owner unchanged", async () => {
      for (let i = 0; i < BUYBACKS.length; i++) {
        expect(await buybackContracts[i].owner(), `buyback ${BUYBACKS[i]} owner`).to.equal(NORMAL_TIMELOCK);
        expect(await buybackContracts[i].pendingOwner(), `buyback ${BUYBACKS[i]} pendingOwner`).to.equal(GUARDIAN);
      }
    });
  });

  describe("Post-VIP state — Part 2 (deprecated-market redemptions)", () => {
    it("fully-redeemed markets: treasury vToken balance is zero and none is stranded on the redeemer", async () => {
      for (let i = 0; i < FULL_REDEEM_MARKETS.length; i++) {
        const c = vTokenContracts[i];
        expect(await c.balanceOf(VTREASURY), `treasury vToken ${FULL_REDEEM_MARKETS[i]}`).to.equal(0);
        expect(await c.balanceOf(TOKEN_REDEEMER), `redeemer vToken ${FULL_REDEEM_MARKETS[i]}`).to.equal(0);
      }
    });

    it("vETH: partially redeemed, leftover vETH returned to treasury, redeemer left empty", async () => {
      const c = new ethers.Contract(vETH_LiquidStakedETH, VTOKEN_ABI, ethers.provider);
      const treasuryAfter = await c.balanceOf(VTREASURY);
      const idx = ALL_MARKETS.indexOf(vETH_LiquidStakedETH);
      expect(treasuryAfter, "treasury vETH decreased").to.be.lt(treasuryVTokenBefore[idx]);
      expect(treasuryAfter, "treasury vETH remainder > 0").to.be.gt(0);
      expect(await c.balanceOf(TOKEN_REDEEMER), "redeemer vETH").to.equal(0);
    });

    it("every redeemed underlying increased in the treasury; no underlying stranded on the redeemer", async () => {
      for (const u of uniqueUnderlyings) {
        const treasuryAfter = await underlyingContracts[u].balanceOf(VTREASURY);
        expect(treasuryAfter, `treasury underlying ${u}`).to.be.gt(treasuryUnderlyingBefore[u]);
        expect(await underlyingContracts[u].balanceOf(TOKEN_REDEEMER), `redeemer underlying ${u}`).to.equal(0);
      }
    });

    it("vETH underlying (ETH) increased by the redeemed amount (plus sub-vToken rounding)", async () => {
      // redeemUnderlying burns ceil(amount / exchangeRate) vTokens, so the redeemer receives — and
      // forwards to VTreasury — the requested amount plus at most one vToken's worth of underlying
      // (≈1e-8 ETH here). Assert the delta is at least the requested amount and within that dust.
      const ethAfter = await underlyingContracts[treasuryEthKey].balanceOf(VTREASURY);
      const delta = ethAfter.sub(treasuryEthBefore);
      const oneVTokenUnderlying = (
        await new ethers.Contract(vETH_LiquidStakedETH, VTOKEN_ABI, ethers.provider).exchangeRateStored()
      ).div(parseUnits("1", 18));
      expect(delta).to.be.gte(VETH_REDEEM_AMOUNT);
      expect(delta.sub(VETH_REDEEM_AMOUNT)).to.be.lte(oneVTokenUnderlying);
    });
  });

  describe("Post-VIP state — Part 3 (third-party tokens)", () => {
    it("each third-party token moved from the treasury to the dev recipient", async () => {
      for (let i = 0; i < THIRD_PARTY_TOKENS.length; i++) {
        expect(await thirdPartyContracts[i].balanceOf(VTREASURY), `treasury ${THIRD_PARTY_TOKENS[i]}`).to.equal(0);
        expect(await thirdPartyContracts[i].balanceOf(DEV_RECIPIENT), `dev ${THIRD_PARTY_TOKENS[i]}`).to.equal(
          devThirdPartyBefore[i].add(treasuryThirdPartyBefore[i]),
        );
      }
    });
  });
});
