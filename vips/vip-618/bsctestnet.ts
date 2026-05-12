import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const DEFAULT_PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";
export const RISK_FUND_V2 = "0x487CeF72dacABD7E12e633bb3B63815a386f7012";
export const SHORTFALL = "0x503574a82fE2A9f968d355C8AAc1Ba0481859369";

// ===== Legacy converters (timelock-owned, paused in this VIP) =====
// WBNBBurnConverter is guardian-owned and intentionally not paused here.
export const RISK_FUND_CONVERTER = "0x32Fbf7bBbd79355B86741E3181ef8c1D9bD309Bb";
export const USDT_PRIME_CONVERTER = "0xf1FA230D25fC5D6CAfe87C5A6F9e1B17Bc6F194E";
export const USDC_PRIME_CONVERTER = "0x2ecEdE6989d8646c992344fF6C97c72a3f811A13";
export const BTCB_PRIME_CONVERTER = "0x989A1993C023a45DA141928921C0dE8fD123b7d1";
export const ETH_PRIME_CONVERTER = "0xf358650A007aa12ecC8dac08CF8929Be7f72A4D9";
export const XVS_VAULT_CONVERTER = "0x258f49254C758a0E37DAb148ADDAEA851F4b02a2";

export const LEGACY_CONVERTERS: string[] = [
  RISK_FUND_CONVERTER,
  USDT_PRIME_CONVERTER,
  USDC_PRIME_CONVERTER,
  BTCB_PRIME_CONVERTER,
  ETH_PRIME_CONVERTER,
  XVS_VAULT_CONVERTER,
];

// ===== New TokenBuyback proxies =====
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
    title: "VIP-618 [BNB Chain Testnet] TokenBuyback Migration",
    description: `#### Summary

If passed, this VIP retires the legacy Token Converter system on **BNB Chain Testnet** and hands the ten new TokenBuyback proxies to NormalTimelock. This is the **only** VIP-618 action on BNB Chain Testnet — there is no follow-up. Router allowlisting, ACM operator grants on the new buybacks, draining of legacy converters, ACM revocations on legacy converters, and the repointing of \`ProtocolShareReserve\` distribution configs will **not** happen on testnet.

#### Proposed Changes

1. **Pause legacy converters** — call \`pauseConversion()\` on each of the six timelock-owned converters (RiskFundConverter + four \`*PrimeConverter\` + XVSVaultConverter). WBNBBurnConverter is guardian-owned and is not touched by this VIP.
2. **Upgrade RiskFundV2 implementation** — new impl removes \`updatePoolState\`, \`sweepTokenFromPool\`, and the \`poolAssetsFunds\` mapping (storage slot preserved as \`__deprecatedSlotPoolAssetsFunds\`). \`transferReserveForAuction\` now reads raw balance.
3. **Accept ownership** on each of the ten new TokenBuyback proxies (deploy script already called \`transferOwnership(NormalTimelock)\`).
4. **Pause Shortfall auctions** as defense in depth post-upgrade. Isolated pools are wound down on testnet — no live or upcoming auctions exist.

The pause step runs **before** the RiskFundV2 upgrade so that RiskFundConverter cannot enter \`convertExactTokens\` against the new impl (which no longer exposes \`updatePoolState\`) between transactions outside this proposal.

Implementation: [VenusProtocol/protocol-reserve PR #158](https://github.com/VenusProtocol/protocol-reserve/pull/158).`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. Pause legacy timelock-owned converters (RiskFundConverter first protects RiskFundV2 upgrade)
      ...LEGACY_CONVERTERS.map(c => ({
        target: c,
        signature: "pauseConversion()",
        params: [],
      })),

      // 2. Upgrade RiskFundV2 implementation
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RISK_FUND_V2, NEW_RISK_FUND_V2_IMPL],
      },

      // 3. Accept ownership of 10 TokenBuyback proxies
      ...BUYBACKS.map(b => ({
        target: b,
        signature: "acceptOwnership()",
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
