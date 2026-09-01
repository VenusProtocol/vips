import { Command, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ACM,
  ADAPTER_SPOKE_V1,
  DEVIATION_BOUNDED_ORACLE,
  HUB_USDT,
  NORMAL_TIMELOCK,
  POOL_REGISTRY,
  RESILIENT_ORACLE,
  SPOKE_COMPTROLLER,
  SPOKE_SOURCE_USDT,
  TIMELOCKS,
  VUSDT_SPOKE,
} from "./addresses/bsctestnet";
import {
  CLOSE_FACTOR,
  MARKETS,
  MIN_LIQUIDATABLE_COLLATERAL,
  PERCENTAGE_CAP_DISABLED,
  POOL_LIQUIDATION_INCENTIVE,
  POOL_NAME,
  REDUCE_RESERVES_BLOCK_DELTA,
  SPOKE_SOURCE_ABSOLUTE_CAP,
  SpokeMarket,
} from "./config";
import { SPOKE_COMPTROLLER_ROLES, SPOKE_SOURCE_GOVERNANCE, giveCallPermission } from "./permissions";

// ===================================================================================================
// VIP-671 [BNB Chain Testnet] — Hub-Funded Spoke pool.
//
// FOUNDATION DRAFT. Nothing this VIP targets on the spoke side is deployed yet; every placeholder is
// marked TODO(deploy) in ./addresses/bsctestnet.ts and this proposal cannot be simulated or proposed
// until they are filled in. What IS settled here is the shape: the command ORDER (which is
// load-bearing in four places, see below), the exact ACM role strings, the exact call signatures, and
// which grants this chain already covers by wildcard.
//
// Sources:
//   isolated-pools#559        -> contracts/Spoke/SpokeComptroller.sol, deploy/024-deploy-spoke-comptroller.ts
//   venus-liquidity-hub#22    -> contracts/adapters/AdapterSpokeV1.sol, deploy/08 + deploy/09
//   venus-protocol#707        -> contracts/BStock/BStockLiquidator.sol   (see the TODO block at the end)
//
// ---------------------------------------------------------------------------------------------------
// ORDER IS LOAD-BEARING. Do not reshuffle these four:
//
//  1. `acceptOwnership()` FIRST. The deploy script leaves the comptroller Ownable2Step-nominated, so
//     the deployer is still the live owner and every onlyOwner setter below reverts until this lands.
//  2. `setPriceOracle` BEFORE `addPool`. `PoolRegistry.addPool` dereferences `comptroller.oracle()`
//     and rejects the zero address.
//  3. `setDeviationBoundedOracle` BEFORE the pool serves anyone. `_updateProtectionStates` calls into
//     it with no zero check on every borrow and every redeem by an account that has entered a market,
//     so both fail closed while it is unset. Supplying still works — `preMintHook` reads no price.
//  4. `addMarket` BEFORE `setSupplyAllowlistEnabled`, and the allowlist grant BEFORE `addResource`:
//       - `PoolRegistry.addMarket` seeds initial supply with `mintBehalf(vTokenReceiver, ...)`, and
//         `preMintHook` gates the account CREDITED with the vTokens. Arming the allowlist first would
//         block the seed mint — and it cannot be armed first anyway, because `setSupplyAllowlistEnabled`
//         requires the market to already be listed.
//       - `AdapterSpokeV1.validateRegistration` refuses a market whose supply allowlist is on unless the
//         registering YieldGroup is already on it, so `setAllowedSupplier` must precede `addResource`.
//
// ---------------------------------------------------------------------------------------------------
// PERMISSIONS ALREADY COVERED ON THIS CHAIN (checked on chain, ACM 0x45f8…a9AA):
//   The Normal Timelock holds WILDCARD (address(0)-keyed) grants for every pooled-Comptroller and
//   VToken role this listing uses, and PoolRegistry holds the six it drives inside addPool/addMarket.
//   Hub_USDT already grants the Normal Timelock addYieldGroup and both outer-queue setters. Only what
//   is in ./permissions.ts is missing. Full detail lives there.
// ===================================================================================================

