import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ACCESS_CONTROL_MANAGER, NORMAL_TIMELOCK, GUARDIAN, CRITICAL_TIMELOCK, FAST_TRACK_TIMELOCK } =
  NETWORK_ADDRESSES.bscmainnet;

export const ACM = ACCESS_CONTROL_MANAGER;
export { NORMAL_TIMELOCK, GUARDIAN, CRITICAL_TIMELOCK, FAST_TRACK_TIMELOCK };

export const OPERATOR = "0x83f426233B358A36953F6951161E76FB7c866a7A";
export const KEEPER = "0x194b1F6c57d023Fa59497ee5A7976dB47f183929";

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

export const NAV_GUARDS = [
  { resource: JTRSY_VAULT, driftBps: 500, upGapBps: 200, downGapBps: 500 },
  { resource: JAAA_VAULT, driftBps: 550, upGapBps: 200, downGapBps: 500 },
];

export const SPOT_APY_BPS = [
  { resource: JTRSY_VAULT, apyBps: 337 },
  { resource: JAAA_VAULT, apyBps: 529 },
];

export const OUTER_WITHDRAW_QUEUE = [FLUX_SOURCE_USDT, CORE_SOURCE_USDT, FRV_SOURCE_USDT, CENTRIFUGE_SOURCE_USDT];

// The 84 ACM grants are already loaded on chain at ACM_AGGREGATOR_INDEX, in block 122188221, by
// ./scripts/addGrantPermissions.ts. Entries are append-only, so changing the grant surface means
// re-seeding at the next free slot and bumping the index below.
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
behind **AdapterCentrifuge**, sets the source's inner withdraw queue, configures a NAV band and
publishes a starting APY on each fund, and adds the group to the Hub.

Centrifuge is the first **asynchronous** yield source on the Hub: deposits and redemptions are escrowed
and settled later by the fund manager at a published NAV.

No capital moves in this proposal.

#### The two funds

Live ERC-7540 vaults on BNB Chain denominated in USDT, sharing one Centrifuge AsyncRequestManager.

| Fund | Vault | Share |
| --- | --- | --- |
| JTRSY | \`${JTRSY_VAULT}\` | \`${JTRSY_SHARE}\` |
| JAAA | \`${JAAA_VAULT}\` | \`${JAAA_SHARE}\` |

#### Roles

84 grants, **already seeded on chain** into the **ACMCommandsAggregator**
(\`${ACM_AGGREGATOR}\`) at grant batch index ${ACM_AGGREGATOR_INDEX}, because they do not fit inline in
a single \`propose()\` transaction. Seeded by
\`0xf4a2c8411e83488ea28a6fab507d1d8c0ee82f84b0498d19411203fe3a128111\` in block 122188221, and readable
with \`grantPermissions(${ACM_AGGREGATOR_INDEX}, i)\` for i in 0..83.

The proposal lends the aggregator \`DEFAULT_ADMIN_ROLE\` on the AccessControlManager, replays that
batch, and revokes the role in the same transaction, so the aggregator holds ACM admin only inside
this proposal.

On the new Centrifuge source:

| Holder | Signatures | Surface |
| --- | --- | --- |
| Normal Timelock | 20 | everything, including \`sweep\` which it alone holds |
| Operator | 16 | both inner queues, the async lifecycle, the four claims, \`pauseResource\`, \`unpauseResource\`, \`updateResourceAdapter\`, the NAV band, \`setSpotAPYBps\` |
| Keeper | 4 | the four claim functions, nothing else |
| Guardian | 8 | \`pauseResource\`, \`unpauseResource\`, \`updateResourceAdapter\`, \`forceRemoveResource\`, the NAV band, \`setSpotAPYBps\` |

The Fast-Track and Critical timelocks are granted nothing, matching the rest of the Liquidity Hub.

The batch also grants \`updateResourceAdapter\` and \`unpauseResource\` to the Operator and the Guardian
on the nine sources already live under the USDT, USDC and U hubs, where both are Normal-Timelock-only
today. Both accounts already hold \`pauseResource\` on those sources.

#### NAV band

Each fund gets a band around the value it reports, held to an anchor that drifts at a published rate
and re-anchors daily. A reading outside the band is reported at the edge of it; it never reverts.

| Fund | Drift | Band up | Band down | Re-anchor | Published APY |
| --- | --- | --- | --- | --- | --- |
| JTRSY | 5.00% | 2% | 5% | daily | 3.37% |
| JAAA | 5.50% | 2% | 5% | daily | 5.29% |

Centrifuge publishes no rate on chain, so the APY each fund reports is set by \`setSpotAPYBps\`. Left
unset the group would report zero and drag the Hub's advertised APY down.

#### Actions (one atomic transaction, in order)

1. Grant \`DEFAULT_ADMIN_ROLE\` to the ACMCommandsAggregator, replay the grant batch, and revoke the
   role.
2. Register both funds on the source behind **AdapterCentrifuge** (\`addResource\`).
3. Set the source's inner withdraw queue to both funds, JTRSY first. The inner deposit queue is left
   unset, so an ordinary Hub deposit never routes into a fund that settles over days.
4. Configure the NAV band on each fund, both sides armed.
5. Publish the starting APY for each fund.
6. Register the group on the Hub with an absolute cap of 5,000,000 USDT and a 25% cap on TVL.
7. Append Centrifuge to the **end** of the Hub's withdraw cascade, leaving the existing order and the
   deposit queue untouched.

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
        params: [CENTRIFUGE_RESOURCES],
      },

      ...NAV_GUARDS.map(band => ({
        target: CENTRIFUGE_SOURCE_USDT,
        signature: "setNavGuardRate(address,uint16,uint16,uint16,uint32,bool,bool)",
        params: [band.resource, band.driftBps, band.upGapBps, band.downGapBps, NAV_GUARD_INTERVAL, true, true],
      })),

      ...SPOT_APY_BPS.map(fund => ({
        target: CENTRIFUGE_SOURCE_USDT,
        signature: "setSpotAPYBps(address,uint64)",
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
