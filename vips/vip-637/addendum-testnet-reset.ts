import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  COMPTROLLER,
  MINT_DEADLINE,
  MINT_THRESHOLD,
  PLP,
  PRIME_MARKETS,
  XVS,
  XVS_VAULT,
  XVS_VAULT_POOL_ID,
} from "./bsctestnet";

const { bsctestnet } = NETWORK_ADDRESSES;

const ACM = bsctestnet.ACCESS_CONTROL_MANAGER;
const NORMAL_TIMELOCK = bsctestnet.NORMAL_TIMELOCK;
const FAST_TRACK_TIMELOCK = bsctestnet.FAST_TRACK_TIMELOCK;
const CRITICAL_TIMELOCK = bsctestnet.CRITICAL_TIMELOCK;
const GUARDIAN = bsctestnet.GUARDIAN;

// Redeployed PrimeV2 / PrimeLeaderboard pair (fresh PROXY + fresh IMPL, not an upgrade of the
// addendum-2 contracts). The deploy script transfers ownership of both proxies to the
// NormalTimelock (pending acceptance) but does NOT wire them; this addendum accepts ownership,
// re-grants the full ACM permission set against the NEW addresses, wires the new pair, repoints
// every shared hook (PLP / XVS Vault / Core Comptroller) from the addendum-2 pair to the new one,
// re-adds the Prime markets, and re-opens the mint window.
export const PRIME_V2 = "0xeC22366d2572e52BCB29B50C905b945BA421B9b2";
export const PRIME_LEADERBOARD = "0x1a4408613eec291f2d338F7A88E9D550fa9cD8dC";

const ALL_TIMELOCKS = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];

// The off-chain admin (Guardian) runs the epoch operations directly alongside the NormalTimelock.
const KEEPER_ACCOUNTS = [NORMAL_TIMELOCK, GUARDIAN];

// Grant ACM permission for `target.signature` to every account in `accounts`
// (defaults to NormalTimelock only).
const grant = (target: string, signature: string, accounts: string[] = [NORMAL_TIMELOCK]) =>
  accounts.map(account => ({
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [target, signature, account],
  }));

// ACM-gated functions on the redeployed PrimeV2. Same set as the original VIP-675, plus
// recordCycleSnapshot (added in addendum 2 and baked into this fresh impl) and the
// testnet-only resetCycle helper.
const PRIME_V2_PERMISSIONS = [
  ...grant(PRIME_V2, "issue(address)", KEEPER_ACCOUNTS),
  ...grant(PRIME_V2, "issueBatch(address[])", KEEPER_ACCOUNTS),
  ...grant(PRIME_V2, "burn(address)", KEEPER_ACCOUNTS),
  ...grant(PRIME_V2, "burnBatch(address[])", KEEPER_ACCOUNTS),
  ...grant(PRIME_V2, "setPrimeLeaderboard(address)"),
  ...grant(PRIME_V2, "addMarket(address,uint256,uint256)"),
  ...grant(PRIME_V2, "removeMarket(address)"),
  ...grant(PRIME_V2, "setLimit(uint256)"),
  ...grant(PRIME_V2, "updateAlpha(uint128,uint128)"),
  ...grant(PRIME_V2, "updateMultipliers(address,uint256,uint256)"),
  ...grant(PRIME_V2, "setMaxLoopsLimit(uint256)"),
  ...grant(PRIME_V2, "setMintThreshold(uint256,uint256)", KEEPER_ACCOUNTS),
  ...grant(PRIME_V2, "recordCycleSnapshot(uint256)", KEEPER_ACCOUNTS),
  ...grant(PRIME_V2, "resetCycle(address[])", KEEPER_ACCOUNTS),
  ...grant(PRIME_V2, "pause()", ALL_TIMELOCKS),
  ...grant(PRIME_V2, "unpause()", ALL_TIMELOCKS),
];

// ACM-gated functions on the redeployed PrimeLeaderboard. Same set as the original VIP-675,
// plus the testnet-only resetCycle helper.
const PRIME_LEADERBOARD_PERMISSIONS = [
  ...grant(PRIME_LEADERBOARD, "initializeStakers(address[],uint256[],uint64[])", KEEPER_ACCOUNTS),
  ...grant(PRIME_LEADERBOARD, "finalizeInitialization()", KEEPER_ACCOUNTS),
  ...grant(PRIME_LEADERBOARD, "setMultiplierTiers(uint256[],uint256[])"),
  ...grant(PRIME_LEADERBOARD, "setPrimeV2(address)"),
  ...grant(PRIME_LEADERBOARD, "setMaxLoopsLimit(uint256)"),
  ...grant(PRIME_LEADERBOARD, "resetCycle(address[])", KEEPER_ACCOUNTS),
];