/// Live outer queues on Hub_USDT, read from the chain while drafting. The Spoke source is APPENDED so
/// it is the last stop in both directions: the existing groups hold real testnet balances and dropping
/// one from the withdraw queue would strand them.
///
/// TODO: RE-READ BOTH ARRAYS immediately before proposing. They have already drifted once since
/// VIP-650 wired them (a fourth group, 0x28e5…FCC2, is present in the withdraw queue only), and
/// `setOuterWithdrawQueue` enforces that every funded group is covered — a stale array reverts.
const OUTER_DEPOSIT_QUEUE = [
  "0xA0Fb0fFeBdcB7F45A3Ec841cCE7F78B7CeBD0f82", // FRVSource_USDT
  "0x044E572144bc08ed2D90E081EeEd7b5b6Cb01016", // FluxSource_USDT
  "0x11e39DC7b8b16BBDA8D9C2903dF741Ae9341Ec88", // CoreSource_USDT
];
const OUTER_WITHDRAW_QUEUE = [
  "0x28e5E0ce9c15E3dE00855C2dda7cA260B470FCC2",
  "0xA0Fb0fFeBdcB7F45A3Ec841cCE7F78B7CeBD0f82", // FRVSource_USDT
  "0x044E572144bc08ed2D90E081EeEd7b5b6Cb01016", // FluxSource_USDT
  "0x11e39DC7b8b16BBDA8D9C2903dF741Ae9341Ec88", // CoreSource_USDT
];

/// Faucet the seed, list the market through the registry, then drop the approval back to zero.
/// The mocked underlyings on this chain all expose `faucet(uint256)`, which mints to `msg.sender` —
/// the Timelock — so no treasury withdrawal is needed (same pattern as VIP-633).
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
    signature: "faucet(uint256)",
    params: [m.initialSupply],
  },
  {
    target: m.underlying,
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, m.initialSupply],
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        m.vToken,
        m.collateralFactor,
        m.liquidationThreshold,
        m.initialSupply,
        // The seed vTokens stay with governance. TODO: confirm whether these should go to the
        // VTreasury instead, as a Core-pool listing would do.
        NORMAL_TIMELOCK,
        m.supplyCap,
        m.borrowCap,
      ],
    ],
  },
  {
    target: m.underlying,
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
  },
];

