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
// NOTE: the contract is currently deployed on bsctestnet at
// 0xfd45810d4c669e59510A096fc4cFA2233e5e20FD. It must be deployed to bscmainnet with the
// six bscmainnet buyback addresses below as constructor args, and the placeholder constant
// below replaced with the resulting mainnet address, before this VIP is proposed. The
// simulation deploys the contract on the mainnet fork and injects its runtime code at this
// address, so the fork proof is exact.
// ─────────────────────────────────────────────────────────────────────────────
export const TREASURY_TOKEN_BUYBACK_DISTRIBUTOR = "0x1234567890123456789012345678901234567890"; // TODO: bscmainnet deploy address

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

export const vip664 = () => {
  const meta = {
    version: "v2",
    title: "VIP-664 [BNB Chain] Venus Treasury Cleanup — route legacy tokens to buyback contracts",
    description: `#### Summary

This VIP cleans up the Venus Treasury on BNB Chain by moving 33 miscellaneous / legacy tokens into the six Treasury \`TokenBuyback\` contracts introduced by the Token Converter Phase-2 migration, so the finance-team cron can later swap them at market rate into the pre-aligned base assets.

The distribution weights are **BTCB 15% · ETH 15% · XVS 10% · USDT 15% · USDC 15% · U 30%** (the U buyback also receives any integer-division dust).

#### Description

Per the requester's requirement, **no withdrawal amount is hardcoded**. Instead a dedicated one-shot helper, \`TreasuryTokenBuybackDistributor\`, reads its own live balance of each token at execution time and computes each split, so the ratios stay correct even if balances change between authoring and execution.

The proposal executes as the Normal Timelock (owner of \`VTreasury\`) in two stages:

1. **Withdraw** the full live balance of each of the 33 tokens from \`VTreasury\` into the distributor with \`withdrawTreasuryBEP20(token, type(uint256).max, distributor)\`. \`VTreasury\` caps the amount to the actual balance, so \`type(uint256).max\` is a "whatever the balance is" sentinel rather than a hardcoded number.
2. **Distribute** by calling \`distribute(tokens)\` on the helper, which splits each token's balance across the six buyback contracts by the fixed weights above. The helper holds no privilege over the treasury and can only forward tokens explicitly transferred to it to the fixed, verified buyback destinations.

Every buyback destination has been verified on-chain to have \`DESTINATION() == VTreasury\` and the expected \`BASE_ASSET()\`.

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
      // Stage 2: Split every token's balance across the six buybacks by weight.
      // ════════════════════════════════════════════════════════════════════════
      {
        target: TREASURY_TOKEN_BUYBACK_DISTRIBUTOR,
        signature: "distribute(address[])",
        params: [TOKENS],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664;
