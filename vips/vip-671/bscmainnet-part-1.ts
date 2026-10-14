import { Command, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ACM,
  BSTOCK_LIQUIDATOR,
  BSTOCK_LIQUIDATOR_IMPL,
  BSTOCK_LIQUIDATOR_PROXY_ADMIN,
  CLOSE_FACTOR,
  DEFAULT_PROXY_ADMIN,
  DEVIATION_BOUNDED_ORACLE,
  MIN_LIQUIDATABLE_COLLATERAL,
  PENDING,
  POOL_LIQUIDATION_INCENTIVE,
  POOL_NAME,
  PROTOCOL_SHARE_RESERVE,
  PROTOCOL_SHARE_RESERVE_IMPL,
  RESILIENT_ORACLE,
  SPOKE_COMPTROLLER,
  SPOKE_COMPTROLLER_BEACON,
  SPOKE_POOL_REGISTRY,
  SPOKE_VTOKEN_BEACON,
} from "./addresses/bscmainnet";
import { giveCallPermission } from "./permissions";
import { VIP_A_GRANTS } from "./permissions-bscmainnet";

// ===================================================================================================
// VIP-671 [BNB Chain] — Hub-Funded Spoke pool, VIP-A: spoke pool infrastructure. 27 commands, no markets.
//
// Part 1 of 3, all in this directory. VIP-B (part 2, Hub infrastructure) does not depend on this one. VIP-C
// (part 3, markets and Hub wiring) needs both executed first.
//
// ---------------------------------------------------------------------------------------------------
// STATUS: DRAFT. THIS PROPOSAL CANNOT BE BUILT YET, AND THAT IS ENFORCED RATHER THAN DOCUMENTED.
//
// The spoke stack, the multi-registry ProtocolShareReserve implementation and the new `BStockLiquidator`
// implementation are not deployed on bscmainnet. Each is a `PENDING` address in ./addresses/bscmainnet.ts,
// and `vip671Part1Bscmainnet()` throws with the full list of what is missing rather than letting a
// half-filled proposal build, simulate or be proposed.
//
// ---------------------------------------------------------------------------------------------------
// WHY THIS POOL HAS A REGISTRY OF ITS OWN
//
// The registry is the directory every consumer iterates to answer "which pools exist", and
// `getVTokenForAsset` is what ProtocolShareReserve uses as a membership check. A pool whose liquidity market
// only a Hub may supply does not belong in the isolated-pools list, so isolated-pools#559 gives it a second
// `PoolRegistry` instance. Two consequences run through this proposal:
//   - The spoke comptroller bakes that registry in as a CONSTRUCTOR IMMUTABLE and `supportMarket` checks it.
//     There is no `setPoolRegistry` on this fork, so nothing in this VIP can fix a mismatch.
//   - The ACM wildcards that let the isolated-pools registry configure a comptroller name THAT registry as the
//     account. The spoke registry inherits none of them. See step 2.
//
// ---------------------------------------------------------------------------------------------------
// ORDER IS LOAD-BEARING. Do not reshuffle these:
//
//  1. Both `acceptOwnership()` calls FIRST. The deploy scripts leave the comptroller and the registry
//     Ownable2Step-nominated, so the deployer is still the live owner and every `onlyOwner` call below
//     reverts until these land.
//  2. The registry's grants BEFORE `addPool`. `PoolRegistry` drives `setCloseFactor`,
//     `setLiquidationIncentive` and `setMinLiquidatableCollateral` on the comptroller as `msg.sender`;
//     without the grants `addPool` reverts.
//  3. `setPriceOracle` BEFORE `addPool`, which reads `comptroller.oracle()` and rejects zero.
//  4. `setDeviationBoundedOracle` before the pool is registered. Until it is set, borrow fails, and so do
//     redeem, transfer and `exitMarket` for market members.
//  5. The ProtocolShareReserve upgrade and `addPoolRegistry` before any market is listed (VIP-C). `VToken`
//     calls `updateAssetsState` on every protocol seize and every reserve sweep, and today's PSR reverts
//     `InvalidAddress` for a comptroller outside the isolated-pools registry.
//
// ---------------------------------------------------------------------------------------------------
// NOT IN THIS PROPOSAL, AND NOT AN OVERSIGHT:
//
//  - Any distribution change on the ProtocolShareReserve. `RiskFundConverter` is on neither schema and must
//    stay off: it resolves pools through a registry of its own and would revert every `releaseFunds` naming
//    this pool. Both schemas total 10000 bps. Re-read both before proposing: if another proposal edits a row
//    meanwhile, correct it in a single `addOrUpdateDistributionConfigs` call.
//  - `setMaxLoopsLimit`. `025` initializes the comptroller with 50, and the limit can only be raised.
//  - `enterMarketForAccount(address,address)`. Its only holder is `CollateralGateway`, granted in VIP-C.
//  - `setPoolRegistry` and `setCoreFlashSource` on `BStockLiquidator`. Both are `onlyOwner`, and the owner is
//    the Operator multisig, not governance. After execution it calls `setPoolRegistry(SpokePoolRegistry)`,
//    then `setCoreFlashSource` for each liquidity market's underlying against its Core market (USDT, USDC and
//    U in the listing sheet; VIP-C fixes the set). `setPoolRegistry` probes `getPoolByComptroller(address(0))`,
//    which an empty registry answers, so all of these can follow at once. They must land before VIP-C opens
//    the collateral markets.
// ===================================================================================================