export const vip671 = () => {
  const meta = {
    version: "v2",
    title: "VIP-671 [BNB Chain Testnet] Hub-Funded Spoke pool — list the pool and wire it to the Liquidity Hub",
    description: `#### Summary

If passed, this VIP will register the first **Hub-Funded Spoke pool** on BNB Chain testnet and connect its liquidity side to the **Liquidity Hub (USDT)**.

A Hub-Funded Spoke pool is one isolated pool whose two sides are listed and controlled separately:

- **Liquidity side (USDT)** — borrowable, but supply is restricted to a per-market allowlist whose only member is the Hub's Spoke source. The protocol therefore meters exactly how much liquidity the pool holds and what its utilisation is.
- **Collateral side (TSLAB, NVDAB, SPCXB)** — permissionless to supply, not borrowable in-market. Borrow power is shared across the pool, so a position can back a USDT borrow with any mix of the three.

Every market is capped, and the pool has its own Comptroller, so a depeg, an oracle problem or bad debt on exotic collateral is contained to that pool and cannot reach the Core pool.

#### Proposed changes

1. Accept ownership of the new spoke Comptroller and point it at the **ResilientOracle** and the **DeviationBoundedOracle**. The second one is required before the pool serves any borrow or redeem.
2. Grant every governance timelock the ACM roles that exist only on this pool — the supply allowlist, the liquidation allowlist, and the per-market liquidation incentive — plus forced liquidation.
3. Register the pool in the **PoolRegistry** and list four markets: USDT on the liquidity side, and TSLAB, NVDAB and SPCXB on the collateral side, each with its own caps and risk parameters.
4. Restrict USDT supply to the Hub's Spoke source.
5. Register the spoke market as a resource on the Hub's Spoke source, register that source on the Hub, and append it to the Hub's deposit and withdraw queues.

#### Notes

- Testnet only. No Hub-Funded Spoke pool is deployed on any mainnet.
- Exit is never gated: repay, redeem, withdraw and transfer stay permissionless, and the pool keeps the usual market-level pause controls.
- Liquidation stays permissionless — the optional liquidation allowlist ships disabled.
- The reserve factor is zero on every market. The Hub is the pool's only lender and absorbs any bad debt, so it keeps the interest.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // -------------------------------------------------------------------------------------------
      // 1. Take ownership of the spoke Comptroller and point it at both oracles.
      //    All three are onlyOwner, so acceptOwnership has to come first.
      // -------------------------------------------------------------------------------------------
      { target: SPOKE_COMPTROLLER, signature: "acceptOwnership()", params: [] },
      { target: SPOKE_COMPTROLLER, signature: "setPriceOracle(address)", params: [RESILIENT_ORACLE] },
      {
        target: SPOKE_COMPTROLLER,
        signature: "setDeviationBoundedOracle(address)",
        params: [DEVIATION_BOUNDED_ORACLE],
      },

      // -------------------------------------------------------------------------------------------
      // 2. ACM roles this chain does not already cover. Everything else the listing needs is held by
      //    the Normal Timelock (or by PoolRegistry) as a wildcard grant — see ./permissions.ts.
      //    TODO: if the proposal exceeds the propose() gas budget, trim this to the Normal Timelock
      //    only and follow up for the Fast-track and Critical timelocks.
      // -------------------------------------------------------------------------------------------
      ...SPOKE_COMPTROLLER_ROLES.flatMap(signature =>
        TIMELOCKS.map(timelock => giveCallPermission(ACM, SPOKE_COMPTROLLER, signature, timelock)),
      ),

      // -------------------------------------------------------------------------------------------
      // 3. Register the pool. PoolRegistry pushes closeFactor, the pool-wide liquidation incentive and
      //    minLiquidatableCollateral into the Comptroller itself, under its own wildcard grants.
      //    The pool-wide incentive must be >= 1.05e18 (SpokeComptroller raises the upstream 1e18 floor
      //    to 1e18 + the VToken default protocol seize share).
      // -------------------------------------------------------------------------------------------
      {
        target: POOL_REGISTRY,
        signature: "addPool(string,address,uint256,uint256,uint256)",
        params: [POOL_NAME, SPOKE_COMPTROLLER, CLOSE_FACTOR, POOL_LIQUIDATION_INCENTIVE, MIN_LIQUIDATABLE_COLLATERAL],
      },

      // -------------------------------------------------------------------------------------------
      // 4. List the markets. Liquidity market first — its supply allowlist can only be armed after it
      //    exists, and arming it earlier would block the registry's own seed mint.
      // -------------------------------------------------------------------------------------------
      ...MARKETS.flatMap(listMarket),

      // -------------------------------------------------------------------------------------------
      // 5. Per-market liquidation incentives, keyed on the COLLATERAL market — the discount prices the
      //    collateral being seized, not the debt being repaid (PRD C7). A market left unset inherits
      //    the pool-wide value; pinning it explicitly keeps it from moving if the pool default is
      //    retuned later.
      //
      //    Floor: 1e18 + that market's protocolSeizeShareMantissa (5% by default), so 1.05e18 today.
      //    To go BELOW that, `VToken.setProtocolSeizeShare` has to be lowered FIRST — it reads the
      //    incentive back and rejects `share + 1e18 > incentive`, so the two setters bound each other.
      // -------------------------------------------------------------------------------------------
      ...MARKETS.flatMap((m): Command[] =>
        m.liquidationIncentive === undefined
          ? []
          : [
              {
                target: SPOKE_COMPTROLLER,
                signature: "setMarketLiquidationIncentive(address,uint256)",
                params: [m.vToken, m.liquidationIncentive],
              },
            ],
      ),

      // -------------------------------------------------------------------------------------------
      // 6. Restrict USDT supply to the Hub's Spoke source. The allowlist meters the account CREDITED
      //    with the vTokens, not the one paying, so `mintBehalf` from a third party into the Spoke
      //    source still passes — accepted deliberately (PRD C6).
      //    Redeeming is never restricted, and the collateral markets are left permissionless (PRD §4.2:
      //    the collateral-deposit allowlist is optional and off by default).
      // -------------------------------------------------------------------------------------------
      {
        target: SPOKE_COMPTROLLER,
        signature: "setSupplyAllowlistEnabled(address,bool)",
        params: [VUSDT_SPOKE, true],
      },
      {
        target: SPOKE_COMPTROLLER,
        signature: "setAllowedSupplier(address,address,bool)",
        params: [VUSDT_SPOKE, SPOKE_SOURCE_USDT, true],
      },

      // -------------------------------------------------------------------------------------------
      // 7. Hub side. The Spoke source is the generic YieldGroup behind its own beacon, so its roles are
      //    per-proxy and none of them exists yet. These grants must precede the wiring commands below,
      //    which the Normal Timelock issues in this same proposal.
      // -------------------------------------------------------------------------------------------
      ...SPOKE_SOURCE_GOVERNANCE.map(signature =>
        giveCallPermission(ACM, SPOKE_SOURCE_USDT, signature, NORMAL_TIMELOCK),
      ),
      // TODO: decide whether the testnet Guardian (the Operator) also gets the source's cap, queue and
      // pause roles, as VIP-650 gave it on the Core, FRV and Flux sources.

      // -------------------------------------------------------------------------------------------
      // 8. Wire the spoke market into the Hub. `addResource` runs `AdapterSpokeV1.validateRegistration`,
      //    which reads the supply allowlist against `msg.sender` (the Spoke source) — hence step 6
      //    first. The inner-queue setters reject an unregistered resource, and the Hub's outer-queue
      //    setters reject an unregistered group, so each pair is ordered.
      // -------------------------------------------------------------------------------------------
      {
        target: SPOKE_SOURCE_USDT,
        signature: "addResource(address,address)",
        params: [VUSDT_SPOKE, ADAPTER_SPOKE_V1],
      },
      { target: SPOKE_SOURCE_USDT, signature: "setInnerDepositQueue(address[])", params: [[VUSDT_SPOKE]] },
      { target: SPOKE_SOURCE_USDT, signature: "setInnerWithdrawQueue(address[])", params: [[VUSDT_SPOKE]] },
      // A fresh resource's cap is already unbounded — on a YieldGroup `0` means "no cap", the inverse of
      // the isolated-pools `supplyCaps` sentinel where `0` rejects every mint. Tightening it is
      // `lowerResourceCap`; `raiseResourceCap` on a new resource reverts NotIncreasing.
      // TODO(risk): set a per-market cap here with `lowerResourceCap(VUSDT_SPOKE, cap)` once risk
      // supplies one. Left unbounded so the market's own supply cap is the only ceiling for now.

      {
        target: HUB_USDT,
        signature: "addYieldGroup(address,uint256,uint16)",
        params: [SPOKE_SOURCE_USDT, SPOKE_SOURCE_ABSOLUTE_CAP, PERCENTAGE_CAP_DISABLED],
      },
      {
        target: HUB_USDT,
        signature: "setOuterDepositQueue(address[])",
        params: [[...OUTER_DEPOSIT_QUEUE, SPOKE_SOURCE_USDT]],
      },
      {
        target: HUB_USDT,
        signature: "setOuterWithdrawQueue(address[])",
        params: [[...OUTER_WITHDRAW_QUEUE, SPOKE_SOURCE_USDT]],
      },

      // -------------------------------------------------------------------------------------------
      // 9. TODO — bStock liquidation leg (venus-protocol PR #707). NOT INCLUDED, because
      //    `BStockLiquidator` is not deployed on bsctestnet at all; it exists only on bscmainnet
      //    (0x5974Badab6911a78Ba15229045514C2C1bD42343). Once a testnet instance is deployed and
      //    upgraded to the spoke-aware implementation, this VIP (or a follow-up) needs, all onlyOwner:
      //
      //      BSTOCK_LIQUIDATOR.acceptOwnership()                                   // if newly deployed
      //      BSTOCK_LIQUIDATOR.setAllowedComptroller(SPOKE_COMPTROLLER, true)
      //      BSTOCK_LIQUIDATOR.setCoreFlashSource(USDT, VUSDT_CORE)                // flashLiquidate only
      //
      //    Notes for whoever writes it:
      //      - `setAllowedComptroller` reverts `NotAComptroller` unless the target answers
      //        `isComptroller()` with true, and reverts `CoreComptrollerNotConfigurable` for the Core
      //        diamond, which is matched by identity instead.
      //      - `setCoreFlashSource` reverts `FlashSourceMismatch` unless `vToken.underlying()` equals
      //        the debt token. Isolated pools have no flash lender, so an isolated USDT repay is
      //        flash-funded from the CORE USDT market.
      //      - `flashLiquidate` additionally needs the liquidator to be `authorizedFlashLoan` in the
      //        CORE Comptroller and the Core flash source market to be flash-enabled. Neither is set by
      //        anything above.
      //      - This pool's liquidation allowlist ships DISABLED, so no `setAllowedLiquidator` is needed.
      //        If it is ever enabled, the allowlisted account is the LIQUIDATOR CONTRACT, not the
      //        operator EOA that calls it.
      // -------------------------------------------------------------------------------------------
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip671;
