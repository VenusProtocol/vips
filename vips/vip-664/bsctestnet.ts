import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ABSOLUTE_CAP_UNBOUNDED,
  ACM,
  ADAPTER_CENTRIFUGE,
  CENTRIFUGE_SOURCE_USDT,
  CORE_SOURCE_USDT,
  FLUX_SOURCE_USDT,
  FRV_SOURCE_USDT,
  GUARDIAN,
  HUB_USDT,
  KEEPER,
  MOCK_CENTRIFUGE_VAULT_USDT,
  NORMAL_TIMELOCK,
  OPERATOR,
  PERCENTAGE_CAP_DISABLED,
} from "./addresses/bsctestnet";
import {
  CENTRIFUGE_GOVERNANCE,
  CENTRIFUGE_GUARDIAN,
  CENTRIFUGE_KEEPER,
  CENTRIFUGE_OPERATOR,
  PAUSE_HUB,
  giveCallPermission,
} from "./permissions";

// ---------------------------------------------------------------------------------------------------
// VIP-664 — BNB Chain Testnet. Onboard the Centrifuge YieldGroup to Liquidity Hub (USDT).
//
// One atomic proposal: grant the ACM roles on the new source, grant the source itself `pauseHub()` on
// the Hub, then register the fund and wire the group.
//
// Ordering is load-bearing and must not be reshuffled:
//   - every grant precedes every call that needs it (the Normal Timelock executes this proposal and
//     is the caller of `addResource`, the queue setters and `addYieldGroup`);
//   - `addResource` precedes the inner-queue setters, which reject unregistered resources;
//   - `addYieldGroup` precedes the outer-queue setters, which reject unregistered groups.
//
// OUTER QUEUES. Centrifuge joins the WITHDRAW queue but NOT the deposit queue. Centrifuge settles
// asynchronously — a subscription is filled by the fund manager, off-chain and cross-chain, over
// days. Routing an ordinary user deposit there would park that user's capital in
// `pendingDepositRequest`, unwithdrawable until the fund settles, for a product they never chose.
// Capital enters this group only when an Operator reallocates into it with a resource-targeted leg.
// It must still appear in the withdraw queue: `HubAdminLib._requireWithdrawQueueCoversFundedYieldGroups`
// rejects a queue that omits a registered group holding a balance, and the group reports
// `maxWithdraw() == 0` while invested, so the cascade probes it, sees no liquidity and moves on.
//
// PRICE GUARDS ARE NOT ARMED HERE. The growth cap, the drop floor and the age guard are opt-in per
// resource and each needs a sizing decision against observed NAV behaviour; an over-tight value is a
// self-inflicted halt. The roles are granted, so arming them later needs no further VIP. The
// `pauseHub()` grant below is made now regardless, because it is the drop guard's only reaction and
// is the single easiest thing to forget.
//
// THE REGISTERED FUND IS A TESTNET MOCK. Centrifuge has no BSC-testnet deployment, so there is no
// real ERC-7540 fund on chain 97. See the note on MOCK_CENTRIFUGE_VAULT_USDT in ./addresses/bsctestnet.
// ---------------------------------------------------------------------------------------------------

const CENTRIFUGE_ONLY = [MOCK_CENTRIFUGE_VAULT_USDT];

// Withdraw queue after Centrifuge joins. FRV -> Flux -> Centrifuge -> Core preserves VIP-650's order
// and inserts Centrifuge ahead of Core, which stays at the tail as the unbounded liquid backstop.
const OUTER_WITHDRAW_QUEUE = [FRV_SOURCE_USDT, FLUX_SOURCE_USDT, CENTRIFUGE_SOURCE_USDT, CORE_SOURCE_USDT];

// Deposit queue is UNCHANGED from VIP-650 — Centrifuge is deliberately absent (see header).
const OUTER_DEPOSIT_QUEUE = [FRV_SOURCE_USDT, FLUX_SOURCE_USDT, CORE_SOURCE_USDT];

