import { constants } from "ethers";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

// ─────────────────────────────────────────────────────────────────────────────
// TreasuryTokenBuybackDistributor
//
// One-shot helper (protocol-reserve/contracts/helpers/TreasuryTokenBuybackDistributor.sol)
// that reads its own live balance of each supplied token and splits it across the six
// Treasury `TokenBuyback` contracts by fixed weights (BTCB 15% / ETH 15% / XVS 10% /
// USDT 15% / USDC 15% / U 30%, U absorbing rounding dust). Because the split is computed
// from `balanceOf(this)` at execution time, NO per-token amount is hardcoded in this VIP.
//
// VAI is handled specially: `convertVaiViaPsm()` redeems the distributor's VAI for USDT at the
// VAI Peg Stability Module (peg price, 0.10% fee, no slippage) instead of DEX-swapping it out of
// the thin VAI market via the buybacks, and sends the resulting USDT straight back to VTreasury.
// USDT is already a base asset and needs no buyback conversion, so it is NOT in the `distribute`
// list below.
//
// Deployed on bscmainnet at the address below (VAI-PSM aware build). Its ten constructor immutables
// — the six *_BUYBACK addresses, VAI, the VAI PSM, USDT and VTreasury — were verified on-chain to
// match the constants in this file, and the fork simulation re-asserts them against the live
// deployed contract before running the proposal.
// ─────────────────────────────────────────────────────────────────────────────
export const TREASURY_TOKEN_BUYBACK_DISTRIBUTOR = "0xc594053D4b2FaA311b55dDbFAb2338f7c90D6632";

// VAI, its Peg Stability Module (PegStability_USDT) and the PSM stable token (USDT). Verified
// on-chain (bscmainnet): the PSM's `VAI()` == VAI, `STABLE_TOKEN_ADDRESS()` == USDT, `venusTreasury()`
// == VTreasury, it is not paused, feeOut == 10 bps, and it holds enough USDT reserves / minted
// headroom to redeem the treasury's VAI. `convertVaiViaPsm` reads the live fee and oracle price and
// sends the redeemed USDT back to VTreasury, so nothing is hardcoded.
export const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";
export const VAI_PSM = "0xC138aa4E424D1A8539e8F38Af5a754a2B7c3Cc36";
export const STABLE_TOKEN = "0x55d398326f99059fF775485246999027B3197955"; // USDT

// Treasury `TokenBuyback` contracts (Token Converter Phase-2). Each has DESTINATION == VTreasury
// and BASE_ASSET == the corresponding pre-aligned asset (verified on-chain).
export const BTCB_BUYBACK = "0x1F306a0d929a7098a0A0b12248Ba97600AB79026";
export const ETH_BUYBACK = "0x41954F0bf26959dF2e1B8302DEBf736B5b154B64";
export const XVS_BUYBACK = "0x6D2d239c16453062cF145A7a5128A6a60710d236";
export const USDT_BUYBACK = "0xB3dDf13E8B6b8dE10F5826087C202b80F1D1b490";
export const USDC_BUYBACK = "0xd7aC40f9bd9A1beb8E2d121b4446CF90417cf169";
export const U_BUYBACK = "0xec63411423D03327De19135446dDdA3055D2feA8";