/// Placeholder. VIP numbers are assigned by the governor at proposal time, so this line and the directory name
/// change together when the proposal is opened.
const VIP_NUMBER = 671;

/// Every address VIP-A needs that does not exist on bscmainnet yet. Exported so the simulation can report what
/// is still missing instead of failing to load.
export const pendingDeployments = (): string[] =>
  [
    { name: "SpokePoolRegistry", address: SPOKE_POOL_REGISTRY },
    { name: "Comptroller_HubSpoke", address: SPOKE_COMPTROLLER },
    // No command targets the two beacons, but the simulation reads their owners, so the proposal is not
    // reviewable until both are filled.
    { name: "SpokeComptrollerBeacon", address: SPOKE_COMPTROLLER_BEACON },
    { name: "SpokeVTokenBeacon", address: SPOKE_VTOKEN_BEACON },
    { name: "ProtocolShareReserve implementation", address: PROTOCOL_SHARE_RESERVE_IMPL },
    { name: "BStockLiquidator implementation", address: BSTOCK_LIQUIDATOR_IMPL },
  ]
    .filter(({ address }) => address === PENDING)
    .map(({ name }) => name);

export const vip671Part1Bscmainnet = () => {
  const missing = pendingDeployments();
  if (missing.length > 0) {
    throw new Error(
      `VIP-${VIP_NUMBER} [bscmainnet] is still a draft: ${missing.length} address(es) pending in ` +
        `vips/vip-671/addresses/bscmainnet.ts.\n  - ${missing.join("\n  - ")}\n` +
        `Deploy them and fill the addresses first. Nothing here has a safe default.`,
    );
  }

  // TODO(meta): add links to the final audit reports of isolated-pools#559, protocol-reserve#168 and
  // venus-protocol#707, and the deployed addresses, once both exist.
  const meta = {
    version: "v2",
    title: `VIP-${VIP_NUMBER} [BNB Chain] Hub-Funded Spoke pool: infrastructure`,
    description: `#### Summary

If passed, this VIP will set up the infrastructure of the first **Hub-Funded Spoke pool** on BNB Chain: a pool registry of its own, the pool's Comptroller, and the permissions and integrations the pool needs. It lists no market. The pool's markets, and the connection of its liquidity side to the Liquidity Hub, follow in later proposals.

A Hub-Funded Spoke pool is one pool whose two sides are controlled separately:

- **Liquidity side**: borrowable, but only the Liquidity Hub may supply it, and supplying it gives no borrow power.
- **Collateral side**: permissionless to supply, usable as collateral, and not borrowable.

The pool has its own Comptroller and its own registry, so a price problem or bad debt in it stays in it and cannot reach the Core pool or the existing isolated pools.

#### Proposed changes

1. Accept ownership of the new spoke pool registry and the new spoke Comptroller.
2. Grant the permissions the pool needs, each on the spoke Comptroller only:
   - the spoke pool registry: the six Comptroller setters it calls while registering the pool and its markets
   - the Normal Timelock: the supply allowlist, the liquidation allowlist, the per-market liquidation incentive and forced liquidation
   - the Critical Guardian: the close factor, the pool-wide and per-market liquidation incentives, the minimum liquidatable collateral and forced liquidation
   - the Pause Guardian: the liquidation allowlist
3. Point the Comptroller at the **ResilientOracle** and the **DeviationBoundedOracle**.
4. Upgrade the **ProtocolShareReserve** so it can resolve markets through more than one pool registry, and register the spoke pool registry next to the existing one. Without this, every liquidation in the pool would revert. The existing isolated pools are unaffected: their registry stays the primary one and is still checked first.
5. Register the pool as **bStock index**, with a 50% close factor, a 10% liquidation incentive and a minimum liquidatable collateral of $100.
6. Upgrade **BStockLiquidator**, the atomic liquidator for bStock collateral, so it can also serve this pool. Its behaviour for the Core pool is unchanged.

#### Notes

- The emergency pause path reaches the new pool from its first block: the Pause Guardian and the Normal and Fast-track timelocks already hold the pause and unlist permissions on every pool Comptroller.
- No ProtocolShareReserve distribution changes. Income from this pool will split across the same destinations as the rest of the protocol.
- The ProtocolShareReserve upgrade also lets governance remove an additional registry and raise the loop limit, and makes removing a distribution target revert unless the target exists and its percentage is already zero.
- After execution, the BStockLiquidator owner will point it at the spoke pool registry and set its flash loan sources, before any collateral market opens.

#### References

- [Spoke pool contracts](https://github.com/VenusProtocol/isolated-pools/pull/559)
- [ProtocolShareReserve multi-registry support](https://github.com/VenusProtocol/protocol-reserve/pull/168)
- [BStockLiquidator spoke pool support](https://github.com/VenusProtocol/venus-protocol/pull/707)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  const commands: Command[] = [
    // -------------------------------------------------------------------------------------------
    // 1. Take ownership of both Ownable2Step contracts. Everything `onlyOwner` below depends on these.
    //    The two beacons are plain `Ownable` and handed over by their deploy scripts, and the lens has no
    //    owner, so none of the three needs a command.
    // -------------------------------------------------------------------------------------------
    { target: SPOKE_POOL_REGISTRY, signature: "acceptOwnership()", params: [] },
    { target: SPOKE_COMPTROLLER, signature: "acceptOwnership()", params: [] },

    // -------------------------------------------------------------------------------------------
    // 2. Nineteen ACM grants, each against the spoke Comptroller and never as a wildcard: 6 to the spoke
    //    registry, 6 to the Normal Timelock, 5 to the Critical Guardian, 2 to the Pause Guardian. See
    //    ./permissions-bscmainnet.ts for what each account gets and why.
    //
    //    The registry's six come first. The identical wildcards exist on this chain but name the
    //    isolated-pools registry as the account, so the spoke registry inherits nothing and `addPool` in step
    //    5 reverts without these.
    // -------------------------------------------------------------------------------------------
    ...VIP_A_GRANTS.map(({ role, account }) => giveCallPermission(ACM, SPOKE_COMPTROLLER, role, account)),

    // -------------------------------------------------------------------------------------------
    // 3. Oracles. Both setters are `onlyOwner`, so they follow step 1. `setPriceOracle` also has to precede
    //    `addPool`. The DeviationBoundedOracle reads RESILIENT_ORACLE as an immutable, so the two are paired;
    //    the simulation asserts it.
    // -------------------------------------------------------------------------------------------
    { target: SPOKE_COMPTROLLER, signature: "setPriceOracle(address)", params: [RESILIENT_ORACLE] },
    {
      target: SPOKE_COMPTROLLER,
      signature: "setDeviationBoundedOracle(address)",
      params: [DEVIATION_BOUNDED_ORACLE],
    },

    // -------------------------------------------------------------------------------------------
    // 4. ProtocolShareReserve: upgrade to the multi-registry implementation, then register the spoke registry
    //    next to the existing one. The proxy admin and PSR are both owned by the Normal Timelock, so neither
    //    call needs an ACM grant.
    //
    //    THESE TWO STAY TOGETHER, IN THIS ORDER, IN THIS PROPOSAL (protocol-reserve#168): the upgrade alone
    //    leaves the spoke registry unknown, and `addPoolRegistry` does not exist before it.
    //
    //    Do NOT substitute `setPoolRegistry`. It REPLACES the primary registry, which would stop every live
    //    isolated pool from taking income and revert their liquidations. After this the isolated-pools
    //    registry stays primary and is probed first; the spoke registry is additional.
    //
    //    Storage-safe on its own: the new state is appended at slots 305 and 306, so there is no reinitializer
    //    and no migration. `maxLoopsLimit` is 20, so one additional registry clears the bound
    //    `addPoolRegistry` enforces.
    //
    //    The new implementation (protocol-reserve#170, the audited head of #168) changes more than the
    //    registries. It adds `removePoolRegistry` and `setMaxLoopsLimit` (both `onlyOwner`), and
    //    `removeDistributionConfig` now REVERTS (`DistributionConfigNotFound`, `NonZeroPercentage`) where the
    //    live one silently did nothing. A later proposal that removes a row must zero its percentage first and
    //    name a row that exists.
    // -------------------------------------------------------------------------------------------
    {
      target: DEFAULT_PROXY_ADMIN,
      signature: "upgrade(address,address)",
      params: [PROTOCOL_SHARE_RESERVE, PROTOCOL_SHARE_RESERVE_IMPL],
    },
    { target: PROTOCOL_SHARE_RESERVE, signature: "addPoolRegistry(address)", params: [SPOKE_POOL_REGISTRY] },

    // -------------------------------------------------------------------------------------------
    // 5. Register the empty pool. The registry pushes the close factor, the pool-wide incentive and the
    //    minimum liquidatable collateral into the Comptroller itself, under the grants from step 2. The
    //    Normal Timelock reaches `addPool` through its existing wildcard on the registry.
    // -------------------------------------------------------------------------------------------
    {
      target: SPOKE_POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: [POOL_NAME, SPOKE_COMPTROLLER, CLOSE_FACTOR, POOL_LIQUIDATION_INCENTIVE, MIN_LIQUIDATABLE_COLLATERAL],
    },

    // -------------------------------------------------------------------------------------------
    // 6. Upgrade `BStockLiquidator` to the venus-protocol#707 implementation, through its own proxy admin
    //    (the oracle repo's DefaultProxyAdmin, owned by the Normal Timelock). No ACM grant.
    //
    //    THIS ALSO CHANGES THE LIVE CORE LIQUIDATOR. #707 keeps the Core path unchanged and only appends
    //    `poolRegistry` and `coreFlashSource` (the gap shrinks from 49 to 47), both empty after the upgrade,
    //    so the liquidator serves exactly what it served before until its owner points it at the spoke pool.
    // -------------------------------------------------------------------------------------------
    {
      target: BSTOCK_LIQUIDATOR_PROXY_ADMIN,
      signature: "upgrade(address,address)",
      params: [BSTOCK_LIQUIDATOR, BSTOCK_LIQUIDATOR_IMPL],
    },
  ];

  return makeProposal(commands, meta, ProposalType.REGULAR);
};

export default vip671Part1Bscmainnet;
