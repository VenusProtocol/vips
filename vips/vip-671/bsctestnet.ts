import { Command, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ACM,
  DEFAULT_PROXY_ADMIN,
  DEVIATION_BOUNDED_ORACLE,
  NORMAL_TIMELOCK,
  PROTOCOL_SHARE_RESERVE,
  PROTOCOL_SHARE_RESERVE_IMPL,
  RESILIENT_ORACLE,
  RISK_FUND_BUYBACK,
  RISK_FUND_CONVERTER,
  SPOKE_COMPTROLLER,
  SPOKE_POOL_REGISTRY,
  VTREASURY,
} from "./addresses/bsctestnet";
import {
  CLOSE_FACTOR,
  COLLATERAL_MARKET,
  DBO_COOLDOWN_PERIOD,
  DBO_ENABLE_BOUNDED_PRICING,
  DBO_ENABLE_CACHING,
  DBO_RESET_THRESHOLD,
  DBO_TRIGGER_THRESHOLD,
  LIQUIDITY_MARKET,
  MARKETS,
  MIN_LIQUIDATABLE_COLLATERAL,
  POOL_LIQUIDATION_INCENTIVE,
  POOL_NAME,
  REDUCE_RESERVES_BLOCK_DELTA,
  RISK_FUND_SHARE_BPS,
  SCHEMA_LIQUIDATION,
  SCHEMA_SPREAD,
  SpokeMarket,
} from "./config";
import { REGISTRY_DRIVEN_ROLES, SPOKE_COMPTROLLER_ROLES, giveCallPermission } from "./permissions";

// ===================================================================================================
// VIP-671 [BNB Chain Testnet] — Hub-Funded Spoke pool, PHASE 1: the spoke pool itself.
//
// SCOPE. This VIP covers only the work in isolated-pools#559: stand the spoke pool up, register it in
// its own registry, list its markets, and grant the permissions that pool needs. Two things are
// deliberately NOT here and ship as Phase 2:
//   - Liquidity Hub integration (venus-liquidity-hub#22): addResource, addYieldGroup, the inner and
//     outer queues, and `setAllowedSupplier` for the Hub's spoke source.
//   - bStock liquidation (venus-protocol#707): BStockLiquidator is not deployed on this chain at all.
//
// STATUS. Address-complete. The whole spoke stack and the new ProtocolShareReserve implementation are
// deployed on bsctestnet, and every address here was read back from the chain rather than taken from a
// deployment record alone.
//
// ---------------------------------------------------------------------------------------------------
// WHY THIS POOL HAS A REGISTRY OF ITS OWN
//
// The registry is the directory every consumer iterates to answer "which pools exist": `getAllPools`
// drives the indexer, the frontend pool list and the risk tooling, and `getVTokenForAsset` is what
// ProtocolShareReserve uses as a membership check. A pool whose supply side is restricted to known
// accounts does not belong in that list, so isolated-pools#559 gives it a second `PoolRegistry`
// instance. Two consequences run through this whole VIP:
//   - The spoke comptroller bakes that registry in as a CONSTRUCTOR IMMUTABLE and `supportMarket`
//     checks `msg.sender == poolRegistry`. There is no `setPoolRegistry` on this fork, so the
//     implementation must have been constructed with SPOKE_POOL_REGISTRY. Nothing in this VIP can fix
//     a mismatch.
//   - The ACM wildcard grants that let the isolated-pools registry configure a comptroller name THAT
//     registry as the account. The spoke registry inherits none of them. See step 2.
//
// ---------------------------------------------------------------------------------------------------
// ORDER IS LOAD-BEARING. Do not reshuffle these:
//
//  1. Both `acceptOwnership()` calls FIRST. The deploy scripts leave the comptroller and the registry
//     Ownable2Step-nominated, so the deployer is still the live owner and every owner-gated setter
//     reverts until these land. (The two beacons are plain `Ownable` and are handed over inside the
//     deploy transaction, so they need no command.)
//  2. The registry's six ACM grants BEFORE `addPool`. `PoolRegistry` drives those setters on the
//     comptroller as `msg.sender`; without them `addPool` reverts at execution.
//  3. `setPriceOracle` BEFORE `addPool`. `addPool` dereferences `comptroller.oracle()` and rejects
//     the zero address.
//  4. `setDeviationBoundedOracle` BEFORE the pool serves anyone. `_updateProtectionStates` calls into
//     it with no zero check on every borrow, and on every redeem by an account that has entered a
//     market, so both fail closed while it is unset. Supplying still works, since `preMintHook` reads
//     no price.
//  5. `addMarket` BEFORE `setSupplyAllowlistEnabled`. `addMarket` seeds initial supply through
//     `mintBehalf`, and `preMintHook` gates the account CREDITED with the vTokens, so arming the
//     allowlist first would block the registry's own seed mint. It cannot be armed first anyway:
//     `setSupplyAllowlistEnabled` reverts `MarketNotListed` on an unlisted market.
//
// ---------------------------------------------------------------------------------------------------
// PERMISSIONS ALREADY COVERED ON THIS CHAIN
//   Verified against ACM 0x45f8…a9AA at block 129,788,112. The Normal Timelock holds wildcard
//   (address(0)-keyed) grants for every shared Comptroller, VToken and PoolRegistry role this listing
//   uses, and a wildcard reaches a brand-new contract, so the new comptroller and the new registry
//   inherit them. Only what is in ./permissions.ts is missing. Full detail lives there.
//
// ---------------------------------------------------------------------------------------------------
// CROSS-REPO DEPENDENCY — see step 4.
//   ProtocolShareReserve stores ONE pool registry and rejects income from any non-core pool that
//   registry does not know. `VToken` calls `updateAssetsState` unconditionally when reducing reserves
//   AND when seizing the protocol's share of liquidated collateral, so a spoke pool whose registry PSR
//   does not know has EVERY LIQUIDATION REVERT, after the collateral has already moved.
//   protocol-reserve#168 fixes this by letting PSR resolve through more than one registry. This VIP
//   carries the proxy upgrade and the `addPoolRegistry` call together, which that PR requires.
// ===================================================================================================

