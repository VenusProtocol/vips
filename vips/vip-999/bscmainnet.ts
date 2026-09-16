import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ACCESS_CONTROL_MANAGER, NORMAL_TIMELOCK, GUARDIAN, CRITICAL_TIMELOCK, FAST_TRACK_TIMELOCK } =
  NETWORK_ADDRESSES.bscmainnet;

export const ACM = ACCESS_CONTROL_MANAGER;
export { NORMAL_TIMELOCK, GUARDIAN, CRITICAL_TIMELOCK, FAST_TRACK_TIMELOCK };

// The routine operator, same account vip-650 granted the Hub operator surface to.
export const OPERATOR = "0x83f426233B358A36953F6951161E76FB7c866a7A";

// The bot that sweeps settled Centrifuge claims once a day.
export const KEEPER = "0x7B1AE5Ea599bC56734624b95589e7E8E64C351c9";

// ---------------------------------------------------------------------------------------------------
// Live Hub stack (deployed, verified on chain).
// ---------------------------------------------------------------------------------------------------
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const HUB_USDT = "0x18AfDACF30F8671021dec4b78297E39d2FE87226";
export const CORE_SOURCE_USDT = "0xC9E6ceD9589363f8dC5695Be2C79AB4dDaECC94B";
export const FLUX_SOURCE_USDT = "0xe3df38E12E37ED80E1b3ccf2bdf84F9e1527ce14";
export const FRV_SOURCE_USDT = "0x621eF38cE0C4e7060fF0bF3D609E3D46EC144bE7";
export const CORE_SOURCE_USDC = "0x299D9Be7CEfff91c68F13F267d525CFC18e965ef";
export const FLUX_SOURCE_USDC = "0xA65bB4b20542268B64CF08871a98D75342AFE927";
export const FRV_SOURCE_USDC = "0x438388847eE16850Ab4f5b82dc7954c0d043B716";
export const CORE_SOURCE_U = "0x8A680F77A5367FA7cD33a02f51896Cb1d55159c3";
export const FLUX_SOURCE_U = "0xe31B8851c3fa9B3dD39a04a2ed9493869A410616";
export const FRV_SOURCE_U = "0x30908eddB9E94add7AC9944a0adda66d80B89143";

// ---------------------------------------------------------------------------------------------------
// Centrifuge's live BNB Chain deployment.
// ---------------------------------------------------------------------------------------------------
export const CENTRIFUGE_BASE_MANAGER = "0xF48256AbDDf96EcDDc4B3DbD23E8C1921f9761Ae";

export const JTRSY_VAULT = "0x6e6B8498415083a4386BE83DD59Edd4366402FFa";
export const JTRSY_SHARE = "0xa5d465251fBCc907f5Dd6bB2145488DFC6a2627b";
export const JTRSY_POOL_ID = "281474976710662";
export const JTRSY_SHARE_CLASS_ID = "0x00010000000000060000000000000001";

export const JAAA_VAULT = "0xcbAfe61d84C6Fb88252a6Adf1C9CB0B9D029cb99";
export const JAAA_SHARE = "0x58F93d6b1EF2F44eC379Cb975657C132CBeD3B6b";
export const JAAA_POOL_ID = "281474976710663";
export const JAAA_SHARE_CLASS_ID = "0x00010000000000070000000000000001";

// ---------------------------------------------------------------------------------------------------
// The Centrifuge YieldGroup family, deployed on BNB Chain.
// ---------------------------------------------------------------------------------------------------
export const ADAPTER_CENTRIFUGE = "0x680cE4422264ecDAd3590cB50FE254D4c153f427";
export const CENTRIFUGE_BEACON = "0xAe90Cfb3E2Bc97508F58E7e076Acf38f3bfC820f";
export const YIELD_GROUP_CENTRIFUGE_IMPL = "0x4996aa488f5269B5C544Dab1C2d1126F6bBdFF24";
export const CENTRIFUGE_SOURCE_USDT = "0xDA5AFfeb43719f517676E031a727071c7D400983";

// ---------------------------------------------------------------------------------------------------
// Caps for Hub.addYieldGroup(source, absoluteCap, percentageCapBps).
// ---------------------------------------------------------------------------------------------------
export const CENTRIFUGE_ABSOLUTE_CAP = parseUnits("5000000", 18).toString();
export const CENTRIFUGE_PERCENTAGE_CAP_BPS = 2_500; // 25% of TVL

