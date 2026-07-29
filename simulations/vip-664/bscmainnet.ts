import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip664, {
  BNBX_REDEEM_AMOUNT,
  BNB_RETURN_AMOUNT,
  BNBx,
  BUYBACKS,
  DEV_RECIPIENT,
  FULL_REDEEM_MARKETS,
  GUARDIAN,
  PARTIAL_REDEEM_MARKETS,
  STAKE_MANAGER_V2,
  THIRD_PARTY_TOKENS,
  TOKEN_REDEEMER,
  VETH_REDEEM_AMOUNT,
  VTREASURY,
  vETH_LiquidStakedETH,
} from "../../vips/vip-664/bscmainnet";
import VTREASURY_ABI from "./abi/VTreasury.json";
import ERC20_ABI from "./abi/erc20.json";
import OWNABLE2STEP_ABI from "./abi/ownable2Step.json";
import STAKE_MANAGER_ABI from "./abi/stakeManagerV2.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const { NORMAL_TIMELOCK } = bscmainnet;

const FORK_BLOCK = 112790000;

// The two cash-safe partial redemptions (vUSDT Tron, vETH).
const PARTIAL_VTOKENS = PARTIAL_REDEEM_MARKETS.map(m => m.vToken);

// Every redeemed market (11 fully + 2 partially).
const ALL_MARKETS = [...FULL_REDEEM_MARKETS, ...PARTIAL_VTOKENS];

// One WithdrawTreasuryBEP20 per redeemed market (13), one per third-party token (7), and one moving
// BNBx to the Timelock for the native redemption (1).
const EXPECTED_WITHDRAWALS = ALL_MARKETS.length + THIRD_PARTY_TOKENS.length + 1;

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

  // BNBx native-exit state.
  let bnbxContract: Contract;
  let treasuryBnbxBefore: BigNumber;
  let timelockBnbxBefore: BigNumber;
  let treasuryBnbBefore: BigNumber;

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

    bnbxContract = new ethers.Contract(BNBx, ERC20_ABI, ethers.provider);
    treasuryBnbxBefore = await bnbxContract.balanceOf(VTREASURY);
    timelockBnbxBefore = await bnbxContract.balanceOf(NORMAL_TIMELOCK);
    treasuryBnbBefore = await ethers.provider.getBalance(VTREASURY);
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

    it("each partial market's cash covers its cash-safe redeem amount", async () => {
      for (const { vToken, amount } of PARTIAL_REDEEM_MARKETS) {
        const cash = await new ethers.Contract(vToken, VTOKEN_ABI, ethers.provider).getCash();
        expect(cash, `partial market ${vToken} cash`).to.be.gte(amount);
      }
    });

    it("VTreasury holds BNBx, the Timelock holds none, and Stader's instant redemption pays the expected BNB", async () => {
      expect(treasuryBnbxBefore, "treasury BNBx").to.be.gt(0);
      expect(treasuryBnbxBefore, "treasury BNBx == BNBX_REDEEM_AMOUNT").to.equal(BNBX_REDEEM_AMOUNT);
      expect(timelockBnbxBefore, "timelock BNBx").to.equal(0);
      // redeemBnbxForBnb pays convertBnbXToBnb of the balance; the forwarded amount must not exceed it.
      const stakeManager = new ethers.Contract(STAKE_MANAGER_V2, STAKE_MANAGER_ABI, ethers.provider);
      const expectedBnb = await stakeManager.convertBnbXToBnb(BNBX_REDEEM_AMOUNT);
      expect(expectedBnb, "convertBnbXToBnb >= forwarded BNB").to.be.gte(BNB_RETURN_AMOUNT);
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
      // Part 2 + Part 3: one treasury withdrawal per redeemed market, per third-party token, and for BNBx.
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [EXPECTED_WITHDRAWALS]);
      // Part 3: the single BNBx native redemption.
      await expectEvents(txResponse, [STAKE_MANAGER_ABI], ["RedeemedBnbxForBnb"], [1]);
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

    it("partial markets: partially redeemed, leftover vToken returned to treasury, redeemer left empty", async () => {
      for (const vToken of PARTIAL_VTOKENS) {
        const c = new ethers.Contract(vToken, VTOKEN_ABI, ethers.provider);
        const treasuryAfter = await c.balanceOf(VTREASURY);
        const idx = ALL_MARKETS.indexOf(vToken);
        expect(treasuryAfter, `treasury ${vToken} decreased`).to.be.lt(treasuryVTokenBefore[idx]);
        expect(treasuryAfter, `treasury ${vToken} remainder > 0`).to.be.gt(0);
        expect(await c.balanceOf(TOKEN_REDEEMER), `redeemer ${vToken}`).to.equal(0);
      }
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

    it("BNBx: fully redeemed (none left on treasury or Timelock) and BNB returned to VTreasury", async () => {
      // BNBx is burned by the redemption, so neither the treasury nor the Timelock holds any afterwards.
      expect(await bnbxContract.balanceOf(VTREASURY), "treasury BNBx").to.equal(0);
      expect(await bnbxContract.balanceOf(NORMAL_TIMELOCK), "timelock BNBx").to.equal(timelockBnbxBefore);
      // VTreasury's native BNB balance increased by exactly the forwarded amount.
      const treasuryBnbAfter = await ethers.provider.getBalance(VTREASURY);
      expect(treasuryBnbAfter.sub(treasuryBnbBefore), "VTreasury BNB delta").to.equal(BNB_RETURN_AMOUNT);
    });
  });
});
