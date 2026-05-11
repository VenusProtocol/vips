import { ethers } from "ethers";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const DEFAULT_PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";
export const RISK_FUND_V2 = "0x487CeF72dacABD7E12e633bb3B63815a386f7012";
export const SHORTFALL = "0x503574a82fE2A9f968d355C8AAc1Ba0481859369";

// ===== Legacy converters =====
export const RISK_FUND_CONVERTER = "0x32Fbf7bBbd79355B86741E3181ef8c1D9bD309Bb";
export const USDT_PRIME_CONVERTER = "0xf1FA230D25fC5D6CAfe87C5A6F9e1B17Bc6F194E";
export const USDC_PRIME_CONVERTER = "0x2ecEdE6989d8646c992344fF6C97c72a3f811A13";
export const BTCB_PRIME_CONVERTER = "0x989A1993C023a45DA141928921C0dE8fD123b7d1";
export const ETH_PRIME_CONVERTER = "0xf358650A007aa12ecC8dac08CF8929Be7f72A4D9";
export const XVS_VAULT_CONVERTER = "0x258f49254C758a0E37DAb148ADDAEA851F4b02a2";
// WBNBBurnConverter is guardian-owned — not paused by this VIP (mirrors mainnet helper behaviour).
export const WBNB_BURN_CONVERTER = "0x42DBA48e7cCeB030eC73AaAe29d4A3F0cD4facba";
export const CONVERTER_NETWORK = "0xC8f2B705d5A2474B390f735A5aFb570e1ce0b2cf";

// Timelock-owned converters that are paused in this VIP (6 — excludes WBNB_BURN_CONVERTER).
export const LEGACY_CONVERTERS: string[] = [
  RISK_FUND_CONVERTER,
  USDT_PRIME_CONVERTER,
  USDC_PRIME_CONVERTER,
  BTCB_PRIME_CONVERTER,
  ETH_PRIME_CONVERTER,
  XVS_VAULT_CONVERTER,
];

// ===== New TokenBuyback proxies — TODO: fill from deploy on feat/VPD-1087 =====
export const RISK_FUND_BUYBACK = "0x1a063a07853b9bC797E571E54B5Ce632195071fE";
export const USDT_PRIME_BUYBACK = "0xaAc507Ae5BF60d94e15489fcF75C3AB9D3C6ab55";
export const U_PRIME_BUYBACK = "0xa9f091C50C2Bd214F757DAF243bCb94A9fE707a4";
export const XVS_BUYBACK = "0x7b96F9f3A19fd3fbB3b9621058F21d3935Bf5a11";
export const U_TREASURY_BUYBACK = "0x281d5376723933990815E9EC27D3139903630C5C";
export const BTCB_TREASURY_BUYBACK = "0x3AC5D1933B0087487A62fAC8944De62FCF39feb6";
export const ETH_TREASURY_BUYBACK = "0x721CCABeFC18d1e436B3479C9462B1A59988C35d";
export const USDT_TREASURY_BUYBACK = "0xBCF3Ef25Fb09aA4d39aDA5a737aF7E03B0Fca497";
export const USDC_TREASURY_BUYBACK = "0x90814cc1e02Bb821De7A280D64dFd7C0f7940fF3";
export const XVS_TREASURY_BUYBACK = "0x9d8d03EfB3777f97ab1e28D1D88b53aCE2CAE773";

export const BUYBACKS: string[] = [
  RISK_FUND_BUYBACK,
  USDT_PRIME_BUYBACK,
  U_PRIME_BUYBACK,
  XVS_BUYBACK,
  U_TREASURY_BUYBACK,
  BTCB_TREASURY_BUYBACK,
  ETH_TREASURY_BUYBACK,
  USDT_TREASURY_BUYBACK,
  USDC_TREASURY_BUYBACK,
  XVS_TREASURY_BUYBACK,
];

export const NEW_RISK_FUND_V2_IMPL = "0xAAe9c6412A7EaeB82eD2bA8E9E2bBc27bDa921f6";

export const vip618 = () => {
  const meta = {
    version: "v2",
    title: "VIP-618 [BNB Chain Testnet] TokenBuyback Migration & May Prime Allocation",
    description: `#### Summary

If passed, this VIP replaces the community-driven Token Converter system (RiskFundConverter + 4 *PrimeConverter + XVSVaultConverter + WBNBBurnConverter + ConverterNetwork) with **10 ACM-authorized TokenBuyback proxies** driven by a finance-team cron. BSC-only; this VIP targets **BNB Chain Testnet**.

#### Proposed Changes

1. **Upgrade RiskFundV2 implementation** — new impl removes \`updatePoolState\`, \`sweepTokenFromPool\`, and the \`poolAssetsFunds\` mapping (storage slot preserved as \`__deprecatedSlotPoolAssetsFunds\`). \`transferReserveForAuction\` now reads raw balance.
2. **Accept ownership** on each of the 10 new buyback proxies (deploy script already called \`transferOwnership(NormalTimelock)\`).
3. **Allowlist PancakeSwap V2 router** on each of the 10 buybacks.
4. **Grant ACM permissions** on \`executeBuyback\` + \`forwardBaseAsset\` for the cron operator on each of the 10 buybacks.
5. **Drain legacy converters** (remaining tokens → new buyback or VTreasury).
6. **Revoke ACM permissions** on legacy converters.
7. **Repoint ProtocolShareReserve distributions** from legacy converters to the 10 new buybacks.
8. **Defensively call \`Shortfall.pauseAuctions()\`** to keep the auction surface closed post-upgrade. Isolated pools are wound down on testnet as on mainnet — no live or upcoming auctions exist, so this is purely defense in depth.

RiskFundConverter drain + revoke is ordered **before** the upgrade — new impl removes \`updatePoolState\`, so in-flight \`convertExactTokens\` callbacks would revert.

Implementation: [VenusProtocol/protocol-reserve PR #158](https://github.com/VenusProtocol/protocol-reserve/pull/158).

#### Retired contracts

- WBNBBurnConverter — protocol shifted away from buy-and-burn.
- ConverterNetwork — routing layer no longer needed with direct PSR → Buyback wiring.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. Upgrade RiskFundV2 implementation
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RISK_FUND_V2, NEW_RISK_FUND_V2_IMPL],
      },

      // 2. Accept ownership of 10 TokenBuyback proxies
      ...BUYBACKS.map(b => ({
        target: b,
        signature: "acceptOwnership()",
        params: [],
      })),

      // 3. Retire legacy converters — pause conversions (mirrors helper _pauseAllTimelockOwnedConverters)
      ...LEGACY_CONVERTERS.map(c => ({
        target: c,
        signature: "pauseConversion()",
        params: [],
      })),

      // 4. Pause Shortfall auctions (defense in depth post-upgrade)
      {
        target: SHORTFALL,
        signature: "pauseAuctions()",
        params: [],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip618;
