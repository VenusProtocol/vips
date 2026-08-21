import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// ===================================================================================================
// VIP-999 [BNB Chain] — Onboard the Centrifuge yield group (JTRSY + JAAA) into the USDT Liquidity Hub
//
// DRAFT. Pending before this can be proposed:
//   1. CENTRIFUGE_YIELD_GROUP — the YieldGroupCentrifuge BeaconProxy for the USDT Hub (not deployed).
//   2. ADAPTER_CENTRIFUGE — the stateless per-chain adapter (not deployed).
//   3. Centrifuge must memberlist the yield-group proxy on BOTH share tokens. Both use a
//      FullRestrictions hook, so without an entry claimDeposit, claimCancelRedeem and requestRedeem
//      revert. Entries expire — agree a validUntil and put renewal on the monitoring rota.
// Every other address below is live on BNB Chain and was verified on-chain (see notes inline).
// ===================================================================================================

const { ACCESS_CONTROL_MANAGER, NORMAL_TIMELOCK, CRITICAL_GUARDIAN } = NETWORK_ADDRESSES.bscmainnet;

export const ACM = ACCESS_CONTROL_MANAGER;
export { NORMAL_TIMELOCK, CRITICAL_GUARDIAN };

// Live Liquidity Hub keeper/operator multisig; holds `reallocate` on every Hub.
export const OPERATOR = "0x83f426233B358A36953F6951161E76FB7c866a7A";

// ---------------------------------------------------------------------------------------------------
// USDT Hub stack — verified: hub.asset() == USDT, registeredYieldGroups() == [core, flux, frv],
// outerDepositQueue() == [core, flux], outerWithdrawQueue() == [flux, core, frv].
// ---------------------------------------------------------------------------------------------------
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDT_HUB = "0x18AfDACF30F8671021dec4b78297E39d2FE87226";
export const USDT_CORE_YIELD_GROUP = "0xC9E6ceD9589363f8dC5695Be2C79AB4dDaECC94B";
export const USDT_FLUX_YIELD_GROUP = "0xe3df38E12E37ED80E1b3ccf2bdf84F9e1527ce14";
export const USDT_FRV_YIELD_GROUP = "0x621eF38cE0C4e7060fF0bF3D609E3D46EC144bE7";

// ---------------------------------------------------------------------------------------------------
// PENDING DEPLOYMENT — placeholders. The group must satisfy asset() == USDT and hub() == USDT_HUB.
// ---------------------------------------------------------------------------------------------------
export const CENTRIFUGE_YIELD_GROUP = "0x1111111111111111111111111111111111111111";
export const ADAPTER_CENTRIFUGE = "0x2222222222222222222222222222222222222222";

// ---------------------------------------------------------------------------------------------------
// Centrifuge v3 on BNB Chain — all live
// ---------------------------------------------------------------------------------------------------
export const CENTRIFUGE_SPOKE = "0xEC3582fcDc34078a4B7a8c75a5a3AE46f48525aB";

export const JTRSY_VAULT = "0x6e6B8498415083a4386BE83DD59Edd4366402FFa";
export const JTRSY_SHARE = "0xa5d465251fBCc907f5Dd6bB2145488DFC6a2627b";
export const JTRSY_POOL_ID = "281474976710662";
export const JTRSY_SHARE_CLASS_ID = "0x00010000000000060000000000000001";

export const JAAA_VAULT = "0xcbAfe61d84C6Fb88252a6Adf1C9CB0B9D029cb99";
export const JAAA_SHARE = "0x58F93d6b1EF2F44eC379Cb975657C132CBeD3B6b";
export const JAAA_POOL_ID = "281474976710663";
export const JAAA_SHARE_CLASS_ID = "0x00010000000000070000000000000001";

export const CENTRIFUGE_VAULTS = [JTRSY_VAULT, JAAA_VAULT];

export const PRICE_GUARD_MAX_AGE = 5 * 24 * 60 * 60; // 5 days

export const CENTRIFUGE_ABSOLUTE_CAP = parseUnits("5000000", 18).toString(); // 5,000,000 USDT
export const CENTRIFUGE_PERCENTAGE_CAP_BPS = 2_000; // 20% of Hub TVL

// The group joins the Hub's outer WITHDRAW queue (last) but its own inner withdraw queue is left
// UNSET
export const OUTER_WITHDRAW_QUEUE = [
  USDT_FLUX_YIELD_GROUP,
  USDT_CORE_YIELD_GROUP,
  USDT_FRV_YIELD_GROUP,
  CENTRIFUGE_YIELD_GROUP,
];

