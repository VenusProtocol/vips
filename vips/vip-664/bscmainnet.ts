import { constants } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

// ─────────────────────────────────────────────────────────────────────────────
// Infrastructure
// ─────────────────────────────────────────────────────────────────────────────
// VTreasury (BSC) cannot make arbitrary external calls, so every recovery first moves tokens out of
// it via withdrawTreasuryBEP20(token, amount, destination). type(uint256).max is a "whatever the
// balance is" sentinel: VTreasury caps the amount to its actual balance (VTreasury.sol).
export const VTREASURY = bscmainnet.VTREASURY;
export const GUARDIAN = bscmainnet.GUARDIAN; // 0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B
export const NORMAL_TIMELOCK = bscmainnet.NORMAL_TIMELOCK; // 0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396

// TokenRedeemer (VIP-594) — owned by the Normal Timelock. redeemAndTransfer redeems the redeemer's
// full vToken balance to `destination`; redeemUnderlyingAndTransfer redeems an exact underlying
// amount to `destination` and returns leftover vToken dust to `receiver`.
export const TOKEN_REDEEMER = "0xC53ffda840B51068C64b2E052a5715043f634bcd";

// Precedented Venus dev recipient (VIP-628 / VIP-641) that handles off-chain unstaking of receipt
// tokens whose protocols have no synchronous on-chain exit.
export const DEV_RECIPIENT = "0x080f8a0fb70f8f0f1b83c6178225a96cbe2be0de";

// ─────────────────────────────────────────────────────────────────────────────
// Part 1 — Treasury TokenBuyback contracts (Token Converter Phase-2, VIP-646).
// Each is currently owned by the Normal Timelock and is Ownable2Step. sweepToken on these is
// onlyOwner; handing ownership to the Guardian lets low-liquidity dust be swept without a full VIP
// each time. transferOwnership only starts the two-step transfer (sets pendingOwner); the Guardian
// completes it off-chain with acceptOwnership().
// ─────────────────────────────────────────────────────────────────────────────
export const BTCB_BUYBACK = "0x1F306a0d929a7098a0A0b12248Ba97600AB79026";
export const ETH_BUYBACK = "0x41954F0bf26959dF2e1B8302DEBf736B5b154B64";
export const XVS_BUYBACK = "0x6D2d239c16453062cF145A7a5128A6a60710d236";
export const USDT_BUYBACK = "0xB3dDf13E8B6b8dE10F5826087C202b80F1D1b490";
export const USDC_BUYBACK = "0xd7aC40f9bd9A1beb8E2d121b4446CF90417cf169";
export const U_BUYBACK = "0xec63411423D03327De19135446dDdA3055D2feA8";

export const BUYBACKS = [BTCB_BUYBACK, ETH_BUYBACK, XVS_BUYBACK, USDT_BUYBACK, USDC_BUYBACK, U_BUYBACK];

// ─────────────────────────────────────────────────────────────────────────────
// Part 2 — Deprecated markets to redeem back to VTreasury.
// Deprecation gate verified on-chain for every market: collateralFactor, supplyCap and borrowCap
// are all 0. Each position is withdrawn (as the vToken) to the TokenRedeemer and redeemed to the
// underlying, which is sent straight back to VTreasury.
//
// Eleven markets are fully redeemed with redeemAndTransfer (market cash comfortably exceeds the
// treasury position, verified on-chain). Two markets — vUSDT (Tron) and vETH (Liquid Staked ETH) —
// have market cash that sits close to the treasury position, so each is redeemed for a fixed,
// cash-safe underlying amount with redeemUnderlyingAndTransfer, leaving a small vToken remainder in
// VTreasury (still recoverable later).
// ─────────────────────────────────────────────────────────────────────────────

// Isolated pools (8)
export const vWBNB_LiquidStakedBNB = "0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2";
export const vUSDT_GameFi = "0x4978591f17670A846137d9d613e333C38dc68A37";
export const vUSDT_DeFi = "0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854";
export const vUSDT_Tron = "0x281E5378f99A4bc55b295ABc0A3E7eD32Deba059";
export const vUSDT_Stablecoins = "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B";
export const vBTCB_BTC = "0x8F2AE20b25c327714248C95dFD3b02815cC82302";
export const vUSDT_Meme = "0x4a9613D06a241B76b81d3777FCe3DDd1F61D4Bd0";
export const vETH_LiquidStakedETH = "0xeCCACF760FEA7943C5b0285BD09F601505A29c05";

