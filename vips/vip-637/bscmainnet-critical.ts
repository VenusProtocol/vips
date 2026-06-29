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

// Critical Timelock already holds both ACM permissions used here
// (XVSVault.pause() and PLP.setTokensDistributionSpeed), so no grants are needed.
const vip675Critical = () => {
  const meta = {
    version: "v2",
    title: "VIP-675 (Critical) Freeze XVS Vault staking and stop legacy Prime emissions",
    description: `#### Summary

If passed, this critical VIP prepares the legacy Prime migration by freezing the system so an off-chain script can sweep every legacy Prime user's pending interest via \`claimInterest\` against stable balances. It (1) pauses the XVS Vault to freeze staking for the whole migration window, and (2) zeroes the PrimeLiquidityProvider distribution speed for every legacy Prime underlying so no new interest accrues.

#### Description

If passed, this VIP will:

- **Pause the XVS Vault** — calls \`XVSVault.pause()\`, freezing all staking deposits/withdrawals for the duration of the migration window. Legacy Prime \`claimInterest\` continues to work while the vault is paused, so the off-chain sweep is unaffected.
- **Stop emissions** — calls \`PrimeLiquidityProvider.setTokensDistributionSpeed\` with a speed of \`0\` for every legacy Prime underlying (ETH, BTCB, USDC, USDT, U, WBNB), so no new Prime interest accrues from this point on.

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
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip675Critical;