export const CENTRIFUGE_RESOURCES = [JTRSY_VAULT, JAAA_VAULT];

export const NAV_GUARD_INTERVAL = 86_400; // re-anchor at most once a day
export const NAV_GUARD_CAP_ENABLED = true;
export const NAV_GUARD_FLOOR_ENABLED = true;
export const SET_NAV_GUARD_RATE = "setNavGuardRate(address,uint16,uint16,uint16,uint32,bool,bool)";
export const SET_SPOT_APY = "setSpotAPYBps(address,uint64)";

export const NAV_GUARDS = [
  { resource: JTRSY_VAULT, driftBps: 500, upGapBps: 200, downGapBps: 500 },
  { resource: JAAA_VAULT, driftBps: 550, upGapBps: 200, downGapBps: 500 },
];

export const SPOT_APY_BPS = [
  { resource: JTRSY_VAULT, apyBps: 340 },
  { resource: JAAA_VAULT, apyBps: 431 },
];

export const OUTER_WITHDRAW_QUEUE = [FLUX_SOURCE_USDT, CORE_SOURCE_USDT, FRV_SOURCE_USDT, CENTRIFUGE_SOURCE_USDT];

// The source's own withdraw cascade: both funds, JTRSY first. The deposit side stays unset.
export const INNER_WITHDRAW_QUEUE = [JTRSY_VAULT, JAAA_VAULT];

// The 84 ACM grants are pre-loaded into the ACMCommandsAggregator by ./scripts/addGrantPermissions.ts.
//
// The index is the aggregator's next free grant slot at the moment of loading — entries are
// append-only, so a stale index replays whatever else occupies that slot.
export const ACM_AGGREGATOR = "0x8b443Ea6726E56DF4C4F62f80F0556bB9B2a7c64";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ACM_AGGREGATOR_INDEX = 5;