// Core pool (5)
export const vTRXOLD = "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93";
export const vBUSD = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";
export const vTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E"; // new-TUSD market (underlying 0x40af3827…)
export const vDOT = "0x1610bc33319e9398de5f57B33a5b184c806aD217";
export const vMATIC = "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8";

// Markets fully redeemed (position comfortably <= market cash on-chain).
export const FULL_REDEEM_MARKETS = [
  vWBNB_LiquidStakedBNB,
  vUSDT_GameFi,
  vUSDT_DeFi,
  vUSDT_Stablecoins,
  vBTCB_BTC,
  vUSDT_Meme,
  vTRXOLD,
  vBUSD,
  vTUSD,
  vDOT,
  vMATIC,
];

// Cash-safe partial redemptions. For these two markets the market's available cash sits close to the
// treasury position, so instead of a full redeemAndTransfer we redeem a fixed underlying amount with
// redeemUnderlyingAndTransfer. The amount stays below the market cash so the redemption cannot revert
// on insufficient cash even if cash drifts slightly before execution; the small un-redeemed remainder
// is returned to VTreasury as the vToken.
//
// - vUSDT (Tron): treasury position ≈ 10,355.92 USDT; market cash ≈ 10,404.31 USDT (only ~0.47% above
//   the position — the thinnest of the deprecated markets). 10,300 USDT stays safely below cash.
// - vETH (Liquid Staked ETH): treasury position ≈ 2.008392 ETH; market cash ≈ 2.0279 ETH. 1.99 ETH
//   stays comfortably below both.
export const VUSDT_TRON_REDEEM_AMOUNT = parseUnits("10300", 18);
export const VETH_REDEEM_AMOUNT = parseUnits("1.99", 18);

export const PARTIAL_REDEEM_MARKETS = [
  { vToken: vUSDT_Tron, amount: VUSDT_TRON_REDEEM_AMOUNT },
  { vToken: vETH_LiquidStakedETH, amount: VETH_REDEEM_AMOUNT },
];

// ─────────────────────────────────────────────────────────────────────────────
// Part 3 — Third-party staking receipt tokens.
// Rule: exit natively where an immediate on-chain exit exists; otherwise transfer the receipt token
// to the dev recipient for off-chain unstaking (7–15 day cooldowns or off-chain-only redemption).
//
// These seven have no synchronous on-chain exit, so each is transferred whole to the dev recipient:
export const SolvBTC = "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7";
export const xSolvBTC = "0x1346b618dC92810EC74163e4c27004c921D446a5";
export const ankrBNB = "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827";
export const asBNB = "0x77734e70b6E88b4d82fE632a168EDf6e700912b6";
export const BETH = "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B";
export const slisBNB = "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B";
export const stkBNB = "0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16";

export const THIRD_PARTY_TOKENS = [SolvBTC, xSolvBTC, ankrBNB, asBNB, BETH, slisBNB, stkBNB];

// BNBx (Stader) — exited natively. Stader's StakeManagerV2 offers an instant, zero-fee redemption
// via redeemBnbxForBnb: the caller's BNBx is burned and BNB is paid to msg.sender in the same call.
// Stader V2 is in sunset mode — paused() == true and feeBps == 1000 gate the *asynchronous*
// requestWithdraw path only; they do NOT gate redeemBnbxForBnb (verified: a redeemBnbxForBnb of the
// full treasury balance executes with paused() == true and returns the full convertBnbXToBnb value
// with no fee). So BNBx is withdrawn to the Normal Timelock, redeemed for BNB (paid to the Timelock),
// and the BNB is forwarded to VTreasury.
//
// wBETH is intentionally NOT touched — it is the treasury's only retained yield-bearing position.
export const BNBx = "0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275";
export const STAKE_MANAGER_V2 = "0x3b961e83400D51e6E1AF5c450d3C7d7b80588d28";