// The 33 miscellaneous / legacy treasury tokens to clean up (VTreasury holds a balance of each).
// Two RACA-era duplicate symbols (TRX, TUSD) are intentionally present — both distinct contracts.
export const TOKENS = [
  "0x20eE7B720f4E4c4FFcB00C4065cdae55271aECCa", // NFT
  "0xc748673057861a797275CD8A068AbB95A902e8de", // BabyDoge
  "0x12BB890508c125661E03b09EC06E404bc9289040", // RACA
  "0xaeF0d72a118ce24feE3cD1d43d383897D05B4e99", // WIN
  "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7", // VAI
  "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409", // FDUSD
  "0x14016E85a25aeb13065688cAFB43044C2ef86784", // TUSD
  "0xbA2aE424d960c26247Dd6c32edC70B295c744C43", // DOGE
  "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E", // FLOKI
  "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94", // LTC
  "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B", // TRX
  "0x5A110fC00474038f6c02E89C707D638602EA44B5", // USDF
  "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD", // LINK
  "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3", // TRX (legacy)
  "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402", // DOT
  "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d", // USD1
  "0x4B0F1812e5Df2A09796481Ff14017e6005508003", // TWT
  "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9", // TUSD (legacy)
  "0xC45873F0042902Aa4116a3264df0163dd1888c67", // BERA
  "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153", // FIL
  "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", // BUSD
  "0xCC42724C6683B7E57334c4E856f4c9965ED682bD", // MATIC
  "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf", // BCH
  "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5", // lisUSD
  "0xD369F1Af3f6D194800ebB76Ed70a23055927fB49", // TIA
  "0xAb980940732b4f5f3c04A3A0fF9800cF6DD72FeC", // NTRN
  "0xd17479997F34dd9156Deef8F95A52D81D265be9c", // USDD
  "0x352Cb5E19b12FC216548a2677bD0fce83BaE434B", // BTT
  "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", // Cake
  "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", // DAI
  "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A", // SXP
  "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11", // THE
  "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34", // USDe
];