export const vip999Mainnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-999 [BNB Chain] Liquidity Hub (USDT) — onboard the Centrifuge YieldGroup",
    description: `#### Summary

Onboards the **Centrifuge YieldGroup** to the Liquidity Hub (USDT) on BNB Chain: grants the ACM roles
on the newly deployed source, registers Centrifuge's two live BNB Chain funds — **JTRSY** and **JAAA** —
behind **AdapterCentrifuge**, configures a NAV band on each, and adds the group to the Hub.

Centrifuge is the first **asynchronous** yield source on the Hub. Deposits and redemptions are escrowed
and settled later by the fund manager at a published NAV, so the group adds request, cancel and claim
operations that the synchronous \`IYieldGroupBase\` surface has no way to express.

No capital moves in this proposal.

#### The two funds

Both are live ERC-7540 vaults on BNB Chain denominated in USDT, sharing one Centrifuge
AsyncRequestManager. Both share tokens are 6-decimal while USDT is 18-decimal, which the adapter
handles by reading decimals off the vault rather than assuming them.

| Fund | Vault | Share |
| --- | --- | --- |
| JTRSY | \`${JTRSY_VAULT}\` | \`${JTRSY_SHARE}\` |
| JAAA | \`${JAAA_VAULT}\` | \`${JAAA_SHARE}\` |

#### Roles

| Holder | Signatures | Surface |
| --- | --- | --- |
| Normal Timelock | 20 | everything |
| Operator | 16 | queues, the async lifecycle, pausing and unpausing a fund, repointing an adapter, the NAV band, the published APY |
| Keeper | 4 | the four claim functions, nothing else |
| Guardian | 8 | containment, unpausing, repointing an adapter, the NAV band, the published APY |

The Fast-Track and Critical timelocks are granted nothing, which is how the rest of the Liquidity Hub
already stands: neither holds a signature on any Hub, source or the registry today, and the Centrifuge
source stays on that footing.

\`updateResourceAdapter\` and \`unpauseResource\` are Normal-Timelock-only on every source live today, so
the cheapest remedy for a bad adapter or a stale pause costs a proposal. This proposal grants both to
the Guardian and the Operator across all ten sources — the nine already running under the USDT, USDC
and U hubs as well as the new Centrifuge one — so a fix that needs nothing more than repointing a
resource or lifting a pause can happen the same day. Neither signature moves capital:
\`updateResourceAdapter\` swaps the contract that values and routes a resource, and \`unpauseResource\`
only restores flow the same accounts can stop again. Both accounts already hold \`pauseResource\`
everywhere, so this is the other half of a pause they can already apply.

\`sweep\` refuses \`asset()\` and every registered resource, but here the resource is the vault while the
token this contract actually holds is the vault's \`share()\` — which it would not refuse, so a sweep
could move an entire fund position out. The Normal Timelock alone holds it.

The Guardian's eight signatures are \`pauseResource\`, \`unpauseResource\`, \`updateResourceAdapter\`,
\`forceRemoveResource\`, the three band setters and \`setSpotAPYBps\`. Two of the band setters write value
directly: \`setNavGuardSnapshot\` sets the anchor to any figure, and \`setNavGuardEnabled\` decides whether
the band binds — so with both, the Guardian and the Operator, which holds the same three, can move what
the Hub reports this position to be worth. That is a deliberate grant, not only a containment one: the
band is the group's one value defence, and an anchor left stale on a fund that has genuinely moved
misreports it on every Hub read until someone resets it.

\`forceRemoveResource\` is the Guardian's other non-containment power, and it is held for a specific
failure. \`AdapterCentrifuge\` refuses to value a share-holding position at a zero or unreadable price,
and \`Hub.totalAssets()\` sums every group without catching, so a Centrifuge price outage stops every
Hub flow — for depositors with no Centrifuge exposure too. Pausing does not clear it: neither
\`pauseResource\` nor \`pauseYieldGroup\` drops the position out of that sum.

Recovery needs a proposal on either route. \`Hub.removeYieldGroup\` skips the balance check on a group
whose \`totalAssets()\` reverts and needs no pause, so a single Normal Timelock VIP clears the outage —
but it evicts the whole group, both funds and all. The Guardian's route is \`pauseHub\` →
\`forceRemoveResource\` → \`unpauseHub\`, which writes off only the fund whose price is missing and
leaves the other registered. The Guardian holds the first two; \`unpauseHub\` is the Normal Timelock's
alone, so the Hub stays paused until a proposal lifts it. What the grant buys is scope, not speed: one
fund written off rather than the group, with the Hub held still while that happens.

The 84 grants are pre-loaded off chain into the **ACMCommandsAggregator**
(\`${ACM_AGGREGATOR}\`, grant batch index ${ACM_AGGREGATOR_INDEX}). Inline they do not fit:
\`propose()\` stores the whole proposal in one transaction, and at 41 grants that already cost
16,583,328 gas through the proposer Safe — 98.8% of the 16,777,216 per-tx cap. At 84 it is well over.
The
proposal lends the aggregator \`DEFAULT_ADMIN_ROLE\` on the AccessControlManager, replays the batch, and
revokes the role in the same transaction, so the aggregator never holds ACM admin outside this
proposal.

#### Value defence

The group ships one defence: a **NAV guard**, a band around the value each fund reports, held to an
anchor that drifts at a rate governance publishes. A reading outside the band is reported at the edge
of it; it never reverts and never pauses the Hub.

| Fund | Realized rate | Drift set | Band up | Band down | Re-anchor |
| --- | --- | --- | --- | --- | --- |
| JTRSY | 3.40% a year | 5.00% | 2% | 5% | daily |
| JAAA | 4.31% a year | 5.50% | 2% | 5% | daily |

Drift is not each fund's current rate, it is the ceiling the band vouches for between readings, and
each fund gets its own: JTRSY has returned 3.40% a year since launch and never printed a down day,
while JAAA has returned 4.31% through a visibly rougher patch, including a negative month. Both are
set above what the fund realizes today, because both hold short-dated paper and earn what the front
end of the curve pays. With T-bills near 3.8–4.1% against a 5.3% peak in this cycle, a drift pinned to
today's rate would start clamping a healthy position the moment rates turned.

The gaps bound the jump a single NAV update may make, and they are not symmetric. 2% up is already far
more than either fund has printed in one update — the furthest either has strayed from its own
drifting anchor over any two-week stretch is roughly 0.4%. 5% down is wider on purpose: clamping at
the floor over-reports a loss the fund has really taken, so the floor is sized to catch an absurd
reading rather than a bad week, while drift carries the upward expectation already.

Centrifuge publishes no rate on chain, so the reported APY comes from \`setSpotAPYBps\`, set per fund.
This proposal publishes each fund's realized rate — 3.40% for JTRSY, 4.31% for JAAA. Left unset the
group reports zero, which drags the Hub's advertised APY down, because the Hub weights each group's
rate by the value it holds. It is a figure governance keeps current rather than one the chain
derives, which is why \`setSpotAPYBps\` is held by the Operator and the Guardian as well as the Normal
Timelock: correcting a stale one should not wait days.

#### Actions (one atomic transaction, in order)

1. Grant \`DEFAULT_ADMIN_ROLE\` to the ACMCommandsAggregator, replay the grant batch, and revoke the
   role. The batch covers the new source, and \`updateResourceAdapter\` and \`unpauseResource\` on the
   nine sources already live under the USDT, USDC and U hubs.
2. Register both funds on the source behind **AdapterCentrifuge** (\`addResource\`).
3. Set the source's inner withdraw queue to both funds, JTRSY first. The inner deposit queue is left
   unset.
4. Configure the NAV band on each fund.
5. Publish the starting APY for each fund.
6. Register the group on the Hub with an absolute cap of 5,000,000 USDT and a 25% cap on TVL.
7. Append Centrifuge to the **end** of the Hub's withdraw cascade, leaving the existing order and the
   deposit queue untouched.

The **inner deposit queue is deliberately left unset**, so an ordinary Hub deposit never routes into a
fund that settles over days. Capital enters this group only through an Operator \`reallocate\` aimed at
a named fund, which does not consult the queue.

The **inner withdraw queue is set to both funds**, JTRSY first, because the withdraw side is not
symmetric: the source refuses a queue that omits a fund holding a balance, so once either fund is
funded the queue has to name it — setting it now rather than in a later proposal. It does not open a
path to redeeming a fund on demand. A cascade reaching this group can only spend what the source
already holds idle, which is a redemption Centrifuge has already settled and the Keeper has already
claimed; a position still in shares or still in flight reports nothing withdrawable. The order decides
which settled balance is spent first, nothing more.

Both are a starting configuration rather than a guarantee: the Operator holds both inner-queue setters
and can change either without a further proposal.

#### Deployed contracts (BNB Chain)

- AdapterCentrifuge: \`${ADAPTER_CENTRIFUGE}\`
- YieldGroupCentrifuge (implementation): \`${YIELD_GROUP_CENTRIFUGE_IMPL}\`
- CentrifugeBeacon: \`${CENTRIFUGE_BEACON}\` — owned by the Normal Timelock
- CentrifugeSource_USDT: \`${CENTRIFUGE_SOURCE_USDT}\` — a BeaconProxy with no owner of its own, so
  every gated call on it is ACM-controlled

#### References

- The BNB Chain Testnet proposal that onboarded the Centrifuge YieldGroup
- HashDit audit of the Centrifuge YieldGroup`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      { target: ACM, signature: "grantRole(bytes32,address)", params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR] },
      { target: ACM_AGGREGATOR, signature: "executeGrantPermissions(uint256)", params: [ACM_AGGREGATOR_INDEX] },
      { target: ACM, signature: "revokeRole(bytes32,address)", params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR] },

      ...CENTRIFUGE_RESOURCES.map(resource => ({
        target: CENTRIFUGE_SOURCE_USDT,
        signature: "addResource(address,address)",
        params: [resource, ADAPTER_CENTRIFUGE],
      })),
      {
        target: CENTRIFUGE_SOURCE_USDT,
        signature: "setInnerWithdrawQueue(address[])",
        params: [INNER_WITHDRAW_QUEUE],
      },

      ...NAV_GUARDS.map(band => ({
        target: CENTRIFUGE_SOURCE_USDT,
        signature: SET_NAV_GUARD_RATE,
        params: [
          band.resource,
          band.driftBps,
          band.upGapBps,
          band.downGapBps,
          NAV_GUARD_INTERVAL,
          NAV_GUARD_CAP_ENABLED,
          NAV_GUARD_FLOOR_ENABLED,
        ],
      })),

      ...SPOT_APY_BPS.map(fund => ({
        target: CENTRIFUGE_SOURCE_USDT,
        signature: SET_SPOT_APY,
        params: [fund.resource, fund.apyBps],
      })),
      {
        target: HUB_USDT,
        signature: "addYieldGroup(address,uint256,uint16)",
        params: [CENTRIFUGE_SOURCE_USDT, CENTRIFUGE_ABSOLUTE_CAP, CENTRIFUGE_PERCENTAGE_CAP_BPS],
      },
      { target: HUB_USDT, signature: "setOuterWithdrawQueue(address[])", params: [OUTER_WITHDRAW_QUEUE] },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip999Mainnet;
