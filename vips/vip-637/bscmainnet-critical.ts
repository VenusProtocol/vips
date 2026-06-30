import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const XVS_VAULT = bscmainnet.XVS_VAULT_PROXY;
export const PLP = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2"; // PrimeLiquidityProvider (existing)

// Underlying reward tokens distributed by the PrimeLiquidityProvider for every
// legacy Prime market on the Core pool. Zeroing each one halts new interest
// accrual so the off-chain claimInterest sweep captures a frozen balance.
//   vETH   -> ETH (Binance-Peg)
//   vBTC   -> BTCB
//   vUSDC  -> USDC
//   vUSDT  -> USDT
//   vU     -> U
//   vWBNB  -> WBNB
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

export const PRIME_UNDERLYINGS = [ETH, BTCB, USDC, USDT, U, WBNB];

// ProtocolShareReserve — re-route the XVS buyback share into Prime rewards.
//   PROTOCOL_RESERVES (schema 0, spread income):    XVS 20% -> 0; USDT & U prime 10% -> 20% each
//   ADDITIONAL_REVENUE (schema 1, liquidation income): XVS 20% -> 0; USDT & U prime added at 10% each
// Both schemas still sum to 100%. The two zeroed XVS entries are then removed to
// reclaim the loop slots (PSR maxLoopsLimit is 20; this keeps the target count at 18).
export const PSR = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const XVS_BUYBACK = "0x637E6246BBb0F9aBae9d764F5e1bB6347f028C12";
export const USDT_PRIME_BUYBACK = "0xD721932C7CA41Eb5305867287010587a266346a8";
export const U_PRIME_BUYBACK = "0xBC9fFBfb799B2d189669D3816E2B7273c69041bd";

// PSR distribution schemas
export const PROTOCOL_RESERVES = 0;
export const ADDITIONAL_REVENUE = 1;

// Critical Timelock already holds every ACM permission used here
// (XVSVault.pause(), PLP.setTokensDistributionSpeed, and PSR
// addOrUpdateDistributionConfigs / removeDistributionConfig), so no grants are needed.
const vip675Critical = () => {
  const meta = {
    version: "v2",
    title:
      "VIP-675 (Critical) Freeze XVS Vault staking, stop legacy Prime emissions, and re-route XVS buyback to Prime",
    description: `#### Summary

If passed, this critical VIP prepares the legacy Prime migration by freezing the system so an off-chain script can sweep every legacy Prime user's pending interest via \`claimInterest\` against stable balances. It (1) pauses the XVS Vault to freeze staking for the whole migration window, (2) zeroes the PrimeLiquidityProvider distribution speed for every legacy Prime underlying so no new interest accrues, and (3) re-routes the ProtocolShareReserve XVS buyback share into the USDT and U Prime buybacks.

#### Description

If passed, this VIP will:

- **Pause the XVS Vault** — calls \`XVSVault.pause()\`, freezing all staking deposits/withdrawals for the duration of the migration window. Legacy Prime \`claimInterest\` continues to work while the vault is paused, so the off-chain sweep is unaffected.
- **Stop emissions** — calls \`PrimeLiquidityProvider.setTokensDistributionSpeed\` with a speed of \`0\` for every legacy Prime underlying (ETH, BTCB, USDC, USDT, U, WBNB), so no new Prime interest accrues from this point on.
- **Re-route the XVS buyback share to Prime** — calls \`ProtocolShareReserve.addOrUpdateDistributionConfigs\` to set the XVS buyback to \`0\` in both distribution schemas and redirect that revenue to Prime: in PROTOCOL_RESERVES (spread income) the USDT and U Prime buybacks move from 10% to 20% each; in ADDITIONAL_REVENUE (liquidation income) the USDT and U Prime buybacks are added at 10% each. Both schemas continue to sum to 100%. The two zeroed XVS buyback entries are then removed via \`removeDistributionConfig\`.

This is the first of two on-chain steps. After this VIP executes, an off-chain script calls \`claimInterest\` on behalf of every legacy Prime user. The subsequent (regular) VIP-675 then brings PrimeV2 / PrimeLeaderboard live; once the new leaderboard stakers are seeded off-chain, the Guardian calls \`XVSVault.resume()\` to bring staking back online.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. Pause the XVS Vault — freeze staking before the claimInterest sweep.
      //    Critical Timelock already holds the pause() ACM permission.
      {
        target: XVS_VAULT,
        signature: "pause()",
        params: [],
      },

      // 2. Stop legacy Prime emissions — zero the PLP distribution speed for every
      //    Prime underlying so no new interest accrues during the migration window.
      //    Critical Timelock already holds the setTokensDistributionSpeed ACM permission.
      {
        target: PLP,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [PRIME_UNDERLYINGS, PRIME_UNDERLYINGS.map(() => 0)],
      },

      // 3. Re-route the PSR XVS buyback share into Prime rewards. One call carries
      //    every change so the per-schema totals are only validated once, at the end:
      //      schema 0: XVS 20% -> 0, USDT & U prime 10% -> 20% each  (sums to 100%)
      //      schema 1: XVS 20% -> 0, USDT & U prime added at 10% each (sums to 100%)
      {
        target: PSR,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            [PROTOCOL_RESERVES, 0, XVS_BUYBACK],
            [PROTOCOL_RESERVES, 2000, USDT_PRIME_BUYBACK],
            [PROTOCOL_RESERVES, 2000, U_PRIME_BUYBACK],
            [ADDITIONAL_REVENUE, 0, XVS_BUYBACK],
            [ADDITIONAL_REVENUE, 1000, USDT_PRIME_BUYBACK],
            [ADDITIONAL_REVENUE, 1000, U_PRIME_BUYBACK],
          ],
        ],
      },

      // 4. Drop the now-zeroed XVS buyback entries from both schemas (removable only
      //    once their percentage is 0), reclaiming the two loop slots.
      {
        target: PSR,
        signature: "removeDistributionConfig(uint8,address)",
        params: [PROTOCOL_RESERVES, XVS_BUYBACK],
      },
      {
        target: PSR,
        signature: "removeDistributionConfig(uint8,address)",
        params: [ADDITIONAL_REVENUE, XVS_BUYBACK],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip675Critical;
