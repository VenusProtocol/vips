import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  CENTRIFUGE_CLAIMS,
  CENTRIFUGE_GOVERNANCE,
  CENTRIFUGE_GUARDIAN,
  CENTRIFUGE_OPERATOR,
} from "./permissions-bscmainnet";

const { ACCESS_CONTROL_MANAGER, NORMAL_TIMELOCK, GUARDIAN, CRITICAL_TIMELOCK, FAST_TRACK_TIMELOCK } =
  NETWORK_ADDRESSES.bscmainnet;

export const ACM = ACCESS_CONTROL_MANAGER;
export { NORMAL_TIMELOCK, GUARDIAN, CRITICAL_TIMELOCK, FAST_TRACK_TIMELOCK };

// The same Operator and Keeper on the USDT source.
export const OPERATOR = "0x83f426233B358A36953F6951161E76FB7c866a7A";
export const KEEPER = "0x194b1F6c57d023Fa59497ee5A7976dB47f183929";

// ---------------------------------------------------------------------------------------------------
// Live Hub (USDC) stack.
// ---------------------------------------------------------------------------------------------------
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const HUB_USDC = "0x9D2D9592cF8DFbf59107fAab703d08494BE14617";
export const CORE_SOURCE_USDC = "0x299D9Be7CEfff91c68F13F267d525CFC18e965ef";
export const FLUX_SOURCE_USDC = "0xA65bB4b20542268B64CF08871a98D75342AFE927";
export const FRV_SOURCE_USDC = "0x438388847eE16850Ab4f5b82dc7954c0d043B716";

// ---------------------------------------------------------------------------------------------------
// Centrifuge's USDC vaults on BNB Chain: the same two share classes as the USDT vaults
// onboarded (same share tokens, pool ids, request manager and NAV), priced in USDC.
// ---------------------------------------------------------------------------------------------------
export const CENTRIFUGE_BASE_MANAGER = "0xF48256AbDDf96EcDDc4B3DbD23E8C1921f9761Ae";

export const JTRSY_VAULT = "0x5aa84705a2CB2054ed303565336F188e6bfFbAF5";
export const JTRSY_SHARE = "0xa5d465251fBCc907f5Dd6bB2145488DFC6a2627b";
export const JTRSY_POOL_ID = "281474976710662";
export const JTRSY_SHARE_CLASS_ID = "0x00010000000000060000000000000001";

export const JAAA_VAULT = "0x9effaa5614c689fA12892379e097b3ACaD239961";
export const JAAA_SHARE = "0x58F93d6b1EF2F44eC379Cb975657C132CBeD3B6b";
export const JAAA_POOL_ID = "281474976710663";
export const JAAA_SHARE_CLASS_ID = "0x00010000000000070000000000000001";

// ---------------------------------------------------------------------------------------------------
// The Centrifuge YieldGroup family is already live behind the USDT Hub; only the USDC source is new.
// ---------------------------------------------------------------------------------------------------
export const ADAPTER_CENTRIFUGE = "0x680cE4422264ecDAd3590cB50FE254D4c153f427";
export const CENTRIFUGE_BEACON = "0xAe90Cfb3E2Bc97508F58E7e076Acf38f3bfC820f";
export const YIELD_GROUP_CENTRIFUGE_IMPL = "0x4996aa488f5269B5C544Dab1C2d1126F6bBdFF24";
export const CENTRIFUGE_SOURCE_USDC = "0x84bAeCF7Ac76039f731a0780EB59A03b2C7B593c";

export const CENTRIFUGE_ABSOLUTE_CAP = parseUnits("5000000", 18).toString();
export const CENTRIFUGE_PERCENTAGE_CAP_BPS = 2_500; // 25% of TVL

export const CENTRIFUGE_RESOURCES = [JTRSY_VAULT, JAAA_VAULT];

export const NAV_GUARD_INTERVAL = 86_400; // re-anchor at most once a day

export const NAV_GUARDS = [
  { resource: JTRSY_VAULT, driftBps: 500, upGapBps: 200, downGapBps: 500 },
  { resource: JAAA_VAULT, driftBps: 550, upGapBps: 200, downGapBps: 500 },
];

export const SPOT_APY_BPS = [
  { resource: JTRSY_VAULT, apyBps: 316 },
  { resource: JAAA_VAULT, apyBps: 478 },
];

export const OUTER_WITHDRAW_QUEUE = [FLUX_SOURCE_USDC, CORE_SOURCE_USDC, FRV_SOURCE_USDC, CENTRIFUGE_SOURCE_USDC];

// Who gets which slice of the source's surface: 20 + 16 + 4 + 8 = 48 grants, all on the new source.
export const GRANTS: [string[], string][] = [
  [CENTRIFUGE_GOVERNANCE, NORMAL_TIMELOCK],
  [CENTRIFUGE_OPERATOR, OPERATOR],
  [CENTRIFUGE_CLAIMS, KEEPER],
  [CENTRIFUGE_GUARDIAN, GUARDIAN],
];

