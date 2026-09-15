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
export const CENTRIFUGE_PERCENTAGE_CAP_BPS = 2_000; // 20% of TVL

export const CENTRIFUGE_RESOURCES = [JTRSY_VAULT, JAAA_VAULT];

export const NAV_GUARD_INTERVAL = 86_400; // re-anchor at most once a day
export const NAV_GUARD_CAP_ENABLED = false;
export const NAV_GUARD_FLOOR_ENABLED = false;
export const SET_NAV_GUARD_RATE = "setNavGuardRate(address,uint16,uint16,uint16,uint32,bool,bool)";

// Drift is each fund's own realized rate since launch (JTRSY 3.40%, JAAA 4.31% a year). The 5% band
// is a backstop against an absurd reading, not a tracking budget: neither fund has strayed past 0.4%.
export const NAV_GUARDS = [
  { resource: JTRSY_VAULT, driftBps: 350, upGapBps: 500, downGapBps: 500 },
  { resource: JAAA_VAULT, driftBps: 450, upGapBps: 500, downGapBps: 500 },
];

export const OUTER_WITHDRAW_QUEUE = [FLUX_SOURCE_USDT, CORE_SOURCE_USDT, FRV_SOURCE_USDT, CENTRIFUGE_SOURCE_USDT];

// The 59 ACM grants are pre-loaded into the ACMCommandsAggregator by ./scripts/addGrantPermissions.ts.
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
| Fast-Track Timelock | 20 | everything |
| Operator | 10 | queues, the async lifecycle, pausing one fund |
| Keeper | 4 | the four claim functions, nothing else |
| Guardian | 5 | containment and the NAV band |

Outside the two timelocks nobody is granted \`unpauseResource\`, so the Guardian can contain a fund but
never undo a governance-ordered pause. The Operator is not granted the NAV band: the account that moves
the capital is not the account that decides what its value may be reported as.

The Guardian's five signatures are \`pauseResource\`, \`forceRemoveResource\` and the three band setters.
Two of those write value directly: \`setNavGuardSnapshot\` sets the anchor to any figure, and
\`setNavGuardEnabled\` decides whether the band binds — so with both, the Guardian can move what the Hub
reports this position to be worth. That is a deliberate grant, not only a containment one.

The 59 grants are pre-loaded off chain into the **ACMCommandsAggregator**
(\`${ACM_AGGREGATOR}\`, grant batch index ${ACM_AGGREGATOR_INDEX}). Inline they do not fit:
\`propose()\` stores the whole proposal in one transaction, and at that size it costs 16,583,328 gas
through the proposer Safe — 98.8% of the 16,777,216 per-tx cap, with no room for state drift. The proposal lends the aggregator \`DEFAULT_ADMIN_ROLE\` on the AccessControlManager,
replays the batch, and revokes the role in the same transaction, so the aggregator never holds ACM
admin outside this proposal.

#### Value defence

The group ships one defence: a **NAV guard**, a band around the value each fund reports, held to an
anchor that drifts at a rate governance publishes. A reading outside the band is reported at the edge
of it; it never reverts and never pauses the Hub.

| Fund | Realized rate | Drift set | Band either side | Re-anchor |
| --- | --- | --- | --- | --- |
| JTRSY | 3.40% a year | 3.50% | 5% | daily |
| JAAA | 4.31% a year | 4.50% | 5% | daily |

Drift is what the band vouches for between readings, so each fund gets its own rather than one shared
figure: JTRSY has returned 3.40% a year since launch and never printed a down day, while JAAA has
returned 4.31% through a visibly rougher patch, including a negative month.

The band around that is deliberately wide. The furthest either fund has strayed from its own drifting
anchor over any two-week stretch is roughly 0.4%, so 5% leaves more than ten times the room ordinary
movement needs. It is meant to catch a fund reporting something absurd, not to track it closely — a
band tight enough to bind on normal movement would misreport a healthy position on every Hub read, and
clamping at the floor would under-report a loss the fund had really taken.

**Both sides ship switched off**, so today the value each fund reports passes through untouched. That
is deliberate: the band is configured while the position is still empty, so its anchor starts at zero,
and a deposit raises only the centre — switched on now it would have no width at all and would report
a funded position at what was paid for it. Off, it still drifts and re-anchors in the background,
converging on the real position, ready to bind the moment it is turned on. Switching it on is the
Guardian's call, alongside governance.

Centrifuge publishes no rate on chain, so the reported APY comes from \`setSpotAPYBps\`, which
governance sets per fund. It is left at zero here.

#### Actions (one atomic transaction, in order)

1. Grant \`DEFAULT_ADMIN_ROLE\` to the ACMCommandsAggregator, replay the grant batch, and revoke the
   role.
2. Register both funds on the source behind **AdapterCentrifuge** (\`addResource\`).
3. Configure the NAV band on each fund, with both sides off.
4. Register the group on the Hub with an absolute cap of 5,000,000 USDT and a 20% cap on TVL.
5. Append Centrifuge to the **end** of the Hub's withdraw cascade, leaving the existing order and the
   deposit queue untouched.

The source's **inner queues are deliberately left unset**. Capital enters and leaves this group only
through an Operator \`reallocate\` aimed at a named fund, which does not consult them; leaving them
empty keeps ordinary Hub deposits and withdrawals out of a fund that settles over days. It is a
starting configuration rather than a guarantee: the Operator holds both inner-queue setters and can
change it without a further proposal. The group still has to appear in the withdraw cascade, because the Hub rejects a queue that omits
a registered group holding a balance — it reports only its idle balance there, so the cascade can pull
an already-claimed redemption and nothing else.

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