// On testnet the Guardian multisig plays Operator, Keeper AND Guardian, so those three role sets
// overlap — `pauseResource(address)` appears in both the Operator and the Guardian set. Two grants of
// the same (contract, signature, account) encode to byte-identical proposal actions, and
// `GovernorBravo::queueOrRevertInternal` rejects the second with "identical proposal action already
// queued at eta". Deduplicating by holder keeps the role sets themselves honest and separate; on
// mainnet, where the three holders are distinct addresses, nothing is removed.
const dedupeGrants = (grants: { account: string; sig: string }[]) => {
  const seen = new Set<string>();
  return grants.filter(({ account, sig }) => {
    const key = `${account.toLowerCase()}:${sig}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const grantsOnSource = () =>
  dedupeGrants([
    // Governance: the full gated surface of YieldGroupCentrifuge. Normal Timelock only, matching
    // VIP-650's testnet proposal — granting all three timelocks tripled the ACM writes and pushed the
    // whole proposal past the 30M block gas limit.
    ...CENTRIFUGE_GOVERNANCE.map(sig => ({ account: NORMAL_TIMELOCK, sig })),
    // Operator: queues, pause-down and the async wind-down surface.
    ...CENTRIFUGE_OPERATOR.map(sig => ({ account: OPERATOR, sig })),
    // Keeper: the four claim entry points.
    ...CENTRIFUGE_KEEPER.map(sig => ({ account: KEEPER, sig })),
    // Guardian: containment only.
    ...CENTRIFUGE_GUARDIAN.map(sig => ({ account: GUARDIAN, sig })),
  ]).map(({ account, sig }) => giveCallPermission(ACM, CENTRIFUGE_SOURCE_USDT, sig, account));

export const vip664 = () => {
  const meta = {
    version: "v2",
    title: "VIP-664 [BNB Chain Testnet] Liquidity Hub (USDT) — onboard the Centrifuge YieldGroup",
    description: `#### Summary

Onboards the **Centrifuge YieldGroup** to the Liquidity Hub (USDT) on BNB Chain Testnet: grants the ACM
roles on the newly deployed source, registers a Centrifuge ERC-7540 fund behind **AdapterCentrifuge**,
and adds the group to the Hub.

Centrifuge is the first **asynchronous** yield source on the Hub. Deposits and redemptions are escrowed
and settled later by the fund manager at a published NAV, so the group adds request, cancel and claim
operations that the synchronous \`IYieldGroupBase\` surface has no way to express.

The fund registered here is a **testnet mock** controlled by Venus. Centrifuge has no BSC-testnet
deployment, so there is no real ERC-7540 fund on chain 97 to point at; the mock presents the surface the
adapter reads and lets a fund-manager key drive the NAV and settle requests, which is what makes the
async lifecycle and the price defences testable on a live network.

#### Actions (one atomic transaction, in order)

1. Grant the **Normal Timelock** the full gated surface of **CentrifugeSource_USDT**, the Guardian the
   containment subset, and the Operator/Keeper their respective subsets.
2. Grant **CentrifugeSource_USDT** itself the \`pauseHub()\` role on **Hub_USDT**. The drop guard's only
   reaction is the group calling \`pauseHub()\`; without this role a genuine breach would make the
   permissionless \`enforceDropGuard\` revert instead of pausing.
3. Register the Centrifuge vault on the source behind **AdapterCentrifuge** (\`addResource\`), then set the
   source's inner deposit and withdraw queues.
4. Register the source on **Hub_USDT** (\`addYieldGroup\`), uncapped, matching testnet policy for the
   existing three groups.
5. Set the Hub's outer withdraw queue to **FRV → Flux → Centrifuge → Core**.

#### Deposit routing

The Centrifuge group joins the **withdraw** queue only; the deposit queue is unchanged. Because
Centrifuge settles over days, an ordinary user deposit routed there would sit unwithdrawable in a
pending request for a product the user never chose. Capital enters this group only through an
Operator reallocation targeted at the vault. It must still be listed in the withdraw queue, because the
Hub rejects a withdraw queue that omits a registered group holding a balance; while invested the group
reports zero withdrawable liquidity, so the cascade skips over it.

#### Price defences

Centrifuge share prices are unbounded and published cross-chain by the pool manager, so the group ships
three opt-in defences: a growth cap that clamps an implausible rise, a drop floor that halts valuation
and pauses the Hub on an implausible fall, and a staleness guard on both of Centrifuge's price markers.
**None is armed by this proposal** — each needs a sizing decision against observed NAV behaviour, and an
over-tight value is a self-inflicted halt. The roles are granted here so arming them later needs no
further VIP.

#### References

- [Centrifuge YieldGroup pull request](https://github.com/VenusProtocol/venus-liquidity-hub/pull/21)
- [VIP-650: Liquidity Hub onboarding](https://app.venus.io/#/governance/proposal/650)`,
    forDescription: "I agree that Venus Protocol should proceed with onboarding the Centrifuge YieldGroup",
    againstDescription: "I do not think that Venus Protocol should proceed with onboarding the Centrifuge YieldGroup",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with onboarding the Centrifuge YieldGroup",
  };

  return makeProposal(
    [
      // 1. ACM roles on the new source.
      ...grantsOnSource(),

      // 2. The source's own `pauseHub()` role on the Hub — the drop guard's only reaction.
      giveCallPermission(ACM, HUB_USDT, PAUSE_HUB, CENTRIFUGE_SOURCE_USDT),

      // 3. Register the fund behind AdapterCentrifuge, then set the source's inner queues.
      {
        target: CENTRIFUGE_SOURCE_USDT,
        signature: "addResource(address,address)",
        params: [MOCK_CENTRIFUGE_VAULT_USDT, ADAPTER_CENTRIFUGE],
      },
      {
        target: CENTRIFUGE_SOURCE_USDT,
        signature: "setInnerDepositQueue(address[])",
        params: [CENTRIFUGE_ONLY],
      },
      {
        target: CENTRIFUGE_SOURCE_USDT,
        signature: "setInnerWithdrawQueue(address[])",
        params: [CENTRIFUGE_ONLY],
      },

      // 4. Register the group on the Hub, uncapped.
      {
        target: HUB_USDT,
        signature: "addYieldGroup(address,uint256,uint16)",
        params: [CENTRIFUGE_SOURCE_USDT, ABSOLUTE_CAP_UNBOUNDED, PERCENTAGE_CAP_DISABLED],
      },

      // 5. Outer queues: Centrifuge joins the withdraw cascade; the deposit queue is unchanged.
      { target: HUB_USDT, signature: "setOuterDepositQueue(address[])", params: [OUTER_DEPOSIT_QUEUE] },
      { target: HUB_USDT, signature: "setOuterWithdrawQueue(address[])", params: [OUTER_WITHDRAW_QUEUE] },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664;