// Treasury BNBx balance to redeem (static holding; verified on-chain). MaxUint256 is withdrawn to the
// Timelock and this exact amount is burned by redeemBnbxForBnb.
export const BNBX_REDEEM_AMOUNT = "31139027608566113112"; // 31.139027608566113112 BNBx

// BNB forwarded from the Timelock to VTreasury after the redemption. Equals convertBnbXToBnb of the
// balance above at authoring time. The Stader rate is frozen (sunset), so the redemption pays exactly
// this; any trivial remainder from a late rate tick stays in the Timelock (Venus-controlled).
export const BNB_RETURN_AMOUNT = "34562765676008670355"; // 34.562765676008670355 BNB

export const vip664 = () => {
  const meta = {
    version: "v2",
    title: "VIP-664 [BNB Chain] Treasury Fund Cleanup Phase 2 — recover deprecated-market and third-party positions",
    description: `#### Summary

Phase 2 of the Venus Treasury cleanup (following [VIP-646](https://app.venus.io/#/governance/proposal/646?chainId=56)) recovers funds still held **outside** VTreasury on BNB Chain: vToken positions in fully-deprecated markets, and receipt tokens in third-party staking protocols. VTreasury cannot make external calls, so every recovery first moves the tokens out of VTreasury.

This VIP has three parts:

#### Part 1 — Treasury TokenBuyback ownership → Guardian

Starts a two-step ownership transfer of the six Treasury TokenBuyback contracts (BTCB / ETH / XVS / USDT / USDC / U) from the Normal Timelock to the Guardian. \`sweepToken\` on these contracts is \`onlyOwner\`; handing ownership to the Guardian lets low-liquidity dust be swept without a full VIP each time. This only sets \`pendingOwner\` — the Guardian must complete the transfer with \`acceptOwnership()\`.

- BTCB buyback: ${BTCB_BUYBACK}
- ETH buyback: ${ETH_BUYBACK}
- XVS buyback: ${XVS_BUYBACK}
- USDT buyback: ${USDT_BUYBACK}
- USDC buyback: ${USDC_BUYBACK}
- U buyback: ${U_BUYBACK}

#### Part 2 — Redeem 13 deprecated-market positions back to VTreasury

Each of these markets has collateral factor, supply cap and borrow cap all set to 0 (deprecated). For each, the position is withdrawn (as the vToken) from VTreasury to the Token Redeemer, then redeemed to the underlying and sent straight back to VTreasury.

Isolated pools (8): vWBNB (Liquid Staked BNB), vUSDT (GameFi), vUSDT (DeFi), vUSDT (Tron), vUSDT (Stablecoins), vBTCB (BTC), vUSDT (Meme), vETH (Liquid Staked ETH).
Core pool (5): vTRXOLD, vBUSD, vTUSD (new-TUSD market), vDOT, vMATIC.

- **vUSDT (Tron)** and **vETH (Liquid Staked ETH)** are each redeemed for a fixed, cash-safe underlying amount (10,300 USDT and 1.99 ETH respectively) rather than in full, because their market cash sits close to the treasury position (vUSDT Tron is the thinnest, cash only ≈0.47% above the position). The small un-redeemed remainder is returned to VTreasury as the vToken and stays recoverable.
- The three thin USDT pools (**Tron**, **Stablecoins**, **Meme**) are drained near-empty, because the treasury is effectively their entire supply.
- Out of scope: vUST / vLUNA (already unlisted — handled with the write-off proposal) and vTUSDOLD (illiquid; redeemed in a later batch after the positions are manually worked out).

#### Part 3 — Third-party staking positions

Rule: exit natively where an immediate on-chain exit exists; otherwise transfer the receipt token to the precedented Venus dev recipient (${DEV_RECIPIENT}) for off-chain unstaking.

Seven receipt tokens have no synchronous on-chain exit (7–15 day cooldowns or off-chain-only redemption) and are transferred whole to the dev recipient: SolvBTC, xSolvBTC, ankrBNB, asBNB, BETH, slisBNB, stkBNB.

**BNBx (Stader)** is exited natively: it is withdrawn to the Normal Timelock, redeemed for BNB via \`StakeManagerV2.redeemBnbxForBnb\` (instant, zero-fee), and the BNB is forwarded to VTreasury. Stader V2 is in sunset mode, where \`paused()\` and \`feeBps\` gate only the asynchronous \`requestWithdraw\` path — not the instant \`redeemBnbxForBnb\`, which pays the full BNB value with no fee.

wBETH is intentionally retained — it is the treasury's only yield-bearing position.

#### Note on the vUST interest-rate change

Repointing vUST to a 0% interest-rate model is **not** part of this VIP. vUST's \`admin\` is the Guardian, not the Normal Timelock, so \`_setInterestRateModel\` cannot be executed by governance; it must be done by the Guardian directly (or folded into the vUST write-off proposal).

#### Voting options

- **For** — Execute this proposal
- **Against** — Do not execute this proposal
- **Abstain** — Indifferent to execution`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ════════════════════════════════════════════════════════════════════════
      // Part 1 — Start ownership transfer of the six TokenBuyback contracts to the Guardian
      // (two-step; Guardian completes with acceptOwnership()).
      // ════════════════════════════════════════════════════════════════════════
      ...BUYBACKS.map(buyback => ({
        target: buyback,
        signature: "transferOwnership(address)",
        params: [GUARDIAN],
      })),

      // ════════════════════════════════════════════════════════════════════════
      // Part 2 — Redeem deprecated-market positions back to VTreasury.
      // For each fully-redeemed market: withdraw the whole vToken position to the Token Redeemer,
      // then redeem the redeemer's full balance and send the underlying to VTreasury.
      // ════════════════════════════════════════════════════════════════════════
      ...FULL_REDEEM_MARKETS.flatMap(vToken => [
        {
          target: VTREASURY,
          signature: "withdrawTreasuryBEP20(address,uint256,address)",
          params: [vToken, constants.MaxUint256, TOKEN_REDEEMER],
        },
        {
          target: TOKEN_REDEEMER,
          signature: "redeemAndTransfer(address,address)",
          params: [vToken, VTREASURY],
        },
      ]),

      // Cash-safe partial redemptions (vUSDT Tron, vETH): withdraw the whole position to the redeemer,
      // then redeem a fixed cash-safe underlying amount to VTreasury; the leftover vToken is returned
      // to VTreasury.
      ...PARTIAL_REDEEM_MARKETS.flatMap(({ vToken, amount }) => [
        {
          target: VTREASURY,
          signature: "withdrawTreasuryBEP20(address,uint256,address)",
          params: [vToken, constants.MaxUint256, TOKEN_REDEEMER],
        },
        {
          target: TOKEN_REDEEMER,
          signature: "redeemUnderlyingAndTransfer(address,address,uint256,address)",
          params: [vToken, VTREASURY, amount, VTREASURY],
        },
      ]),

      // ════════════════════════════════════════════════════════════════════════
      // Part 3 — Recover third-party staking positions.
      // Seven receipt tokens have no synchronous on-chain exit and are transferred whole to the dev
      // recipient for off-chain unstaking. type(uint256).max withdraws the whole balance of each.
      // ════════════════════════════════════════════════════════════════════════
      ...THIRD_PARTY_TOKENS.map(token => ({
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [token, constants.MaxUint256, DEV_RECIPIENT],
      })),

      // BNBx (Stader) native exit: withdraw BNBx to the Normal Timelock, redeem it for BNB via
      // StakeManagerV2.redeemBnbxForBnb (instant, zero-fee; BNB is paid to the Timelock), then forward
      // the BNB to VTreasury.
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BNBx, constants.MaxUint256, NORMAL_TIMELOCK],
      },
      {
        target: STAKE_MANAGER_V2,
        signature: "redeemBnbxForBnb(uint256)",
        params: [BNBX_REDEEM_AMOUNT],
      },
      {
        target: VTREASURY,
        signature: "",
        params: [],
        value: BNB_RETURN_AMOUNT,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664;