export const vip646 = () => {
  const meta = {
    version: "v2",
    title: "VIP-646 [BNB Chain] Venus Treasury Cleanup — Token Transfers to Buyback Contracts",
    description: `#### Summary

As a follow-up action from the previously introduced [token converter design](https://community.venus.io/t/token-converter-phase-2-tokenbuyback-migration/5778), this VIP cleans up the Venus Treasury on BNB Chain by transferring 33 miscellaneous / legacy tokens into the six Treasury TokenBuyback contracts, where they will be bought back into the pre-aligned base assets by percentage.

Snapshot 2026-07-15: 33 tokens, total ~$983,651.71.

#### Buyback weights

- BTCB buyback: 15%
- ETH buyback: 15%
- XVS buyback: 10%
- USDT buyback: 15%
- USDC buyback: 15%
- U buyback: 30%

Each token's live balance is split across the six buyback contracts by these fixed weights (the U buyback also receives any integer-division rounding dust).

#### Tokens

- NFT: 0x20eE7B720f4E4c4FFcB00C4065cdae55271aECCa
- BabyDoge: 0xc748673057861a797275CD8A068AbB95A902e8de
- RACA: 0x12BB890508c125661E03b09EC06E404bc9289040
- WIN: 0xaeF0d72a118ce24feE3cD1d43d383897D05B4e99
- VAI: 0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7
- FDUSD: 0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409
- TUSD: 0x14016E85a25aeb13065688cAFB43044C2ef86784
- DOGE: 0xbA2aE424d960c26247Dd6c32edC70B295c744C43
- FLOKI: 0xfb5B838b6cfEEdC2873aB27866079AC55363D37E
- LTC: 0x4338665CBB7B2485A8855A139b75D5e34AB0DB94
- TRX: 0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B
- USDF: 0x5A110fC00474038f6c02E89C707D638602EA44B5
- LINK: 0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD
- TRX (legacy): 0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3
- DOT: 0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402
- USD1: 0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d
- TWT: 0x4B0F1812e5Df2A09796481Ff14017e6005508003
- TUSD (legacy): 0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9
- BERA: 0xC45873F0042902Aa4116a3264df0163dd1888c67
- FIL: 0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153
- BUSD: 0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56
- MATIC: 0xCC42724C6683B7E57334c4E856f4c9965ED682bD
- BCH: 0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf
- lisUSD: 0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5
- TIA: 0xD369F1Af3f6D194800ebB76Ed70a23055927fB49
- NTRN: 0xAb980940732b4f5f3c04A3A0fF9800cF6DD72FeC
- USDD: 0xd17479997F34dd9156Deef8F95A52D81D265be9c
- BTT: 0x352Cb5E19b12FC216548a2677bD0fce83BaE434B
- Cake: 0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82
- DAI: 0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3
- SXP: 0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A
- THE: 0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11
- USDe: 0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34

#### Execution

**No withdrawal amount is hardcoded.** A dedicated one-shot helper, TreasuryTokenBuybackDistributor (0xc594053D4b2FaA311b55dDbFAb2338f7c90D6632), reads its own live balance of each token at execution time and computes each split, so the ratios stay correct even if balances change between authoring and execution.

The proposal executes as the Normal Timelock (owner of VTreasury) in three stages:

- **Withdraw** the full live balance of each of the 33 tokens from VTreasury into the distributor with withdrawTreasuryBEP20(token, type(uint256).max, distributor). VTreasury caps the amount to the actual balance, so type(uint256).max is a "whatever the balance is" sentinel rather than a hardcoded number.
- **Convert VAI via the PSM.** convertVaiViaPsm() redeems the distributor's VAI for USDT at the VAI Peg Stability Module at the pegged rate (minus the PSM's 0.10% fee, zero slippage) instead of DEX-swapping VAI out of its thin market, and sends the resulting USDT straight back to VTreasury — USDT is already a base asset and needs no buyback conversion. The 0.10% fee is paid in VAI and routed by the PSM back to its venusTreasury, which is VTreasury, so it also stays with the protocol as PSM revenue. This stage is best-effort: if the PSM is paused or short of liquidity, the VAI simply falls through to plain distribution in the next stage.
- **Distribute** by calling distribute(tokens) on the helper, which splits each token's balance across the six buyback contracts by the fixed weights above. USDT is intentionally NOT in the list: the VAI-to-USDT proceeds from the previous stage already went back to VTreasury; only VAI that failed to redeem (PSM unavailable) falls through here as a plain ERC20. The helper holds no privilege over the treasury and can only forward tokens explicitly transferred to it to the fixed, verified buyback destinations.

Every buyback destination has been verified on-chain to have DESTINATION() == VTreasury and the expected BASE_ASSET(). The VAI PSM has been verified on-chain to reference this VAI and USDT, to be active, and to hold sufficient USDT reserves to redeem the treasury's VAI.

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
      // Stage 1: Withdraw the full live balance of each token into the distributor.
      // type(uint256).max is capped to the actual balance by VTreasury (no hardcoded amount).
      // ════════════════════════════════════════════════════════════════════════
      ...TOKENS.map(token => ({
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [token, constants.MaxUint256, TREASURY_TOKEN_BUYBACK_DISTRIBUTOR],
      })),

      // ════════════════════════════════════════════════════════════════════════
      // Stage 2: Redeem the withdrawn VAI for USDT at the VAI Peg Stability Module
      // (peg price, 0.10% fee, no slippage) and send the USDT straight back to VTreasury —
      // USDT is already a base asset and needs no buyback conversion. Best-effort: if the PSM
      // is unavailable the VAI simply falls through to plain distribution in stage 3.
      // ════════════════════════════════════════════════════════════════════════
      {
        target: TREASURY_TOKEN_BUYBACK_DISTRIBUTOR,
        signature: "convertVaiViaPsm()",
        params: [],
      },

      // ════════════════════════════════════════════════════════════════════════
      // Stage 3: Split every withdrawn token's balance across the six buybacks by weight. USDT is
      // NOT in the list — the VAI→USDT proceeds already returned to VTreasury in stage 2; only VAI
      // that failed to redeem (PSM unavailable) falls through here as a plain ERC20.
      // ════════════════════════════════════════════════════════════════════════
      {
        target: TREASURY_TOKEN_BUYBACK_DISTRIBUTOR,
        signature: "distribute(address[])",
        params: [[...TOKENS]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip646;
