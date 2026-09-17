import { Command, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ACM,
  BORROW_ACTION,
  CLOSE_FACTOR,
  COLLATERAL_MARKETS,
  DEFAULT_PROXY_ADMIN,
  DEVIATION_BOUNDED_ORACLE,
  LIQUIDITY_MARKET,
  MARKETS,
  MAX_LOOPS_LIMIT,
  MIN_LIQUIDATABLE_COLLATERAL,
  NORMAL_TIMELOCK,
  PENDING,
  POOL_LIQUIDATION_INCENTIVE,
  POOL_NAME,
  PROTOCOL_SHARE_RESERVE,
  PROTOCOL_SHARE_RESERVE_IMPL,
  REDUCE_RESERVES_BLOCK_DELTA,
  RESILIENT_ORACLE,
  SPOKE_COMPTROLLER,
  SPOKE_POOL_REGISTRY,
  SpokeMarketDraft,
  USDT_DBO_CONFIG,
  VTREASURY,
} from "./addresses/bscmainnet";
import { REGISTRY_DRIVEN_ROLES, SPOKE_COMPTROLLER_ROLES, giveCallPermission } from "./permissions";

// ===================================================================================================
// VIP-671 [BNB Chain] — Hub-Funded Spoke pool, PHASE 1: the spoke pool itself.
//
// SCOPE. Stand the spoke pool up, register it in a registry of its own, list its markets, and grant
// the permissions that pool needs. Two things are deliberately NOT here and ship as Phase 2:
//   - Liquidity Hub integration (venus-liquidity-hub#22): addResource, addYieldGroup, the inner and
//     outer queues, and `setAllowedSupplier` for the Hub's spoke source.
//   - bStock liquidation (venus-protocol#707): BStockLiquidator is live for the Core pool but does not
//     serve a spoke pool yet.
//
// ---------------------------------------------------------------------------------------------------
// STATUS: DRAFT. THIS PROPOSAL CANNOT BE BUILT YET, AND THAT IS ENFORCED RATHER THAN DOCUMENTED.
//
// The spoke stack is not deployed on bscmainnet, the multi-registry ProtocolShareReserve
// implementation is not deployed, and no risk parameter has been agreed. Every one of those is a
// `PENDING` address or a `null` in ./addresses/bscmainnet.ts, and the collector at the bottom of this
// file throws with the full list of what is still missing rather than letting a half-filled proposal
// compile, simulate or be proposed.
//
// Two things to finish alongside the numbers:
//   - The `description` in `meta` still carries TBD markers. Voters read it; fill them from the same
//     values, not from a second source.
//   - simulations/vip-671/bscmainnet.ts does not exist yet. Section "BEFORE THE PROPOSAL IS OPENED"
//     below lists what it has to assert.
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
//     reverts until these land. (Both beacons are plain `Ownable` and are handed over inside the
//     deploy transaction, so they need no command.)
//  2. The registry's six ACM grants BEFORE `addPool`. `PoolRegistry` drives those setters on the
//     comptroller as `msg.sender`; without them `addPool` reverts at execution.
//  3. `setPriceOracle` BEFORE `addPool`. `addPool` dereferences `comptroller.oracle()` and rejects
//     the zero address.
//  4. `setDeviationBoundedOracle` BEFORE the pool serves anyone. `_updateProtectionStates` calls into
//     it with no zero check on every borrow, and on every redeem by an account that has entered a
//     market, so both fail closed while it is unset. Supplying still works, since `preMintHook` reads
//     no price.
//  5. `setProtocolSeizeShare` BEFORE `setMarketLiquidationIncentive`, where the seize share is being
//     changed at all. The per-market incentive floor is `MANTISSA_ONE + protocolSeizeShareMantissa()`,
//     read at call time, so moving the share afterwards can leave a market below its own floor.
//  6. `addMarket` BEFORE `setSupplyAllowlistEnabled`. `addMarket` seeds initial supply through
//     `mintBehalf`, and `preMintHook` gates the account CREDITED with the vTokens, so arming the
//     allowlist first would block the registry's own seed mint. It cannot be armed first anyway:
//     `setSupplyAllowlistEnabled` reverts `MarketNotListed` on an unlisted market.
//
// ---------------------------------------------------------------------------------------------------
// PERMISSIONS ALREADY COVERED ON THIS CHAIN
//   The Normal Timelock holds wildcard (address(0)-keyed) grants for every shared Comptroller, VToken
//   and PoolRegistry role this listing uses, and a wildcard reaches a brand-new contract, so the new
//   comptroller and the new registry inherit them. Only the twelve grants in step 2 are missing.
//
//   Those inherited grants are the assumption this VIP is most exposed to, because nothing in the
//   proposal touches them and a revocation would only surface at execution. They are therefore listed
//   as `ASSUMED_WILDCARD_ROLES` in ./addresses/bscmainnet.ts rather than as prose, to be asserted
//   BEFORE the proposal runs in the simulation.
//
// ---------------------------------------------------------------------------------------------------
// CROSS-REPO DEPENDENCY — see step 5.
//   ProtocolShareReserve stores ONE pool registry and rejects income from any non-core pool that
//   registry does not know. `VToken` calls `updateAssetsState` unconditionally when reducing reserves
//   AND when seizing the protocol's share of liquidated collateral, so a spoke pool whose registry PSR
//   does not know has EVERY LIQUIDATION REVERT, after the collateral has already moved.
//   protocol-reserve#168 fixes this by letting PSR resolve through more than one registry. This VIP
//   carries the proxy upgrade and the `addPoolRegistry` call together, which that PR requires.
//
// ---------------------------------------------------------------------------------------------------
// NOT IN THIS PROPOSAL, AND NOT AN OVERSIGHT:
//
//  - Any grant to the Guardian, the Fast-track Timelock or the Critical Timelock. The Guardian already
//    holds `unlistMarket` and `setActionsPaused` as wildcards, so the emergency pause path reaches this
//    pool from its first block. What it does not get is the six spoke-only setters, so every allowlist
//    flip in an incident needs a Normal Timelock proposal. That is a deliberate mainnet choice and the
//    opposite of the bsctestnet listing, where the Guardian holds all six so QA can drive the pool
//    without a proposal per test case.
//  - `setLiquidationAllowlistEnabled(false)` — the pool-wide liquidation allowlist already defaults to
//    disabled, so a command setting it to false would be a no-op. The role is granted so the lever
//    stays reachable. One trap if it is ever turned on: enabling it with nobody on the list freezes
//    every seizure in the pool, and it gates `healAccount` too, so the bad-debt keeper has to be listed
//    and not just the liquidators.
//  - `setAllowedSupplier` for any account — the liquidity market ships closed. Phase 2 adds the Hub's
//    spoke source.
//  - `enterMarketBehalf(address,address)` — granted to nobody on this chain, and not granted here.
//    `HubRouter` (venus-liquidity-hub#24) is what needs it, in Phase 2, and the contract's own guidance
//    is to grant it only to a router that passes its own caller through as `account`.
//  - Any ProtocolShareReserve distribution change. bscmainnet already routes the risk fund's 2000 bps
//    on both schemas to RiskFundBuyback, and the legacy RiskFundConverter appears on neither schema.
//    That matters because RiskFundConverter resolves the paying pool through a single `poolRegistry` of
//    its own, which step 5 does not touch, and reverts `MarketNotExistInPool` for a comptroller that
//    registry does not know, which would take down every `releaseFunds` call naming this pool. It is
//    already correct here, so there is nothing to move. RE-READ THIS IMMEDIATELY BEFORE THE PROPOSAL
//    IS DRAFTED: if another proposal edits a distribution row meanwhile, any correction belongs in a
//    single `addOrUpdateDistributionConfigs` call, because `_ensurePercentages` requires each schema to
//    total exactly 10000 bps or 0.
//  - `addRewardsDistributor` — no rewards programme is defined for this pool.
//
// ---------------------------------------------------------------------------------------------------
// BEFORE THE PROPOSAL IS OPENED — what simulations/vip-671/bscmainnet.ts has to cover:
//
//  - Assert every permission this proposal RELIES ON but does not grant, BEFORE the proposal runs, so a
//    revoked wildcard breaks the simulation rather than the execution. `ASSUMED_WILDCARD_ROLES`,
//    `ASSUMED_PER_CONTRACT_ROLES` and `ASSUMED_GUARDIAN_ROLES` in ./addresses/bscmainnet.ts.
//  - Assert `pendingOwner()` on the registry and the comptroller before, and `owner()` after.
//  - Assert `Comptroller_HubSpoke.poolRegistry()` equals the deployed `SpokePoolRegistry`. A constructor
//    immutable with no setter, checked by `supportMarket`; a mismatch can only be fixed by redeploying.
//  - Assert `getPoolRegistries()` is unreachable before the upgrade and returns both registries after,
//    isolated-pools first, and that the live isolated pools still resolve through PSR afterwards.
//  - Assert both ProtocolShareReserve schemas still total 10000 bps after execution.
//  - Assert the DeviationBoundedOracle config of all four bStock assets is UNCHANGED by the proposal.
//  - Assert `mint` on the liquidity market reverts `SupplyNotAllowed` for an arbitrary account after
//    execution, and that redeem is unaffected.
//  - Assert `borrow` reverts on every collateral market, from both the zero cap and the pause.
//  - Assert `isLiquidationAllowlistEnabled()` is `false`.
//  - Re-read the distribution config and the DeviationBoundedOracle state AT HEAD, not at the fork
//    block. Both are live, governance-editable state. An asset configured on the bounded oracle between
//    the fork block and execution turns an already-passing simulation into a reverting proposal.
// ===================================================================================================

