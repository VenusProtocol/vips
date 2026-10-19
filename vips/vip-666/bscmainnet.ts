import { parseUnits, solidityKeccak256 } from "ethers/lib/utils";
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

// ---------------------------------------------------------------------------------------------------
// The live Centrifuge source behind the USDT Hub (VIP-661) still publishes the starting APYs set then
// (JTRSY 337 bps, JAAA 529 bps); refresh them to the same current rates as the USDC vaults.
// ---------------------------------------------------------------------------------------------------
export const CENTRIFUGE_SOURCE_USDT = "0xDA5AFfeb43719f517676E031a727071c7D400983";
export const JTRSY_VAULT_USDT = "0x6e6B8498415083a4386BE83DD59Edd4366402FFa";
export const JAAA_VAULT_USDT = "0xcbAfe61d84C6Fb88252a6Adf1C9CB0B9D029cb99";

// All existing YieldGroups across the USDT, USDC and U Hubs. VIP-661 granted the Operator
// adapter replacement on each of them; removing it from the new source's grants is not enough.
export const LIVE_YIELD_GROUPS = [
  "0xC9E6ceD9589363f8dC5695Be2C79AB4dDaECC94B", // CoreSource_USDT
  "0xe3df38E12E37ED80E1b3ccf2bdf84F9e1527ce14", // FluxSource_USDT
  "0x621eF38cE0C4e7060fF0bF3D609E3D46EC144bE7", // FRVSource_USDT
  CENTRIFUGE_SOURCE_USDT,
  CORE_SOURCE_USDC,
  FLUX_SOURCE_USDC,
  FRV_SOURCE_USDC, // Empty today, but the existing permission must still be revoked.
  "0x8A680F77A5367FA7cD33a02f51896Cb1d55159c3", // CoreSource_U
  "0xe31B8851c3fa9B3dD39a04a2ed9493869A410616", // FluxSource_U
  "0x30908eddB9E94add7AC9944a0adda66d80B89143", // FRVSource_U
];

export const SPOT_APY_BPS_USDT = [
  { resource: JTRSY_VAULT_USDT, apyBps: 316 },
  { resource: JAAA_VAULT_USDT, apyBps: 478 },
];

export const OUTER_WITHDRAW_QUEUE = [FLUX_SOURCE_USDC, CORE_SOURCE_USDC, FRV_SOURCE_USDC, CENTRIFUGE_SOURCE_USDC];

// Who gets which slice of the source's surface: 20 + 15 + 4 + 8 = 47 grants, all on the new source.
export const GRANTS: [string[], string][] = [
  [CENTRIFUGE_GOVERNANCE, NORMAL_TIMELOCK],
  [CENTRIFUGE_OPERATOR, OPERATOR],
  [CENTRIFUGE_CLAIMS, KEEPER],
  [CENTRIFUGE_GUARDIAN, GUARDIAN],
];

export const vip666 = () => {
  const meta = {
    version: "v2",
    title: "VIP-666 [BNB Chain] Liquidity Hub — onboard USDC Centrifuge and restrict adapter replacement",
    description: `#### Summary

Onboard the Centrifuge YieldGroup to the USDC Liquidity Hub and reserve adapter replacement for
Guardian and governance across all BNB Chain YieldGroups. Refresh the USDT Centrifuge APYs to
match the USDC funds. No capital moves and no implementation or beacon changes in this proposal.
Centrifuge share-class membership is required before allocation and is managed by Centrifuge,
not granted by this VIP. USDC subscriptions/redemptions have no on/off-ramp fee.

#### Permissions

The new USDC Centrifuge source receives 47 ACM grants:

- **Normal Timelock (20)**: full governance surface, including sweep.
- **Operator (15)**: inner queues, async requests/cancellations, four claims, pauseResource,
  unpauseResource, NAV-band configuration/snapshot/enabling, and setSpotAPYBps. No updateResourceAdapter.
- **Keeper (4)**: claimDeposit, claimRedeem, claimCancelDeposit, claimCancelRedeem only.
- **Guardian (8)**: pauseResource, unpauseResource, updateResourceAdapter, forceRemoveResource,
  NAV-band configuration/snapshot/enabling, and setSpotAPYBps.

The Operator (${OPERATOR}) also loses updateResourceAdapter(address,address) on **all ten existing
YieldGroups**: Core, Flux and FRV for each of USDT, USDC and U, plus USDT Centrifuge. This explicitly
includes the empty USDC FRV group. VIP-661 granted these permissions; deleting a future grant does
not revoke them. Ten revokeRole calls enforce the change at YieldGroup level, covering
every resource in each group. Guardian and Normal Timelock retain adapter replacement; every other
existing permission, including Operator pause/unpause, is unchanged. Fast-Track and Critical
Timelocks receive no grants.

#### Funds and configuration

The USDC vaults share their share classes, NAV and request manager with their USDT counterparts;
request state remains separate per vault and holder.

- **JTRSY**: vault ${JTRSY_VAULT}, share ${JTRSY_SHARE}; NAV drift 5%, upper gap 2%, lower gap 5%; APY 3.16%.
- **JAAA**: vault ${JAAA_VAULT}, share ${JAAA_SHARE}; NAV drift 5.5%, upper gap 2%, lower gap 5%; APY 4.78%.

Both NAV-band sides are enabled, with a daily re-anchor interval. Values outside the band are
clamped, not reverted. The USDC Centrifuge cap is 5,000,000 USDC and 25% of Hub TVL. Its inner deposit
queue stays empty. The existing Hub deposit queue and withdrawal order are preserved, with
Centrifuge appended last. USDT Centrifuge APYs change from 3.37%/5.29% to 3.16%/4.78% for JTRSY/JAAA.

#### Actions (68 commands, atomic)

1. Revoke Operator adapter replacement on the ten existing YieldGroups.
2. Grant the 47 roles above on USDC Centrifuge.
3. Register both USDC vaults with AdapterCentrifuge and set the inner withdraw queue, JTRSY first.
4. Configure both NAV bands and publish both APYs.
5. Add USDC Centrifuge to the Hub with the caps above and append it to the outer withdraw queue.
6. Refresh both USDT Centrifuge APYs.

#### Contracts and references

- New USDC source: ${CENTRIFUGE_SOURCE_USDC}; Hub: ${HUB_USDC}.
- Existing USDT Centrifuge source: ${CENTRIFUGE_SOURCE_USDT}.
- Reused adapter: ${ADAPTER_CENTRIFUGE}; beacon: ${CENTRIFUGE_BEACON}; implementation: ${YIELD_GROUP_CENTRIFUGE_IMPL}.
- [Original onboarding PR](https://github.com/VenusProtocol/vips/pull/769).
- [VIP-661](https://app.venus.io/#/governance/proposal/661?chainId=56): prior Centrifuge onboarding and existing YieldGroup grants.
- HashDit audit of the Centrifuge YieldGroup`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      ...LIVE_YIELD_GROUPS.map(group => ({
        target: ACM,
        // Use the same role hash as revokeCallPermission, with smaller calldata so propose fits
        // BNB Chain's per-transaction gas cap. ACM still emits its standard RoleRevoked event.
        signature: "revokeRole(bytes32,address)",
        params: [solidityKeccak256(["address", "string"], [group, "updateResourceAdapter(address,address)"]), OPERATOR],
      })),

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

      ...SPOT_APY_BPS_USDT.map(fund => ({
        target: CENTRIFUGE_SOURCE_USDT,
        signature: "setSpotAPYBps(address,uint64)",
        params: [fund.resource, fund.apyBps],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip666;