const vip675Addendum3 = () => {
  const meta = {
    version: "v2",
    title: "VIP-675 addendum 3 [Testnet] Re-wire to the redeployed PrimeV2 and PrimeLeaderboard",
    description: `#### Summary

If passed, this third addendum to VIP-675 will bring a freshly redeployed PrimeV2 / PrimeLeaderboard pair (new proxies and new implementations) live on BNB Chain testnet, replacing the pair configured by VIP-675 and its earlier addenda. It accepts ownership of the new contracts, re-grants the full ACM permission set against the new addresses (including the testnet-only resetCycle helper), wires the new pair together, repoints the shared PrimeLiquidityProvider / XVS Vault / Core Comptroller hooks from the old pair to the new one, re-adds the Prime markets, and re-opens the permissionless mint window.

#### Description

If passed, this addendum will:

- Accept ownership of the redeployed PrimeV2 and PrimeLeaderboard (transferred to the Normal Timelock by the deploy script).
- Grant the same ACM permissions established in VIP-675 against the new addresses: configuration functions to the Normal Timelock; epoch operations (issue/issueBatch/burn/burnBatch, setMintThreshold, recordCycleSnapshot on PrimeV2 and initializeStakers/finalizeInitialization on PrimeLeaderboard) to both the Normal Timelock and the Guardian; pause/unpause to all three timelocks; and the testnet-only resetCycle to the Normal Timelock and the Guardian on both contracts.
- Wire the new pair by setting PrimeLeaderboard on PrimeV2 and PrimeV2 on PrimeLeaderboard.
- Repoint the shared hooks from the old pair to the new one: PrimeLiquidityProvider.setPrimeToken, XVS Vault prime hook (reward token XVS, pool 1 unchanged), and the Core pool Comptroller prime address.
- Re-add the Core pool markets (vUSDT, vUSDC, vBTC, vETH) to the new PrimeV2 with the same supply/borrow multipliers.
- Re-open the permissionless mint window via setMintThreshold.

The legacy Prime was already paused by VIP-675, so no togglePause is included here. Re-seeding existing stakers into the new PrimeLeaderboard (initializeStakers + finalizeInitialization) is performed off-chain by the Guardian after this addendum executes; the compressed leaderboard multiplier tiers from addendum 1 are NOT carried over and can be re-applied by the Normal Timelock via setMultiplierTiers if needed.

#### References

- Original VIP-675 (PrimeV2 / PrimeLeaderboard setup): https://github.com/VenusProtocol/vips/pull/712`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. Accept ownership of the redeployed contracts (deploy script transferred to NormalTimelock).
      {
        target: PRIME_V2,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: PRIME_LEADERBOARD,
        signature: "acceptOwnership()",
        params: [],
      },

      // 2. Grant ACM permissions against the NEW addresses (incl. testnet-only resetCycle).
      ...PRIME_V2_PERMISSIONS,
      ...PRIME_LEADERBOARD_PERMISSIONS,

      // 3. Wire the new pair (ACM-gated; deploy does NOT wire).
      {
        target: PRIME_V2,
        signature: "setPrimeLeaderboard(address)",
        params: [PRIME_LEADERBOARD],
      },
      {
        target: PRIME_LEADERBOARD,
        signature: "setPrimeV2(address)",
        params: [PRIME_V2],
      },

      // 4. Repoint the shared hooks from the old pair to the new one.
      {
        target: PLP,
        signature: "setPrimeToken(address)",
        params: [PRIME_V2],
      },
      {
        target: XVS_VAULT,
        signature: "setPrimeToken(address,address,uint256)",
        params: [PRIME_LEADERBOARD, XVS, XVS_VAULT_POOL_ID],
      },
      {
        target: COMPTROLLER,
        signature: "setPrimeToken(address)",
        params: [PRIME_V2],
      },

      // 5. Re-add the Prime markets on the new PrimeV2.
      ...PRIME_MARKETS.map(market => ({
        target: PRIME_V2,
        signature: "addMarket(address,uint256,uint256)",
        params: [market.vToken, market.supplyMultiplier, market.borrowMultiplier],
      })),

      // 6. Re-open the permissionless mint window.
      {
        target: PRIME_V2,
        signature: "setMintThreshold(uint256,uint256)",
        params: [MINT_THRESHOLD, MINT_DEADLINE],
      },

      // Note: no LEGACY_PRIME.togglePause() — the legacy Prime was already paused by VIP-675.
      // Staker seeding (initializeStakers + finalizeInitialization) on the new PrimeLeaderboard is
      // performed off-chain by the Guardian after execution.
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip675Addendum3;
