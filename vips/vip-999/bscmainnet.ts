import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { Command, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// ===================================================================================================
// VIP-999 [BNB Chain] — Onboard the Centrifuge yield group (JTRSY) into the USDC Liquidity Hub
//
// DRAFT. The Centrifuge family (AdapterCentrifuge, YieldGroupCentrifuge impl, CentrifugeBeacon, and
// the per-Hub YieldGroupCentrifuge BeaconProxy) is NOT DEPLOYED YET, so every address in the
// "PLACEHOLDERS" block below is a dummy. Swap them for the real deployment addresses (and re-verify
// each one on-chain) before this proposal is created.
//
// What this does, in order — the ordering is load-bearing:
//   1. ACM grants on the new yield group: the full 18-signature set to the Normal Timelock, the
//      operator/containment subset to the Guardian, and the four claim functions to the keeper.
//   2. addResource(cfVault, AdapterCentrifuge) — must precede the queue setters, which reject an
//      unregistered resource.
//   3/4. setInnerDepositQueue / setInnerWithdrawQueue on the group.
//   5. setPriceGuard — arms the NAV staleness guard for the vault.
//   6. hub.addYieldGroup — must precede the outer queue setters.
//   7. setOuterWithdrawQueue on the Hub — must list EVERY registered group or the Hub rejects it, so
//      the whole queue is rewritten. setOuterDepositQueue is deliberately COMMENTED OUT: Centrifuge
//      settles asynchronously and is filled by the Operator's reallocate, not by the deposit cascade.
//
// Out of scope for this VIP (both must be done off-chain, before/after execution):
//   - The group proxy must be memberlisted on the JTRSY share token by Centrifuge. Without it
//     claimDeposit, claimCancelRedeem and requestRedeem all revert. Memberlist entries expire, so a
//     validUntil has to be agreed with Centrifuge and renewal put on the monitoring rota.
//   - CentrifugeBeacon ownership is handed to governance inside the deploy broadcast (OZ Ownable is
//     single-step), so there is no acceptOwnership() here — only a post-deploy check that
//     beacon.owner() == NORMAL_TIMELOCK.
// ===================================================================================================

const { ACCESS_CONTROL_MANAGER, NORMAL_TIMELOCK, GUARDIAN } = NETWORK_ADDRESSES.bscmainnet;

export const ACM = ACCESS_CONTROL_MANAGER;
export { NORMAL_TIMELOCK, GUARDIAN };

// ---------------------------------------------------------------------------------------------------
// USDC Hub stack — live on mainnet, from VIP-650's address book. USDC on BNB Chain is 18-decimal, so
// the caps below are in 18-dec units.
// ---------------------------------------------------------------------------------------------------
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDC_HUB = "0x9D2D9592cF8DFbf59107fAab703d08494BE14617";
export const USDC_CORE_GROUP = "0x299D9Be7CEfff91c68F13F267d525CFC18e965ef";
export const USDC_FLUX_GROUP = "0xA65bB4b20542268B64CF08871a98D75342AFE927";
export const USDC_FRV_GROUP = "0x438388847eE16850Ab4f5b82dc7954c0d043B716";

// ---------------------------------------------------------------------------------------------------
// PLACEHOLDERS — replace all five before proposing.
// ---------------------------------------------------------------------------------------------------
// YieldGroupCentrifuge BeaconProxy for the USDC Hub. Must satisfy asset() == USDC and hub() == USDC_HUB
// (addYieldGroup reverts YieldGroupAssetMismatch otherwise); the hub/asset/acm binding has no setter.
export const CENTRIFUGE_GROUP = "0x1111111111111111111111111111111111111111";
// Stateless AdapterCentrifuge, one per chain, delegatecalled by every Centrifuge group.
export const ADAPTER_CENTRIFUGE = "0x2222222222222222222222222222222222222222";
// Centrifuge ERC-7540 JTRSY vault on BNB Chain. asset() must be USDC.
export const JTRSY_VAULT = "0x3333333333333333333333333333333333333333";
// Centrifuge Spoke on BNB Chain — read by the price guard for the share-price timestamp.
export const CENTRIFUGE_SPOKE = "0x4444444444444444444444444444444444444444";
// Keeper EOA/service that drives the four async claim functions.
export const KEEPER = "0x5555555555555555555555555555555555555555";

// JTRSY share class identifiers, supplied by Centrifuge. poolId is uint64, scId is bytes16.
export const JTRSY_POOL_ID = "1";
export const JTRSY_SHARE_CLASS_ID = "0x00000000000000000000000000000001";

// ---------------------------------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------------------------------
// Price-guard staleness window, in seconds. Centrifuge publishes NAV discretely, so this must be
// comfortably longer than the publication cadence: a guard that fires makes totalAssets() revert,
// which halts every Hub operation.
export const PRICE_GUARD_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export const CENTRIFUGE_ABSOLUTE_CAP = parseUnits("5000000", 18).toString(); // 5,000,000 USDC
export const CENTRIFUGE_PERCENTAGE_CAP_BPS = 2_000; // 20% of Hub TVL

// The withdraw queue is rewritten in full: setOuterWithdrawQueue rejects a queue that omits a
// registered group. Centrifuge goes LAST — a settled redeem is the slowest path out.
export const OUTER_WITHDRAW_QUEUE = [USDC_FLUX_GROUP, USDC_CORE_GROUP, USDC_FRV_GROUP, CENTRIFUGE_GROUP];

// The outer DEPOSIT queue is left untouched at its launch value, mirroring how FRV is handled: an
// async group has no business absorbing a synchronous lender deposit, so Centrifuge is filled by the
// Operator's `reallocate` instead. Kept here for whenever that decision is revisited.
// export const OUTER_DEPOSIT_QUEUE = [USDC_CORE_GROUP, USDC_FLUX_GROUP, CENTRIFUGE_GROUP];
export const OUTER_DEPOSIT_QUEUE_UNCHANGED = [USDC_CORE_GROUP, USDC_FLUX_GROUP];

// ---------------------------------------------------------------------------------------------------
// ACM role strings — copied verbatim from the _checkAccessAllowed(...) calls in
// venus-liquidity-hub/contracts/YieldGroup/base/YieldGroupBase.sol (8) and
// venus-liquidity-hub/contracts/YieldGroup/YieldGroupCentrifuge.sol (10). The role is
// keccak256(target, string), so a string that merely looks right grants nothing.
// ---------------------------------------------------------------------------------------------------
const YIELD_GROUP_BASE = [
  "addResource(address,address)",
  "removeResource(address)",
  "updateResourceAdapter(address,address)",
  "setInnerDepositQueue(address[])",
  "setInnerWithdrawQueue(address[])",
  "pauseResource(address)",
  "unpauseResource(address)",
  "sweep(address,address)",
];

const CENTRIFUGE_ONLY = [
  "requestRedeem(address,uint256)",
  "cancelDepositRequest(address)",
  "cancelRedeemRequest(address)",
  "claimDeposit(address)",
  "claimRedeem(address)",
  "claimCancelDeposit(address)",
  "claimCancelRedeem(address)",
  "setPriceGuard(address,address,uint64,bytes16,uint64)",
  "disablePriceGuard(address)",
  "forceRemoveResource(address)",
];

export const CENTRIFUGE_GOVERNANCE = [...YIELD_GROUP_BASE, ...CENTRIFUGE_ONLY];

// Guardian: containment and wind-down with no timelock delay — reorder the queues, pause a resource,
// and open/cancel async requests. No unpause, no claims, no sweep, no price-guard control.
export const CENTRIFUGE_GUARDIAN = [
  "setInnerDepositQueue(address[])",
  "setInnerWithdrawQueue(address[])",
  "pauseResource(address)",
  "requestRedeem(address,uint256)",
  "cancelDepositRequest(address)",
  "cancelRedeemRequest(address)",
];

// Keeper: the four claim functions only. All are idempotent and value-preserving.
export const CENTRIFUGE_KEEPER = [
  "claimDeposit(address)",
  "claimRedeem(address)",
  "claimCancelDeposit(address)",
  "claimCancelRedeem(address)",
];

const grant = (contract: string, sig: string, account: string): Command => ({
  target: ACM,
  signature: "giveCallPermission(address,string,address)",
  params: [contract, sig, account],
});

export const vip999 = () => {
  const meta = {
    version: "v2",
    title: "VIP-999 [BNB Chain] Onboard the Centrifuge yield group (JTRSY) into the USDC Liquidity Hub",
    description: `#### Summary

Registers a new **Centrifuge** yield group on the **USDC** Liquidity Hub and wires the Centrifuge
**JTRSY** ERC-7540 vault into it, so the Hub can allocate USDC into a tokenised T-bill fund alongside
its existing Core, Flux and FRV groups.

Centrifuge settles asynchronously: a deposit becomes a *request* that Centrifuge fills later, and a
redemption is a request plus a claim. The yield group therefore carries the extra lifecycle surface
(\`requestRedeem\`, the two cancellations, four claim functions) plus an optional NAV price-staleness
guard. Those permissions are split three ways in this proposal.

#### Actions (one atomic transaction, in order)

1. **ACM grants** on the new yield group: the full 18-signature governance set to the **Normal
   Timelock**; the operator/containment subset (both inner queues, \`pauseResource\`,
   \`requestRedeem\`, both cancellations) to the **Guardian**; the four claim functions to the
   **keeper**.
2. \`addResource(JTRSY vault, AdapterCentrifuge)\` on the group — must precede the queue setters,
   which reject an unregistered resource.
3. \`setInnerDepositQueue([JTRSY vault])\`.
4. \`setInnerWithdrawQueue([JTRSY vault])\`.
5. \`setPriceGuard(JTRSY vault, Spoke, poolId, scId, ${PRICE_GUARD_MAX_AGE})\` — arms the NAV
   staleness guard with a ${PRICE_GUARD_MAX_AGE / 86400}-day window.
6. \`addYieldGroup(Centrifuge group, 5,000,000, 2000 bps)\` on the USDC Hub — must precede the outer
   queue setters.
7. \`setOuterWithdrawQueue([Flux, Core, FRV, Centrifuge])\`.

The withdraw queue is rewritten in full because \`setOuterWithdrawQueue\` rejects a queue that omits
a registered group; Centrifuge is placed last, since a settled Centrifuge redemption is the slowest
path out.

The Hub's outer **deposit** queue is deliberately **left unchanged**. Centrifuge settles
asynchronously, so a lender deposit routed into it would sit in \`pendingDepositRequest\` until
Centrifuge fills it and a keeper claims it. The group is instead filled by the Operator's
\`reallocate\`, exactly as the FRV groups are.

#### Caps

Absolute **5,000,000** USDC and **20%** of Hub TVL. \`_effectiveCap\` takes the lower of the two, so
the percentage dimension binds at current TVL.

#### Notes

- The group proxy must be **memberlisted** on the JTRSY share token by Centrifuge. Without that entry
  \`claimDeposit\`, \`claimCancelRedeem\` and \`requestRedeem\` revert. Memberlist entries expire, so
  the agreed \`validUntil\` and its renewal belong on the monitoring rota.
- A firing price guard makes \`totalAssets()\` revert, which halts **every** Hub operation. The
  ${PRICE_GUARD_MAX_AGE / 86400}-day window is set well above Centrifuge's publication cadence for
  that reason; \`disablePriceGuard\` is the escape hatch.
- The CentrifugeBeacon receives governance ownership inside the deploy transaction (OpenZeppelin
  \`Ownable\` is single-step), so no \`acceptOwnership()\` appears here.
- The USDT and U Hubs are untouched.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ────────────────────────────────────────────────────────────────
      // 1. ACM permissions on the new yield group
      // ────────────────────────────────────────────────────────────────
      ...CENTRIFUGE_GOVERNANCE.map(sig => grant(CENTRIFUGE_GROUP, sig, NORMAL_TIMELOCK)),
      ...CENTRIFUGE_GUARDIAN.map(sig => grant(CENTRIFUGE_GROUP, sig, GUARDIAN)),
      ...CENTRIFUGE_KEEPER.map(sig => grant(CENTRIFUGE_GROUP, sig, KEEPER)),

      // ────────────────────────────────────────────────────────────────
      // 2. Register the JTRSY vault, then its inner queues and price guard
      // ────────────────────────────────────────────────────────────────
      {
        target: CENTRIFUGE_GROUP,
        signature: "addResource(address,address)",
        params: [JTRSY_VAULT, ADAPTER_CENTRIFUGE],
      },
      {
        target: CENTRIFUGE_GROUP,
        signature: "setInnerDepositQueue(address[])",
        params: [[JTRSY_VAULT]],
      },
      {
        target: CENTRIFUGE_GROUP,
        signature: "setInnerWithdrawQueue(address[])",
        params: [[JTRSY_VAULT]],
      },
      {
        target: CENTRIFUGE_GROUP,
        signature: "setPriceGuard(address,address,uint64,bytes16,uint64)",
        params: [JTRSY_VAULT, CENTRIFUGE_SPOKE, JTRSY_POOL_ID, JTRSY_SHARE_CLASS_ID, PRICE_GUARD_MAX_AGE],
      },

      // ────────────────────────────────────────────────────────────────
      // 3. Register the group on the Hub, then rewrite both outer queues
      // ────────────────────────────────────────────────────────────────
      {
        target: USDC_HUB,
        signature: "addYieldGroup(address,uint256,uint16)",
        params: [CENTRIFUGE_GROUP, CENTRIFUGE_ABSOLUTE_CAP, CENTRIFUGE_PERCENTAGE_CAP_BPS],
      },
      // Deliberately omitted — Centrifuge is filled by the Operator's `reallocate`, not the deposit
      // cascade. Uncomment (and restore OUTER_DEPOSIT_QUEUE above) only if that changes.
      // {
      //   target: USDC_HUB,
      //   signature: "setOuterDepositQueue(address[])",
      //   params: [OUTER_DEPOSIT_QUEUE],
      // },
      {
        target: USDC_HUB,
        signature: "setOuterWithdrawQueue(address[])",
        params: [OUTER_WITHDRAW_QUEUE],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip999;
