import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip649, {
  BNBX_REDEEM_AMOUNT,
  BNB_RETURN_AMOUNT,
  BNBx,
  BUYBACKS,
  DEV_RECIPIENT,
  DIRECT_TRANSFER_TOKENS,
  GUARDIAN,
  REDEEM_MARKETS,
  STAKE_MANAGER_V2,
  TOKEN_REDEEMER,
  VTREASURY,
} from "../../vips/vip-649/bscmainnet";
import VTREASURY_ABI from "./abi/VTreasury.json";
import ERC20_ABI from "./abi/erc20.json";
import OWNABLE2STEP_ABI from "./abi/ownable2Step.json";
import STAKE_MANAGER_ABI from "./abi/stakeManagerV2.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const { NORMAL_TIMELOCK } = bscmainnet;

const FORK_BLOCK = 112790000;

// One WithdrawTreasuryBEP20 per redeemed market (13), one per token moved whole to the dev recipient
// (vTUSDOLD + 7 third-party = 8), and one moving BNBx to the Timelock for the native redemption (1).
const EXPECTED_WITHDRAWALS = REDEEM_MARKETS.length + DIRECT_TRANSFER_TOKENS.length + 1;

forking(FORK_BLOCK, async () => {
  const buybackContracts: Contract[] = [];
  const vTokenContracts: Contract[] = [];
  const directTransferContracts: Contract[] = [];

  // Unique underlying tokens across the redeemed markets (the 5 USDT markets share one underlying).
  const uniqueUnderlyings: string[] = [];
  const underlyingContracts: Record<string, Contract> = {};

  const buybackOwnerBefore: string[] = [];
  const buybackPendingBefore: string[] = [];
  const treasuryVTokenBefore: BigNumber[] = [];
  const devUnderlyingBefore: Record<string, BigNumber> = {};
  const treasuryDirectBefore: BigNumber[] = [];
  const devDirectBefore: BigNumber[] = [];

  // BNBx native-exit state.
  let bnbxContract: Contract;
  let treasuryBnbxBefore: BigNumber;
  let timelockBnbxBefore: BigNumber;
  let treasuryBnbBefore: BigNumber;

  before(async () => {
    for (const b of BUYBACKS) {
      const c = new ethers.Contract(b, OWNABLE2STEP_ABI, ethers.provider);
      buybackContracts.push(c);
      buybackOwnerBefore.push(await c.owner());
      buybackPendingBefore.push(await c.pendingOwner());
    }

    for (const market of REDEEM_MARKETS) {
      const c = new ethers.Contract(market, VTOKEN_ABI, ethers.provider);
      vTokenContracts.push(c);
      treasuryVTokenBefore.push(await c.balanceOf(VTREASURY));
      const underlying = (await c.underlying()) as string;
      if (!uniqueUnderlyings.includes(underlying)) {
        uniqueUnderlyings.push(underlying);
        underlyingContracts[underlying] = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      }
    }

    for (const u of uniqueUnderlyings) {
      devUnderlyingBefore[u] = await underlyingContracts[u].balanceOf(DEV_RECIPIENT);
    }

    for (const t of DIRECT_TRANSFER_TOKENS) {
      const c = new ethers.Contract(t, ERC20_ABI, ethers.provider);
      directTransferContracts.push(c);
      treasuryDirectBefore.push(await c.balanceOf(VTREASURY));
      devDirectBefore.push(await c.balanceOf(DEV_RECIPIENT));
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
      for (let i = 0; i < REDEEM_MARKETS.length; i++) {
        expect(treasuryVTokenBefore[i], `treasury vToken ${REDEEM_MARKETS[i]}`).to.be.gt(0);
      }
    });

    it("every redeemed market's cash covers the treasury's full position at this block", async () => {
      for (let i = 0; i < REDEEM_MARKETS.length; i++) {
        const c = vTokenContracts[i];
        const cash = await c.getCash();
        const exchangeRate = await c.exchangeRateStored();
        // Underlying redeemable = vTokenBalance * exchangeRate / 1e18.
        const redeemable = treasuryVTokenBefore[i].mul(exchangeRate).div(ethers.constants.WeiPerEther);
        expect(cash, `market ${REDEEM_MARKETS[i]} cash covers position`).to.be.gte(redeemable);
      }
    });

    it("VTreasury holds a non-zero balance of every token moved whole to the dev recipient", async () => {
      for (let i = 0; i < DIRECT_TRANSFER_TOKENS.length; i++) {
        expect(treasuryDirectBefore[i], `treasury ${DIRECT_TRANSFER_TOKENS[i]}`).to.be.gt(0);
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

  testVip("VIP-649 Treasury Fund Cleanup Phase 2", await vip649(), {
    proposer: "0x34221485302f6F2029660a000908B5FCABB9BC6e",
    supporters: [
      "0x5176671de05380379399b669ed276feec99d59cb",
      "0xc444949e0054a23c44fc45789738bdf64aed2391",
      "0xeBA4b3c462B9C16f7CCaF4BE6f4D3c17c377411E",
    ],
    callbackAfterExecution: async txResponse => {
      // Part 1: ten two-step ownership transfers started.
      await expectEvents(txResponse, [OWNABLE2STEP_ABI], ["OwnershipTransferStarted"], [BUYBACKS.length]);
      // Part 2 + Part 3: one treasury withdrawal per redeemed market, per token moved whole, and for BNBx.
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
    it("treasury vToken balance is zero for every market and none is stranded on the redeemer", async () => {
      for (let i = 0; i < REDEEM_MARKETS.length; i++) {
        const c = vTokenContracts[i];
        expect(await c.balanceOf(VTREASURY), `treasury vToken ${REDEEM_MARKETS[i]}`).to.equal(0);
        expect(await c.balanceOf(TOKEN_REDEEMER), `redeemer vToken ${REDEEM_MARKETS[i]}`).to.equal(0);
      }
    });

    it("every redeemed underlying increased at the dev recipient; nothing stranded on the redeemer", async () => {
      for (const u of uniqueUnderlyings) {
        const devAfter = await underlyingContracts[u].balanceOf(DEV_RECIPIENT);
        expect(devAfter, `dev underlying ${u}`).to.be.gt(devUnderlyingBefore[u]);
        expect(await underlyingContracts[u].balanceOf(TOKEN_REDEEMER), `redeemer underlying ${u}`).to.equal(0);
      }
    });
  });

  describe("Post-VIP state — Part 3 (tokens moved whole + BNBx native exit)", () => {
    it("each token (vTUSDOLD + third-party receipt tokens) moved from the treasury to the dev recipient", async () => {
      for (let i = 0; i < DIRECT_TRANSFER_TOKENS.length; i++) {
        expect(await directTransferContracts[i].balanceOf(VTREASURY), `treasury ${DIRECT_TRANSFER_TOKENS[i]}`).to.equal(
          0,
        );
        expect(await directTransferContracts[i].balanceOf(DEV_RECIPIENT), `dev ${DIRECT_TRANSFER_TOKENS[i]}`).to.equal(
          devDirectBefore[i].add(treasuryDirectBefore[i]),
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