export const vip671 = () => {
  // Collects everything still unset, so building the proposal reports all of it at once instead of one
  // value per run. Local to this call, not module state, so a simulation that builds the proposal more
  // than once gets the same answer every time.
  const missing: string[] = [];

  const need = <T>(value: T | null, what: string): T => {
    if (value === null) {
      missing.push(what);
    }
    return value as T;
  };

  const deployed = (value: string, what: string): string => {
    if (value === PENDING) {
      missing.push(what);
    }
    return value;
  };

  const spokeRegistry = deployed(SPOKE_POOL_REGISTRY, "SpokePoolRegistry");
  const spokeComptroller = deployed(SPOKE_COMPTROLLER, "Comptroller_HubSpoke");
  const vTokenOf = (m: SpokeMarketDraft) => deployed(m.vToken, `${m.symbol}: vToken address`);

  /// Fund the seed from the VTreasury, list the market through the spoke registry, then drop the
  /// approval back to zero.
  ///
  /// The last four commands are a fixed chain: the Normal Timelock is `msg.sender` for the approval
  /// and for `addMarket`, so it has to actually hold the tokens, and the registry pulls them during
  /// `addMarket`. THE VTREASURY MUST ALREADY HOLD THE SEED AMOUNT OF EVERY UNDERLYING before the
  /// proposal executes, or the withdrawal reverts and the proposal dies with it.
  const listMarket = (m: SpokeMarketDraft): Command[] => {
    const vToken = vTokenOf(m);
    const initialSupply = need(m.initialSupply, `${m.symbol}: initialSupply`);

    return [
      // How often reserves sweep to the ProtocolShareReserve. No deploy script sets it and it is not
      // an `AddMarketInput` field, so this command is its only chance. Left at zero the sweep runs on
      // every accrual instead of once per window, which makes it the one market parameter a VIP author
      // can silently forget.
      {
        target: vToken,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [REDUCE_RESERVES_BLOCK_DELTA],
      },
      {
        target: vToken,
        signature: "setReserveFactor(uint256)",
        params: [need(m.reserveFactor, `${m.symbol}: reserveFactor`)],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [m.underlying, initialSupply, NORMAL_TIMELOCK],
      },
      {
        target: m.underlying,
        signature: "approve(address,uint256)",
        params: [spokeRegistry, initialSupply],
      },
      // The listing itself. The registry calls the comptroller as `msg.sender`, which is what the six
      // registry grants in step 2 exist for.
      //
      // `vTokenReceiver` is the VTreasury: it is who receives the vTokens minted against the seed. It
      // would otherwise be the Hub's YieldGroup, which does not exist in Phase 1, so the liquidity
      // market carries one non-Hub seed position. The allowlist still keeps every later mint out.
      {
        target: spokeRegistry,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            vToken,
            need(m.collateralFactor, `${m.symbol}: collateralFactor`),
            need(m.liquidationThreshold, `${m.symbol}: liquidationThreshold`),
            initialSupply,
            VTREASURY,
            need(m.supplyCap, `${m.symbol}: supplyCap`),
            need(m.borrowCap, `${m.symbol}: borrowCap`),
          ],
        ],
      },
      // Not decoration. A live approval left on the registry is a standing allowance from the Normal
      // Timelock.
      {
        target: m.underlying,
        signature: "approve(address,uint256)",
        params: [spokeRegistry, 0],
      },
    ];
  };

  const meta = {
    version: "v2",
    title: "VIP-671 Hub-Funded Spoke pool: list the pool and its markets",
    description: `#### Summary

If passed, this VIP will register the first **Hub-Funded Spoke pool** on BNB Chain, in a pool registry of its own, and list its five markets.

A Hub-Funded Spoke pool is one pool whose two sides are controlled separately:

- **Liquidity side (USDT)** — borrowable, but supply is restricted to a per-market allowlist and supplying it gives no borrow power. The protocol therefore meters exactly how much liquidity the pool holds and what its utilisation is.
- **Collateral side (TSLAB, NVDAB, SPCXB, SKHYB)** — permissionless to supply, usable as collateral against a USDT borrow, and not borrowable themselves.

Every market is capped, and the pool has its own Comptroller and its own registry, so a price problem or bad debt in this pool is contained to it and cannot reach the Core pool or the existing isolated pools.

#### Proposed changes

1. Accept ownership of the new spoke Comptroller and of the new spoke pool registry, and point the Comptroller at the **ResilientOracle** and the **DeviationBoundedOracle**. The second is required before the pool serves any borrow or withdrawal.
2. Grant the spoke registry the six Comptroller setters it drives while registering a pool, and grant the Normal Timelock the six roles that exist only on this pool: the supply allowlist, the liquidation allowlist, the per-market liquidation discount, and forced liquidation. Nothing is granted to the Guardian, the Fast-track timelock or the Critical timelock. The emergency pause path already reaches this pool without any new grant.
3. Upgrade the **ProtocolShareReserve** so it can resolve markets through more than one pool registry, and register the spoke registry alongside the existing one. Without this the pool cannot report income and its liquidations would revert. The existing isolated pools are unaffected: their registry stays the primary one and is still checked first.
4. Register the pool and list its five markets, each seeded from the Treasury. TBD(risk): state the seed size, supply caps, collateral factors and liquidation thresholds here, matching the values the markets are listed with.
5. Set the per-collateral liquidation discount on each collateral market, pause borrowing on all four of them on top of their zero borrow cap, and restrict supply on the USDT market to its allowlist.

#### Notes

- This is the first of two proposals. Connecting the pool's liquidity side to the Liquidity Hub is a separate proposal.
- The USDT market's supply allowlist ships **enabled with no members**, so nobody can supply it until the second proposal authorises the Hub's source. The market's cash is therefore the listing seed alone, and borrowing against collateral is capped at that seed until then.
- Redeeming is never restricted, and the seed supply minted at listing is unaffected by the allowlist.
- Exit is never gated: repay, redeem, withdraw and transfer stay permissionless, and the pool keeps the usual market-level pause controls.
- Liquidation stays permissionless. The optional liquidation allowlist ships disabled.
- Borrowing and withdrawal are priced through the DeviationBoundedOracle, which values collateral at the low end of its recent price window and debt at the high end while protection is active. It can only reduce borrowing capacity, never inflate it. Liquidation routing stays on spot prices.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  const commands: Command[] = [
    // -------------------------------------------------------------------------------------------
    // 1. Take ownership of both Ownable2Step contracts. Everything owner-gated below depends on these
    //    two landing first.
    //
    //    Not here on purpose: SpokeComptrollerBeacon and the spoke VTokenBeacon are plain `Ownable`
    //    and the deploy scripts transfer them inside the deploy transaction, and the SpokePoolLens has
    //    no owner, no AccessControlManager and no state-changing function at all. None of the three
    //    needs a governance command.
    // -------------------------------------------------------------------------------------------
    { target: spokeRegistry, signature: "acceptOwnership()", params: [] },
    { target: spokeComptroller, signature: "acceptOwnership()", params: [] },

    // -------------------------------------------------------------------------------------------
    // 2. ACM grants. Twelve, against one contract each, never as wildcards.
    //
    //    2a. The six setters the registry drives on the comptroller during `addPool` and `addMarket`.
    //        The account is the SPOKE REGISTRY, not a timelock.
    //
    //        THIS IS THE LIKELIEST WAY FOR THIS VIP TO FAIL. The identical wildcards exist on this
    //        chain, which makes these six look already granted, but they name the ISOLATED-POOLS
    //        registry as the account and the ACM matches the account exactly. The spoke registry is a
    //        different account and inherits nothing, so `addPool` in step 6 reverts without these.
    // -------------------------------------------------------------------------------------------
    ...REGISTRY_DRIVEN_ROLES.map(signature => giveCallPermission(ACM, spokeComptroller, signature, spokeRegistry)),

    //    2b. The roles that exist only on this fork, plus forced liquidation. Verified held by NOBODY
    //        on this chain: not the Normal Timelock, not the Fast-track or Critical timelock, not the
    //        Guardian, not the isolated-pools registry. Everything else this listing needs is already
    //        held by the Normal Timelock as a wildcard and is not re-granted.
    //
    //        Two of the six are called by this VIP (`setMarketLiquidationIncentive` and
    //        `setSupplyAllowlistEnabled`). The other four are granted so the levers stay reachable:
    //        `setAllowedSupplier` is what Phase 2 needs to put the Hub's YieldGroup on the allowlist,
    //        and a role nobody holds cannot be exercised in an incident either.
    ...SPOKE_COMPTROLLER_ROLES.map(signature => giveCallPermission(ACM, spokeComptroller, signature, NORMAL_TIMELOCK)),

    // -------------------------------------------------------------------------------------------
    // 3. Oracles. Both setters are `onlyOwner`, not ACM-gated, so they need no grant and only work
    //    after step 1. `setPriceOracle` also has to precede `addPool`, which rejects a zero oracle.
    //
    //    Both oracles key their config on the UNDERLYING (the bounded oracle resolves
    //    `vToken.underlying()` first), so the new spoke vTokens inherit whatever their underlying
    //    already carries. All five underlyings are live Core markets with a working ResilientOracle
    //    feed, so the ResilientOracle itself needs no command.
    // -------------------------------------------------------------------------------------------
    { target: spokeComptroller, signature: "setPriceOracle(address)", params: [RESILIENT_ORACLE] },
    {
      target: spokeComptroller,
      signature: "setDeviationBoundedOracle(address)",
      params: [DEVIATION_BOUNDED_ORACLE],
    },
  ];

  // -------------------------------------------------------------------------------------------
  // 3b. Correct the comptroller's loop limit, if the measurement says the initialization value is
  //     wrong. `onlyOwner`, so it also needs step 1. Omitted entirely when MAX_LOOPS_LIMIT is null,
  //     which is the normal case.
  // -------------------------------------------------------------------------------------------
  if (MAX_LOOPS_LIMIT !== null) {
    commands.push({
      target: spokeComptroller,
      signature: "setMaxLoopsLimit(uint256)",
      params: [MAX_LOOPS_LIMIT],
    });
  }

  // -------------------------------------------------------------------------------------------
  // 3c. Give the liquidity market's underlying a bounded price window, if Risk asks for one.
  //
  //     The four bStock assets are already configured, identically, for their Core markets, and the
  //     config is per underlying, so the spoke collateral markets inherit it with no command. USDT has
  //     no config at all.
  //
  //     USDT IS THE ONLY ASSET THAT MAY APPEAR HERE. `_setTokenConfig` reverts
  //     `MarketAlreadyInitialized(asset)` for an asset that already has a config, and takes the whole
  //     proposal down with it.
  //
  //     No ACM grant needed: the Normal Timelock already holds this role against the oracle. The role
  //     string is the EXPANDED tuple, not a struct name, unlike PoolRegistry's `addMarket`.
  // -------------------------------------------------------------------------------------------
  if (USDT_DBO_CONFIG !== null) {
    commands.push({
      target: DEVIATION_BOUNDED_ORACLE,
      signature: "setTokenConfig((address,uint64,uint256,uint256,bool,bool))",
      params: [
        [
          USDT_DBO_CONFIG.asset,
          USDT_DBO_CONFIG.cooldownPeriod,
          USDT_DBO_CONFIG.triggerThreshold,
          USDT_DBO_CONFIG.resetThreshold,
          USDT_DBO_CONFIG.enableBoundedPricing,
          USDT_DBO_CONFIG.enableCaching,
        ],
      ],
    });
  }

  commands.push(
    // -------------------------------------------------------------------------------------------
    // 4. ProtocolShareReserve: upgrade to the multi-registry implementation, then register the spoke
    //    registry alongside the existing one. Both calls are owner-gated and both owners are the
    //    Normal Timelock (the proxy admin's owner and PSR's owner), so neither needs an ACM grant.
    //
    //    THESE TWO MUST STAY TOGETHER, IN THIS ORDER, IN THIS PROPOSAL. protocol-reserve#168 makes
    //    that a rollout requirement: the upgrade alone leaves the spoke registry unknown, and
    //    `addPoolRegistry` does not exist before it.
    //
    //    Why it is load-bearing rather than housekeeping: PSR rejects income from a non-core pool its
    //    registries do not know, and `VToken` calls `updateAssetsState` unconditionally both in
    //    `_reduceReservesFresh` and in the protocol-seize path. Without this, every liquidation in this
    //    pool reverts, after the collateral has already moved.
    //
    //    Do NOT substitute `setPoolRegistry`. It REPLACES the primary registry, which would stop every
    //    live isolated pool from taking income and revert their liquidations the block it lands. After
    //    this VIP the isolated-pools registry stays primary and is probed first; the spoke registry is
    //    additional.
    // -------------------------------------------------------------------------------------------
    {
      target: DEFAULT_PROXY_ADMIN,
      signature: "upgrade(address,address)",
      params: [PROTOCOL_SHARE_RESERVE, deployed(PROTOCOL_SHARE_RESERVE_IMPL, "ProtocolShareReserve implementation")],
    },
    {
      target: PROTOCOL_SHARE_RESERVE,
      signature: "addPoolRegistry(address)",
      params: [spokeRegistry],
    },

    // -------------------------------------------------------------------------------------------
    // 5. Register the pool. The registry pushes closeFactor, the pool-wide liquidation incentive and
    //    minLiquidatableCollateral into the Comptroller itself, under the grants from step 2a.
    //
    //    The pool-wide incentive must be >= 1.05e18, the constant
    //    `MIN_POOL_LIQUIDATION_INCENTIVE_MANTISSA`, not 1e18. A value at or just above 1e18 fails here
    //    with `InvalidLiquidationIncentive`.
    // -------------------------------------------------------------------------------------------
    {
      target: spokeRegistry,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: [
        POOL_NAME,
        spokeComptroller,
        need(CLOSE_FACTOR, "CLOSE_FACTOR"),
        need(POOL_LIQUIDATION_INCENTIVE, "POOL_LIQUIDATION_INCENTIVE"),
        need(MIN_LIQUIDATABLE_COLLATERAL, "MIN_LIQUIDATABLE_COLLATERAL"),
      ],
    },

    // -------------------------------------------------------------------------------------------
    // 6. List the markets. Liquidity market first, so it is listed and seeded before its supply
    //    allowlist is armed in step 9.
    // -------------------------------------------------------------------------------------------
    ...MARKETS.flatMap(listMarket),
  );

  // -------------------------------------------------------------------------------------------
  // 7. Protocol seize share, per market, and only where the Risk value differs from what the vToken
  //    initializer set. Omitted entirely otherwise.
  //
  //    MUST PRECEDE STEP 8. `setMarketLiquidationIncentive` floors at
  //    `MANTISSA_ONE + protocolSeizeShareMantissa()`, read at call time, so raising the share after
  //    setting the incentive can leave a market below its own floor. The two setters bound each other
  //    from both sides: `setProtocolSeizeShare` rejects `share + 1e18 > incentive`.
  // -------------------------------------------------------------------------------------------
  for (const m of MARKETS) {
    if (m.protocolSeizeShare !== null) {
      commands.push({
        target: vTokenOf(m),
        signature: "setProtocolSeizeShare(uint256)",
        params: [m.protocolSeizeShare],
      });
    }
  }

  // -------------------------------------------------------------------------------------------
  // 8. Per-collateral liquidation discount. Keyed on the COLLATERAL market, because the discount
  //    prices the collateral being seized rather than the debt being repaid.
  //
  //    The liquidity market is deliberately absent: its collateral factor is 0, so it is never the
  //    collateral leg of a liquidation, and a market left unset inherits the pool-wide value anyway.
  // -------------------------------------------------------------------------------------------
  for (const m of COLLATERAL_MARKETS) {
    commands.push({
      target: spokeComptroller,
      signature: "setMarketLiquidationIncentive(address,uint256)",
      params: [vTokenOf(m), need(m.liquidationIncentive, `${m.symbol}: liquidationIncentive`)],
    });
  }

  commands.push(
    // -------------------------------------------------------------------------------------------
    // 9. Pause BORROW on every collateral market, in one call: the setter takes arrays.
    //
    //    This backs up `borrowCap = 0` rather than replacing it. A cap is a parameter a later proposal
    //    can retune in passing; a pause is a second, independent gate that has to be lifted on purpose.
    //
    //    The role string is `setActionsPaused(address[],uint256[],bool)` while the CALL signature below
    //    is `uint8[]`, because `Action` is an enum. They are different strings on purpose, the
    //    `uint256[]` form is the granted one on this chain, and the `uint8[]` form is held by nobody.
    //    Do not "fix" either to match the other.
    // -------------------------------------------------------------------------------------------
    {
      target: spokeComptroller,
      signature: "setActionsPaused(address[],uint8[],bool)",
      params: [COLLATERAL_MARKETS.map(vTokenOf), [BORROW_ACTION], true],
    },

    // -------------------------------------------------------------------------------------------
    // 10. Arm the supply allowlist on the liquidity market, with NO members.
    //
    //     This is the Phase 1 boundary, and it is the safe side of it. The market is closed to supply
    //     from the moment it is listed, so it can never be supplied permissionlessly in the window
    //     before the Hub arrives. Phase 2 adds the Hub's spoke source with
    //     `setAllowedSupplier(vUSDT_HubSpoke, <spoke source>, true)`.
    //
    //     The allowlist meters the account CREDITED with the vTokens, not the one paying, and it gates
    //     `preMintHook` only. Redeeming is never restricted, and the seed supply minted to the treasury
    //     during `addMarket` is unaffected.
    //
    //     The collateral markets are left permissionless: the collateral-deposit allowlist is optional
    //     and off by default.
    // -------------------------------------------------------------------------------------------
    {
      target: spokeComptroller,
      signature: "setSupplyAllowlistEnabled(address,bool)",
      params: [vTokenOf(LIQUIDITY_MARKET), true],
    },
  );

  if (missing.length > 0) {
    const unique = [...new Set(missing)].sort();
    throw new Error(
      `VIP-671 [bscmainnet] is still a draft: ${unique.length} value(s) unset in ` +
        `vips/vip-671/addresses/bscmainnet.ts.\n  - ${unique.join("\n  - ")}\n` +
        `Deploy the spoke stack and agree the risk parameters first. Nothing here has a safe default.`,
    );
  }

  return makeProposal(commands, meta, ProposalType.REGULAR);
};

export default vip671;