/// Mint the seed to the Timelock, list the market through the spoke registry, then drop the approval
/// back to zero.
///
/// The mocked USDT and USDC on this chain expose `allocateTo(address,uint256)`, NOT the
/// `faucet(uint256)` the bStock mocks carry, so no treasury withdrawal is needed. Verified against the
/// deployed bytecode: the `faucet` selector is absent from both. Same pattern as VIP-195 and VIP-198.
const listMarket = (m: SpokeMarket): Command[] => [
  {
    target: m.vToken,
    signature: "setReduceReservesBlockDelta(uint256)",
    params: [REDUCE_RESERVES_BLOCK_DELTA],
  },
  {
    target: m.vToken,
    signature: "setReserveFactor(uint256)",
    params: [m.reserveFactor],
  },
  {
    target: m.underlying,
    signature: "allocateTo(address,uint256)",
    params: [NORMAL_TIMELOCK, m.initialSupply],
  },
  {
    target: m.underlying,
    signature: "approve(address,uint256)",
    params: [SPOKE_POOL_REGISTRY, m.initialSupply],
  },
  {
    target: SPOKE_POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [m.vToken, m.collateralFactor, m.liquidationThreshold, m.initialSupply, VTREASURY, m.supplyCap, m.borrowCap],
    ],
  },
  {
    target: m.underlying,
    signature: "approve(address,uint256)",
    params: [SPOKE_POOL_REGISTRY, 0],
  },
];