// Outer DEPOSIT queue unchanged
export const OUTER_DEPOSIT_QUEUE_UNCHANGED = [USDT_CORE_YIELD_GROUP, USDT_FLUX_YIELD_GROUP];

// ---------------------------------------------------------------------------------------------------
// ACM role strings — verbatim from the _checkAccessAllowed(...) calls in YieldGroupBase.sol (8) and
// YieldGroupCentrifuge.sol (10). The role is keccak256(target, string).
// ---------------------------------------------------------------------------------------------------
export const CENTRIFUGE_GOVERNANCE = [
  // YieldGroupBase (8)
  "addResource(address,address)",
  "removeResource(address)",
  "updateResourceAdapter(address,address)",
  "setInnerDepositQueue(address[])",
  "setInnerWithdrawQueue(address[])",
  "pauseResource(address)",
  "unpauseResource(address)",
  "sweep(address,address)",
  // YieldGroupCentrifuge (10)
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

// Critical Guardian: containment and wind-down, no timelock delay. No unpause, claims, sweep or
// price-guard control.
export const CENTRIFUGE_CRITICAL_GUARDIAN = [
  "setInnerDepositQueue(address[])",
  "setInnerWithdrawQueue(address[])",
  "pauseResource(address)",
  "requestRedeem(address,uint256)",
  "cancelDepositRequest(address)",
  "cancelRedeemRequest(address)",
];

// Keeper: the four claim functions only. All idempotent and value-preserving.
export const CENTRIFUGE_KEEPER = [
  "claimDeposit(address)",
  "claimRedeem(address)",
  "claimCancelDeposit(address)",
  "claimCancelRedeem(address)",
];

export const vip999 = () => {
  const meta = {
    version: "v2",
    title: "VIP-999 [BNB Chain] Onboard the Centrifuge yield group (JTRSY + JAAA) into the USDT Liquidity Hub",
    description: `#### Summary

Registers a new **Centrifuge** yield group on the **USDT** Liquidity Hub and wires two Centrifuge v3
ERC-7540 vaults into it — **JTRSY** (Janus Henderson Anemoy Treasury Fund) and **JAAA** (Janus
Henderson Anemoy AAA CLO Fund) — so the Hub can allocate USDT into tokenised funds alongside its
existing Core, Flux and FRV groups.

Centrifuge settles asynchronously: a deposit becomes a request Centrifuge fills later, and a
redemption is a request plus a claim. The yield group carries that extra lifecycle surface
(\`requestRedeem\`, two cancellations, four claims) plus an optional NAV price-staleness guard, and
those permissions are split three ways below.

#### Actions (one atomic transaction, in order)

1. **ACM grants** on the new yield group: the full 18-signature governance set to the **Normal
   Timelock**; the containment subset (both inner queues, \`pauseResource\`, \`requestRedeem\`, both
   cancellations) to the **Critical Guardian**; the four claim functions to the **keeper**.
2. \`addResource\` for the JTRSY and JAAA vaults behind the shared \`AdapterCentrifuge\` — must
   precede the queue setters, which reject an unregistered resource.
3. \`setInnerDepositQueue([JTRSY, JAAA])\`. The inner **withdraw** queue is deliberately left unset —
   see the note below.
4. \`setPriceGuard\` for each vault against the Centrifuge Spoke, with a **5-day** staleness window.
5. \`addYieldGroup(Centrifuge group, 5,000,000, 2000 bps)\` on the USDT Hub.
6. \`setOuterWithdrawQueue([Flux, Core, FRV, Centrifuge])\` — rewritten in full, because the Hub
   rejects a queue that omits a registered group holding a balance.

#### Caps

Absolute **5,000,000** USDT and **20%** of Hub TVL. \`_effectiveCap\` takes the lower of the two, so
the percentage dimension binds at the Hub's current TVL.

#### Notes

- **User withdrawals skip the invested Centrifuge position.** The group joins the Hub's outer
  withdraw queue, but its own inner withdraw queue is left unset. \`maxWithdraw()\` sums the inner
  withdraw queue plus idle balance, so it reports only idle USDT and returns **0** while the funds are
  in Centrifuge. The Hub clamps each withdraw leg to that figure and skips a zero, so lenders are paid
  from liquid groups such as Core and Flux while the position keeps counting in \`totalAssets()\`.
  Once a redeem settles and is claimable, a follow-up VIP calls \`setInnerWithdrawQueue\` — no Hub
  queue change is needed then.
- The Hub's outer **deposit** queue is left unchanged. Centrifuge settles asynchronously, so a lender
  deposit routed into it would sit in \`pendingDepositRequest\` until Centrifuge fills it and a keeper
  claims it. The group is filled by the Operator's \`reallocate\` instead, as FRV is.
- Both share tokens use a **FullRestrictions** hook, so Centrifuge must memberlist the yield-group
  proxy before \`claimDeposit\`, \`claimCancelRedeem\` and \`requestRedeem\` can succeed. Memberlist
  entries expire; renewal belongs on the monitoring rota.
- A firing price guard makes \`totalAssets()\` revert, halting **every** Hub operation. The Spoke
  reports an unbounded validity window for both share classes (\`maxAge\` = \`type(uint64).max\`), so
  the 5-day figure is derived from the observed publication cadence instead: NAV is published on
  business days, with 1-day gaps and 4 days worst observed over the last 60. That leaves one day of
  headroom, so the marker should be monitored; \`disablePriceGuard\` is the escape hatch.
- The CentrifugeBeacon receives governance ownership inside the deploy transaction (OpenZeppelin
  \`Ownable\` is single-step), so no \`acceptOwnership()\` appears here.
- The USDC and U Hubs are untouched.

#### Contracts

- USDT Hub: ${USDT_HUB}
- Centrifuge yield group: ${CENTRIFUGE_YIELD_GROUP} · AdapterCentrifuge: ${ADAPTER_CENTRIFUGE}
- JTRSY vault: ${JTRSY_VAULT} (share ${JTRSY_SHARE})
- JAAA vault: ${JAAA_VAULT} (share ${JAAA_SHARE})
- Centrifuge Spoke: ${CENTRIFUGE_SPOKE}`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1a. Governance: the full set to the Normal Timelock
      ...CENTRIFUGE_GOVERNANCE.map(sig => ({
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [CENTRIFUGE_YIELD_GROUP, sig, NORMAL_TIMELOCK],
      })),

      // 1b. Containment: the wind-down subset to the Critical Guardian
      ...CENTRIFUGE_CRITICAL_GUARDIAN.map(sig => ({
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [CENTRIFUGE_YIELD_GROUP, sig, CRITICAL_GUARDIAN],
      })),

      // 1c. Claims: the four claim functions to the keeper
      ...CENTRIFUGE_KEEPER.map(sig => ({
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [CENTRIFUGE_YIELD_GROUP, sig, OPERATOR],
      })),

      // 2. Register both vaults, then the inner queues and price guards
      {
        target: CENTRIFUGE_YIELD_GROUP,
        signature: "addResource(address,address)",
        params: [JTRSY_VAULT, ADAPTER_CENTRIFUGE],
      },
      {
        target: CENTRIFUGE_YIELD_GROUP,
        signature: "addResource(address,address)",
        params: [JAAA_VAULT, ADAPTER_CENTRIFUGE],
      },
      {
        target: CENTRIFUGE_YIELD_GROUP,
        signature: "setInnerDepositQueue(address[])",
        params: [CENTRIFUGE_VAULTS],
      },
      {
        target: CENTRIFUGE_YIELD_GROUP,
        signature: "setPriceGuard(address,address,uint64,bytes16,uint64)",
        params: [JTRSY_VAULT, CENTRIFUGE_SPOKE, JTRSY_POOL_ID, JTRSY_SHARE_CLASS_ID, PRICE_GUARD_MAX_AGE],
      },
      {
        target: CENTRIFUGE_YIELD_GROUP,
        signature: "setPriceGuard(address,address,uint64,bytes16,uint64)",
        params: [JAAA_VAULT, CENTRIFUGE_SPOKE, JAAA_POOL_ID, JAAA_SHARE_CLASS_ID, PRICE_GUARD_MAX_AGE],
      },

      // 3. Register the group on the Hub, then append it to the outer withdraw queue
      {
        target: USDT_HUB,
        signature: "addYieldGroup(address,uint256,uint16)",
        params: [CENTRIFUGE_YIELD_GROUP, CENTRIFUGE_ABSOLUTE_CAP, CENTRIFUGE_PERCENTAGE_CAP_BPS],
      },
      {
        target: USDT_HUB,
        signature: "setOuterWithdrawQueue(address[])",
        params: [OUTER_WITHDRAW_QUEUE],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip999;