export const vip997 = () => {
  const meta = {
    version: "v2",
    title: "VIP-997 [BNB Chain] Liquidity Hub (USDC) — onboard the Centrifuge YieldGroup",
    description: `#### Summary

Onboards the **Centrifuge YieldGroup** to the Liquidity Hub (USDC) on BNB Chain, on the same terms as
the USDT Hub: grants the ACM roles on the newly deployed USDC source, registers the USDC
vaults of Centrifuge's two BNB Chain funds — **JTRSY** and **JAAA** — behind the existing
**AdapterCentrifuge**, sets the source's inner withdraw queue, configures a NAV band and publishes a
starting APY on each fund, and adds the group to the Hub.

Today the USDC Hub can only allocate to Venus Core, Fluid and the Fixed-Rate Vaults. Centrifuge
settles USDC subscriptions and redemptions with no on/off-ramp fee, unlike USDT, so USDC is the
cheaper way into the same two funds.

No capital moves in this proposal. Before capital can be allocated, Centrifuge must add the USDC
source to both share-class memberlists; this proposal does not grant that membership.

#### The two funds

Live ERC-7540 vaults on BNB Chain denominated in USDC. They share their share token, pool, NAV and
AsyncRequestManager with the USDT vaults already on the USDT Hub; each vault keeps its own
per-holder request state, so the two Hubs' positions are accounted separately.

- **JTRSY**: Vault: ${JTRSY_VAULT}; Share: ${JTRSY_SHARE}.
- **JAAA**: Vault: ${JAAA_VAULT}; Share: ${JAAA_SHARE}.

#### Roles

48 grants on the new source, each a giveCallPermission on the AccessControlManager, in the same
role layout as the USDT source:

- **Normal Timelock**: Signatures: 20; Surface: everything, including sweep which it alone holds.
- **Operator**: Signatures: 16; Surface: both inner queues, the async lifecycle, the four claims, pauseResource, unpauseResource, updateResourceAdapter, the NAV band, setSpotAPYBps.
- **Keeper**: Signatures: 4; Surface: the four claim functions, nothing else.
- **Guardian**: Signatures: 8; Surface: pauseResource, unpauseResource, updateResourceAdapter, forceRemoveResource, the NAV band, setSpotAPYBps.

The Fast-Track and Critical timelocks are granted nothing, matching the rest of the Liquidity Hub.

#### NAV band

Each fund gets the same band as on the USDT Hub: a band around the value it reports, held to an
anchor that drifts at a published rate and re-anchors daily. A reading outside the band is reported
at the edge of it; it never reverts.

- **JTRSY**: Drift: 5.00%; Band up: 2%; Band down: 5%; Re-anchor: daily; Published APY: 3.16%.
- **JAAA**: Drift: 5.50%; Band up: 2%; Band down: 5%; Re-anchor: daily; Published APY: 4.78%.

Centrifuge publishes no rate on chain, so the APY each fund reports is set by setSpotAPYBps, at the
rate Centrifuge currently reports for each fund.

#### Actions (57 commands, executed atomically in order)

1. Grant the 48 roles above on the source (giveCallPermission).
2. Register both USDC vaults on the source behind **AdapterCentrifuge** (addResource).
3. Set the source's inner withdraw queue to both funds, JTRSY first. The inner deposit queue is left
   unset, so an ordinary Hub deposit never routes into a fund that settles over days.
4. Configure the NAV band on each fund, both sides armed.
5. Publish the starting APY for each fund.
6. Register the group on the Hub with an absolute cap of 5,000,000 USDC and a 25% cap on TVL.
7. Append Centrifuge to the **end** of the Hub's withdraw cascade, leaving the existing order and the
   deposit queue untouched.

#### Deployed contracts (BNB Chain)

- CentrifugeSource_USDC: ${CENTRIFUGE_SOURCE_USDC} — a BeaconProxy over the existing
  CentrifugeBeacon, bound to the USDC Hub, with no owner of its own, so every gated call on it is
  ACM-controlled
- Reused from the USDT Hub's Centrifuge onboarding, unchanged: AdapterCentrifuge (${ADAPTER_CENTRIFUGE}), CentrifugeBeacon
  (${CENTRIFUGE_BEACON}, owned by the Normal Timelock) and YieldGroupCentrifuge implementation
  (${YIELD_GROUP_CENTRIFUGE_IMPL})

#### References

- HashDit audit of the Centrifuge YieldGroup`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      ...GRANTS.flatMap(([sigs, account]) =>
        sigs.map(sig => ({
          target: ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [CENTRIFUGE_SOURCE_USDC, sig, account],
        })),
      ),

      ...CENTRIFUGE_RESOURCES.map(resource => ({
        target: CENTRIFUGE_SOURCE_USDC,
        signature: "addResource(address,address)",
        params: [resource, ADAPTER_CENTRIFUGE],
      })),
      {
        target: CENTRIFUGE_SOURCE_USDC,
        signature: "setInnerWithdrawQueue(address[])",
        params: [CENTRIFUGE_RESOURCES],
      },

      ...NAV_GUARDS.map(band => ({
        target: CENTRIFUGE_SOURCE_USDC,
        signature: "setNavGuardRate(address,uint16,uint16,uint16,uint32,bool,bool)",
        params: [band.resource, band.driftBps, band.upGapBps, band.downGapBps, NAV_GUARD_INTERVAL, true, true],
      })),

      ...SPOT_APY_BPS.map(fund => ({
        target: CENTRIFUGE_SOURCE_USDC,
        signature: "setSpotAPYBps(address,uint64)",
        params: [fund.resource, fund.apyBps],
      })),
      {
        target: HUB_USDC,
        signature: "addYieldGroup(address,uint256,uint16)",
        params: [CENTRIFUGE_SOURCE_USDC, CENTRIFUGE_ABSOLUTE_CAP, CENTRIFUGE_PERCENTAGE_CAP_BPS],
      },
      { target: HUB_USDC, signature: "setOuterWithdrawQueue(address[])", params: [OUTER_WITHDRAW_QUEUE] },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip997;
