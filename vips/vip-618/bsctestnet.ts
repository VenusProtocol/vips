import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;

export const DEFAULT_PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";
export const RISK_FUND_V2 = "0x487CeF72dacABD7E12e633bb3B63815a386f7012";
export const SHORTFALL = "0x503574a82fE2A9f968d355C8AAc1Ba0481859369";

// Multisig acting as buyback cron operator on testnet (same Safe used as GUARDIAN / default proposer).
export const OPERATOR = bsctestnet.GUARDIAN;

// Operator (cron) signatures — granted to the multisig OPERATOR.
export const EXECUTE_BUYBACK_SIG = "executeBuyback(address,uint256,uint256,uint256,address,bytes,address)";
export const FORWARD_BASE_ASSET_SIG = "forwardBaseAsset(address,uint256)";

// Admin/config signatures — ACM-gated; granted to NormalTimelock so governance can tune buyback config
// without further VIPs. (setAllowedRouter and sweepToken are onlyOwner on TokenBuyback, not ACM-gated,
// so they need no grant — NormalTimelock owns each buyback proxy and can call them directly.)
export const SET_DAILY_CAP_USD_SIG = "setDailyCapUsd(uint256)";
export const SET_SLIPPAGE_EVENT_USD_SIG = "setSlippageEventUsd(uint256)";

// ===== Legacy converters (NormalTimelock-owned on bsctestnet, paused in this VIP) =====
// Note: on mainnet WBNBBurnConverter is Guardian-owned and excluded by the migration helper,
// but on bsctestnet it is NormalTimelock-owned (verified on-chain), so we include it here.
export const RISK_FUND_CONVERTER = "0x32Fbf7bBbd79355B86741E3181ef8c1D9bD309Bb";
export const USDT_PRIME_CONVERTER = "0xf1FA230D25fC5D6CAfe87C5A6F9e1B17Bc6F194E";
export const USDC_PRIME_CONVERTER = "0x2ecEdE6989d8646c992344fF6C97c72a3f811A13";
export const BTCB_PRIME_CONVERTER = "0x989A1993C023a45DA141928921C0dE8fD123b7d1";
export const ETH_PRIME_CONVERTER = "0xf358650A007aa12ecC8dac08CF8929Be7f72A4D9";
export const XVS_VAULT_CONVERTER = "0x258f49254C758a0E37DAb148ADDAEA851F4b02a2";
export const WBNB_BURN_CONVERTER = "0x42DBA48e7cCeB030eC73AaAe29d4A3F0cD4facba";

export const LEGACY_CONVERTERS: string[] = [
  RISK_FUND_CONVERTER,
  USDT_PRIME_CONVERTER,
  USDC_PRIME_CONVERTER,
  BTCB_PRIME_CONVERTER,
  ETH_PRIME_CONVERTER,
  XVS_VAULT_CONVERTER,
  WBNB_BURN_CONVERTER,
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

If passed, this VIP retires the legacy Token Converter system on **BNB Chain Testnet** and hands the ten new TokenBuyback proxies to NormalTimelock. This is the **only** VIP-618 action on BNB Chain Testnet — there is no follow-up. Router allowlisting, draining of legacy converters, ACM revocations on legacy converters, and the repointing of \`ProtocolShareReserve\` distribution configs will **not** happen on testnet.

#### Proposed Changes

1. **Pause legacy converters** — call \`pauseConversion()\` on each of the seven NormalTimelock-owned converters: RiskFundConverter, four \`*PrimeConverter\`, XVSVaultConverter, and WBNBBurnConverter. (On mainnet WBNBBurnConverter is Guardian-owned and excluded from the migration helper; on BNB Chain Testnet it is NormalTimelock-owned, so it is included here.)
2. **Upgrade RiskFundV2 implementation** — new impl removes \`updatePoolState\`, \`sweepTokenFromPool\`, and the \`poolAssetsFunds\` mapping (storage slot preserved as \`__deprecatedSlotPoolAssetsFunds\`). \`transferReserveForAuction\` now reads raw balance.
3. **Accept ownership** on each of the ten new TokenBuyback proxies (deploy script already called \`transferOwnership(NormalTimelock)\`).
4. **Grant ACM permissions on each of the ten buybacks**:
   - Operator (multisig \`${OPERATOR}\`): \`executeBuyback\` + \`forwardBaseAsset\`.
   - NormalTimelock: \`setDailyCapUsd\` + \`setSlippageEventUsd\` (admin/config so governance can tune cron caps without further VIPs).

   \`setAllowedRouter\` and \`sweepToken\` are \`onlyOwner\` on \`TokenBuyback\`, not ACM-gated — NormalTimelock owns each buyback proxy after step 3 and can call them directly, so no ACM grant is needed for those.

   Router is **not** allowlisted in this VIP, so \`executeBuyback\` will still revert at the router check until governance calls \`setAllowedRouter\` directly; \`forwardBaseAsset\` is callable now.
5. **Pause Shortfall auctions** as defense in depth post-upgrade. Isolated pools are wound down on testnet — no live or upcoming auctions exist.

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

      // 4a. Operator (multisig) grants: executeBuyback + forwardBaseAsset on each buyback.
      ...BUYBACKS.flatMap(b => [
        {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [b, EXECUTE_BUYBACK_SIG, OPERATOR],
        },
        {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [b, FORWARD_BASE_ASSET_SIG, OPERATOR],
        },
      ]),

      // 4b. NormalTimelock admin/config grants (ACM-gated only): setDailyCapUsd + setSlippageEventUsd.
      //     setAllowedRouter and sweepToken are onlyOwner on TokenBuyback and need no ACM grant.
      ...BUYBACKS.flatMap(b => [
        {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [b, SET_DAILY_CAP_USD_SIG, bsctestnet.NORMAL_TIMELOCK],
        },
        {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [b, SET_SLIPPAGE_EVENT_USD_SIG, bsctestnet.NORMAL_TIMELOCK],
        },
      ]),

      // 5. Pause Shortfall auctions (defense in depth post-upgrade)
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