export const vip671 = () => {
  const meta = {
    version: "v2",
    title: "VIP-671 [BNB Chain Testnet] Hub-Funded Spoke pool: list the pool and its markets",
    description: `#### Summary

If passed, this VIP will register the first **Hub-Funded Spoke pool** on BNB Chain testnet, in a pool registry of its own, and list its two markets.

A Hub-Funded Spoke pool is one pool whose two sides are controlled separately:

- **Liquidity side (USDT)** — borrowable, but supply is restricted to a per-market allowlist. The protocol therefore meters exactly how much liquidity the pool holds and what its utilisation is.
- **Collateral side (USDC)** — permissionless to supply, and usable as collateral against a USDT borrow.

Both markets are capped, and the pool has its own Comptroller and its own registry, so a depeg, an oracle problem or bad debt in this pool is contained to it and cannot reach the Core pool or the existing isolated pools.

Risk parameters mirror the isolated pools' Stablecoins pool on this network. This pool restricts who may supply, borrow and liquidate; it does not take more risk per market.

#### Proposed changes

1. Accept ownership of the new spoke Comptroller and of the new spoke pool registry, and point the Comptroller at the **ResilientOracle** and the **DeviationBoundedOracle**. The second is required before the pool serves any borrow or redeem.
2. Grant the spoke registry the six Comptroller setters it drives while registering a pool, and grant the Normal Timelock the roles that exist only on this pool: the supply allowlist, the liquidation allowlist, and the per-market liquidation incentive, plus forced liquidation. No new permission is given to any other timelock, or to the Guardian.
3. Upgrade the **ProtocolShareReserve** so it can resolve markets through more than one pool registry, and register the spoke registry alongside the existing one. Without this the pool cannot report income and its liquidations would revert. The existing isolated pools are unaffected: their registry stays the primary one and is still checked first.
4. Move the risk fund's 20% share of protocol income from the legacy **RiskFundConverter** to **RiskFundBuyback**, on both income schemas. BNB Chain mainnet made this same move in VIP-618 and testnet was left behind, and the old contract is the one income destination that cannot resolve a pool outside its own registry. The share itself is unchanged, only the destination.
5. Register the pool and list both markets, each seeded with 10,000 of its underlying, capped at 1,000,000 supply and 400,000 borrow, with an 80% collateral factor and an 88% liquidation threshold.
6. Set the per-market liquidation discount on both markets, and restrict supply on the USDT market to its allowlist.

#### Notes

- Testnet only. No Hub-Funded Spoke pool is deployed on any mainnet.
- This is the first of two proposals. Connecting the pool's liquidity side to the Liquidity Hub is a separate proposal.
- The USDT market's supply allowlist ships **enabled with no members**, so nobody can supply it until the second proposal authorises the Hub's spoke source. Redeeming is never restricted, and the seed supply minted at listing is unaffected.
- Exit is never gated: repay, redeem, withdraw and transfer stay permissionless, and the pool keeps the usual market-level pause controls.
- Liquidation stays permissionless. The optional liquidation allowlist ships disabled.
- Both markets keep the 10% reserve factor and 5% protocol seize share they were deployed with.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // -------------------------------------------------------------------------------------------
      // 1. Take ownership of both Ownable2Step contracts. Everything owner-gated below depends on
      //    these two landing first.
      //
      //    Not here on purpose: SpokeComptrollerBeacon and the spoke VTokenBeacon are plain `Ownable`
      //    and the deploy scripts transfer them inside the deploy transaction, and the SpokePoolLens
      //    has no owner, no AccessControlManager and no state-changing function at all. None of the
      //    three needs a governance command. See ./addresses/bsctestnet.ts.
      // -------------------------------------------------------------------------------------------
      { target: SPOKE_POOL_REGISTRY, signature: "acceptOwnership()", params: [] },
      { target: SPOKE_COMPTROLLER, signature: "acceptOwnership()", params: [] },

      // -------------------------------------------------------------------------------------------
      // 2. ACM grants.
      //
      //    2a. The six setters the registry drives on the comptroller during `addPool`/`addMarket`.
      //        The account is the SPOKE REGISTRY, not a timelock. The identical wildcard grants that
      //        already exist name the isolated-pools registry, so none of them carry over and
      //        `addPool` in step 5 reverts without these.
      // -------------------------------------------------------------------------------------------
      ...REGISTRY_DRIVEN_ROLES.map(signature =>
        giveCallPermission(ACM, SPOKE_COMPTROLLER, signature, SPOKE_POOL_REGISTRY),
      ),

      //    2b. The roles that exist only on this fork, plus forced liquidation. Verified not granted
      //        to any timelock on this chain. Everything else the listing needs is already held by the
      //        timelocks as a wildcard, so it is not re-granted here. See ./permissions.ts.
      //
      //        NORMAL TIMELOCK ONLY. The Fast-track and Critical timelocks get nothing from this VIP.
      //        A grant is cheap to add later and awkward to take back, so the emergency timelocks stay
      //        off a pool that has not run yet; if an incident needs one of them, it can be granted
      //        then. Note this leaves the pool's pause path on the Normal Timelock as well, since the
      //        Fast-track and Critical wildcards for `setActionsPaused(address[],uint256[],bool)` do
      //        already reach this comptroller. Those are pre-existing and this VIP does not touch them.
      ...SPOKE_COMPTROLLER_ROLES.map(signature =>
        giveCallPermission(ACM, SPOKE_COMPTROLLER, signature, NORMAL_TIMELOCK),
      ),

      // -------------------------------------------------------------------------------------------
      // 3. Oracles. Both are onlyOwner, so they follow acceptOwnership; `setPriceOracle` also has to
      //    precede `addPool`, which rejects a zero oracle.
      //
      //    Both oracles key their config on the UNDERLYING (the bounded oracle resolves
      //    `vToken.underlying()` first), so the new spoke vTokens inherit whatever USDT and USDC
      //    already carry and the ResilientOracle, which prices both, needs no command.
      // -------------------------------------------------------------------------------------------
      { target: SPOKE_COMPTROLLER, signature: "setPriceOracle(address)", params: [RESILIENT_ORACLE] },
      {
        target: SPOKE_COMPTROLLER,
        signature: "setDeviationBoundedOracle(address)",
        params: [DEVIATION_BOUNDED_ORACLE],
      },

      // -------------------------------------------------------------------------------------------
      // 3b. Give USDC the price window USDT already has, so both sides of the pool are priced the same
      //     way. Without this the collateral market prices at spot while the liquidity market prices
      //     through a bounded window: not a revert, `_updateAndGetBoundedPrices` returns spot for an
      //     asset with bounded pricing disabled, but an inconsistency inside one pool.
      //
      //     Every parameter is USDT's live configuration, read off the oracle rather than chosen here.
      //     The oracle seeds the window itself, reading the current spot into both minPrice and
      //     maxPrice, so no price is passed and there is nothing to time.
      //
      //     USDT is deliberately NOT re-configured: `_setTokenConfig` reverts `MarketAlreadyInitialized`
      //     for an asset that already has a config, so this is the collateral market only.
      //
      //     No ACM grant needed, all three timelocks already hold this role against the oracle. The
      //     role string is the EXPANDED tuple, not the struct name, unlike PoolRegistry's `addMarket`.
      // -------------------------------------------------------------------------------------------
      {
        target: DEVIATION_BOUNDED_ORACLE,
        signature: "setTokenConfig((address,uint64,uint256,uint256,bool,bool))",
        params: [
          [
            COLLATERAL_MARKET.underlying,
            DBO_COOLDOWN_PERIOD,
            DBO_TRIGGER_THRESHOLD,
            DBO_RESET_THRESHOLD,
            DBO_ENABLE_BOUNDED_PRICING,
            DBO_ENABLE_CACHING,
          ],
        ],
      },

      // -------------------------------------------------------------------------------------------
      // 4. ProtocolShareReserve: upgrade to the multi-registry implementation, then register the spoke
      //    registry alongside the existing one. Both calls are owner-gated and both owners are the
      //    Normal Timelock (the proxy admin's owner and PSR's owner), so neither needs an ACM grant.
      //
      //    THESE TWO MUST STAY TOGETHER, IN THIS ORDER, IN THIS PROPOSAL. protocol-reserve#168 makes
      //    that a rollout requirement: the upgrade alone leaves the spoke registry unknown, and
      //    `addPoolRegistry` does not exist before it.
      //
      //    Why it is load-bearing rather than housekeeping: PSR rejects income from a non-core pool
      //    its registries do not know, and `VToken` calls `updateAssetsState` unconditionally both in
      //    `_reduceReservesFresh` and in the protocol-seize path (VToken.sol:1314). Without this, every
      //    liquidation in this pool reverts, after the collateral has already moved.
      //
      //    Do NOT substitute `setPoolRegistry`. It REPLACES the primary registry, which would stop
      //    every live isolated pool from taking income and revert their liquidations the block it
      //    lands. Both directions of that trade are pinned in
      //    isolated-pools/tests/hardhat/Fork/HubSpoke/psrRegistryConflict.ts. After this VIP the
      //    isolated-pools registry stays primary and is probed first; the spoke registry is additional.
      //
      //    The upgrade is storage-safe on its own: new state is appended at slots 305/306, 301-304 are
      //    untouched, so there is no reinitializer and no migration. `maxLoopsLimit` is 20 on this
      //    chain, so the one additional registry clears the bound `addPoolRegistry` enforces.
      //
      //    This resolves PSR itself. The one income DESTINATION that still cannot resolve this pool is
      //    handled separately in step 4b.
      // -------------------------------------------------------------------------------------------
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [PROTOCOL_SHARE_RESERVE, PROTOCOL_SHARE_RESERVE_IMPL],
      },
      {
        target: PROTOCOL_SHARE_RESERVE,
        signature: "addPoolRegistry(address)",
        params: [SPOKE_POOL_REGISTRY],
      },

      // -------------------------------------------------------------------------------------------
      // 4b. Move the risk-fund income share off `RiskFundConverter`, which is the one destination that
      //     would still revert for this pool.
      //
      //     `_releaseFund` transfers to every destination and then calls `updateAssetsState` on it,
      //     unguarded (ProtocolShareReserve.sol:491). `RiskFundConverter` resolves the paying pool
      //     through a single `poolRegistry` of its own, which step 4 does not touch, and reverts
      //     `MarketNotExistInPool` for a comptroller it does not know. So without this,
      //     `releaseFunds(SPOKE_COMPTROLLER, ...)` reverts the moment this pool has income.
      //     Reproduced against the live contracts: called as ProtocolShareReserve with an unknown
      //     comptroller, `RiskFundConverter` reverts 0x983f1fb5 and every other destination on this
      //     chain returns cleanly.
      //
      //     This is drift, not a decision: bscmainnet retired `RiskFundConverter` in VIP-618 and moved
      //     the same 20% of both schemas to `RiskFundBuyback`, but that VIP's testnet leg never
      //     repointed the distribution config. `RiskFundBuyback` is already deployed here, so this is
      //     the mainnet shape rather than a new allocation, and the totals are unchanged.
      //
      //     Both rows move in ONE call because `_ensurePercentages` runs at the end of it and requires
      //     each schema to total exactly 100% or 0. Zeroing the old rows in a separate proposal would
      //     leave both schemas at 80% and revert.
      //     Schema 0 is SPREAD, schema 1 is LIQUIDATION. Both currently sit at 2000 bps.
      //
      //     No ACM grant needed: all three timelocks already hold both role strings against PSR
      //     (checked on chain). The strings are `addOrUpdateDistributionConfigs(DistributionConfig[])`
      //     and `removeDistributionConfig(Schema,address)`, which carry the struct and enum names
      //     rather than the expanded types, so they differ from the call signatures below.
      // -------------------------------------------------------------------------------------------
      {
        target: PROTOCOL_SHARE_RESERVE,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            [SCHEMA_SPREAD, 0, RISK_FUND_CONVERTER],
            [SCHEMA_LIQUIDATION, 0, RISK_FUND_CONVERTER],
            [SCHEMA_SPREAD, RISK_FUND_SHARE_BPS, RISK_FUND_BUYBACK],
            [SCHEMA_LIQUIDATION, RISK_FUND_SHARE_BPS, RISK_FUND_BUYBACK],
          ],
        ],
      },
      // `removeDistributionConfig` only deletes a row whose percentage is already zero, which the call
      // above has just made true. Without these the zeroed rows stay in the array and keep costing a
      // transfer-check loop iteration on every release.
      {
        target: PROTOCOL_SHARE_RESERVE,
        signature: "removeDistributionConfig(uint8,address)",
        params: [SCHEMA_SPREAD, RISK_FUND_CONVERTER],
      },
      {
        target: PROTOCOL_SHARE_RESERVE,
        signature: "removeDistributionConfig(uint8,address)",
        params: [SCHEMA_LIQUIDATION, RISK_FUND_CONVERTER],
      },

      // -------------------------------------------------------------------------------------------
      // 5. Register the pool. The registry pushes closeFactor, the pool-wide liquidation incentive and
      //    minLiquidatableCollateral into the Comptroller itself, under the grants from step 2a.
      //    The pool-wide incentive must be >= 1.05e18: this fork raises the upstream 1e18 floor to
      //    1e18 + the VToken default protocol seize share.
      // -------------------------------------------------------------------------------------------
      {
        target: SPOKE_POOL_REGISTRY,
        signature: "addPool(string,address,uint256,uint256,uint256)",
        params: [POOL_NAME, SPOKE_COMPTROLLER, CLOSE_FACTOR, POOL_LIQUIDATION_INCENTIVE, MIN_LIQUIDATABLE_COLLATERAL],
      },

      // -------------------------------------------------------------------------------------------
      // 6. List the markets. Liquidity market first, so it is listed and seeded before its supply
      //    allowlist is armed in step 8.
      // -------------------------------------------------------------------------------------------
      ...MARKETS.flatMap(listMarket),

      // -------------------------------------------------------------------------------------------
      // 7. Per-market liquidation discounts, keyed on the COLLATERAL market: the discount prices the
      //    collateral being seized, not the debt being repaid (PRD FR-5). A market left unset inherits
      //    the pool-wide value; pinning it explicitly keeps it from moving if the pool default is
      //    retuned later, and exercises the spoke-only setter on this chain.
      //
      //    Floor: 1e18 + that market's `protocolSeizeShareMantissa`. Both markets were deployed with
      //    the 5% default, so the floor is 1.05e18 and the 1.1e18 set here clears it. To go BELOW that,
      //    `VToken.setProtocolSeizeShare` has to be lowered FIRST: it reads the incentive back through
      //    `liquidationIncentiveMantissa()`, which resolves per calling market, and rejects
      //    `share + 1e18 > incentive`. The two setters bound each other.
      //
      //    `setProtocolSeizeShare` is deliberately not called: both markets keep the 5% they were
      //    deployed with.
      // -------------------------------------------------------------------------------------------
      ...MARKETS.map(
        (m): Command => ({
          target: SPOKE_COMPTROLLER,
          signature: "setMarketLiquidationIncentive(address,uint256)",
          params: [m.vToken, m.liquidationIncentive],
        }),
      ),

      // -------------------------------------------------------------------------------------------
      // 8. Arm the supply allowlist on the liquidity market, with NO members.
      //
      //    This is the Phase 1 boundary, and it is the safe side of it. The market is closed to supply
      //    from the moment it is listed, so it can never be supplied permissionlessly in the window
      //    before the Hub arrives. Phase 2 adds the Hub's spoke source with
      //    `setAllowedSupplier(vUSDT_HubSpoke, <spoke source>, true)`.
      //
      //    The allowlist meters the account CREDITED with the vTokens, not the one paying, and it
      //    gates `preMintHook` only. Redeeming is never restricted, and the seed supply minted to the
      //    treasury during `addMarket` is unaffected.
      //
      //    The USDC market is left permissionless: PRD FR-4 makes the collateral-deposit allowlist
      //    optional and off by default.
      // -------------------------------------------------------------------------------------------
      {
        target: SPOKE_COMPTROLLER,
        signature: "setSupplyAllowlistEnabled(address,bool)",
        params: [LIQUIDITY_MARKET.vToken, true],
      },

      // -------------------------------------------------------------------------------------------
      // NOT IN THIS PROPOSAL, and not an oversight:
      //
      //  - `setLiquidationAllowlistEnabled(false)` — the pool-wide liquidation allowlist already
      //    defaults to disabled, so a command setting it to false would be a no-op. The role is
      //    granted in step 2b so governance can turn it on without a follow-up VIP.
      //  - `enterMarketBehalf(address,address)` — granted only to a router that passes its own caller
      //    through as `account`, and no router is deployed on this chain. See ./permissions.ts.
      //  - `addRewardsDistributor` — no rewards programme is defined for this pool.
      //  - Liquidity Hub wiring and the bStock liquidation leg — Phase 2, see the scope note above.
      //
      // STILL OPEN before proposing: protocol-reserve#168 has to MERGE. Its implementation is deployed
      // and this VIP upgrades to it, but proposing against an unmerged branch would adopt code that can
      // still change.
      //
      // Covered by simulations/vip-671/bsctestnet.ts, which asserts the pre-VIP deployment state, every
      // command, and the post-VIP state. It also pins the two things most expensive to get wrong: that
      // `SpokeComptroller.poolRegistry()` is the spoke registry, a constructor immutable no VIP can
      // fix, and that the live isolated pools still resolve through ProtocolShareReserve after the
      // upgrade.
      // -------------------------------------------------------------------------------------------
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip671;
