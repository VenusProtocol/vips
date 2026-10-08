import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { GUARDIAN_GRANTS, TIMELOCK_GRANTS, giveCallPermission } from "./permissions-bsctestnet";

const { ACCESS_CONTROL_MANAGER, NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN } =
  NETWORK_ADDRESSES.bsctestnet;

export const ACM = ACCESS_CONTROL_MANAGER;
export { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN };

// Existing Hub stack. Only Hub_USDT is called; the four sources are queue entries.
export const HUB_USDT = "0x7cE6ADF754D0eC81A6CF8ACd9C7454F45077dc61";
export const CENTRIFUGE_SOURCE_USDT = "0x8DFF12277C44E73cbF551ceB6E5Ae1eD4CC85542";
export const FRV_SOURCE_USDT = "0xA0Fb0fFeBdcB7F45A3Ec841cCE7F78B7CeBD0f82";
export const FLUX_SOURCE_USDT = "0x044E572144bc08ed2D90E081EeEd7b5b6Cb01016";
export const CORE_SOURCE_USDT = "0x11e39DC7b8b16BBDA8D9C2903dF741Ae9341Ec88";
export const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";

// The Spoke family, deployed but not wired (venus-liquidity-hub deployments/bsctestnet). The source is
// a BeaconProxy over SpokeBeacon, initialised against Hub_USDT and USDT with blocksPerYear 0: the
// adapter annualises from each market's own rate, so there is nothing to set here.
export const SPOKE_SOURCE_USDT = "0xb9Bf8232474aF0A18BbA0CbCc3bA10efD51542e2";
export const ADAPTER_SPOKE_V1 = "0xaE3e15f26815e2c517764d98791F828B140c010A";
// Reference only. Owned by the Normal Timelock; `upgradeTo` is onlyOwner, not ACM-gated, so a Spoke
// implementation upgrade always needs a proposal and nothing here can delegate it to the Guardian.
export const SPOKE_BEACON = "0x58099BEaa6A00F493eF67fF953866DDA4a502389";

// The spoke pool's liquidity market (isolated-pools deployments/bsctestnet). Its supply allowlist is
// enabled, so the source must be allowlisted before `addResource`, or the adapter's
// `validateRegistration` reverts `SupplyNotAllowed`.
export const SPOKE_COMPTROLLER = "0x11960c84d6c4F2a978a12372721C3A6A88C78f4c";
export const VUSDT_SPOKE = "0xC88bAF0bA49a98F15A00182752f6d10bd3932F6a";

// Testnet policy: no Hub cap on any group. The binding limit is the market's own supply cap.
export const ABSOLUTE_CAP_UNBOUNDED = "340282366920938463463374607431768211455"; // type(uint128).max
export const PERCENTAGE_CAP_DISABLED = 10_000;

export const SPOKE_ONLY = [VUSDT_SPOKE];

// Built from the queues read on chain, not from the earlier proposals: deposit [FRV, Flux, Core] and
// withdraw [Centrifuge, FRV, Flux, Core]. Spoke goes FIRST in both, so testnet deposits and withdrawals
// exercise the family under test. At the front of the deposit queue is the only place it receives
// anything today: FRV reports no room, Flux sits at its 750 USDT cap and Core is uncapped, so behind
// Core it would never be reached. Every existing entry is kept, in its existing order. The simulation
// pins both pre-VIP queues, so a change made on testnet before execution fails it instead of being
// silently overwritten.
export const OUTER_DEPOSIT_QUEUE = [SPOKE_SOURCE_USDT, FRV_SOURCE_USDT, FLUX_SOURCE_USDT, CORE_SOURCE_USDT];
export const OUTER_WITHDRAW_QUEUE = [
  SPOKE_SOURCE_USDT,
  CENTRIFUGE_SOURCE_USDT,
  FRV_SOURCE_USDT,
  FLUX_SOURCE_USDT,
  CORE_SOURCE_USDT,
];

const grantsOnSource = () =>
  [
    ...[NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK].flatMap(account =>
      TIMELOCK_GRANTS.map(sig => ({ account, sig })),
    ),
    // Empty today: every role is already a Guardian wildcard. See ./permissions-bsctestnet.
    ...GUARDIAN_GRANTS.map(sig => ({ account: GUARDIAN, sig })),
  ].map(({ account, sig }) => giveCallPermission(ACM, SPOKE_SOURCE_USDT, sig, account));

export const vip997 = () => {
  const meta = {
    version: "v2",
    // Placeholder number. The testnet governor is already past this, so it will be wrong on chain. Only
    // this line cites a VIP number, so only this line has to change.
    title: "VIP-997 [BNB Chain Testnet] Liquidity Hub (USDT): wire the Spoke yield family",
    description: `#### Summary

Connects the **Spoke** yield family to the Liquidity Hub (USDT) on BNB Chain Testnet. The Hub then
supplies USDT to the liquidity market of the Hub-Funded Spoke pool, **vUSDT_HubSpoke**, as its fifth
yield group.

Spoke uses the same generic YieldGroup contract as the Core family, behind its own beacon and with its
own adapter, **AdapterSpokeV1**. The adapter values the position with the market's bad debt excluded,
treats cash net of reserves as the withdrawable liquidity, and respects the market's supply allowlist.

#### Actions (one atomic transaction, in order)

1. Grant the full gated surface of **SpokeSource_USDT** (resources, adapters, inner queues, pauses,
   per-resource caps, the annualiser and sweep) to the **Normal**, **Fast-track** and **Critical**
   timelocks, the same set each of them holds on the Core and Flux sources.
2. Add **SpokeSource_USDT** to the supply allowlist of **vUSDT_HubSpoke**. The market only accepts
   supply from allowlisted accounts, and the adapter rejects the registration otherwise.
3. Register **vUSDT_HubSpoke** on the source behind **AdapterSpokeV1**, and make it the only entry of
   both inner queues.
4. Register the source on **Hub_USDT**, with no Hub cap, matching testnet policy for the existing groups.
5. Put the source first in both outer queues: deposit **Spoke → FRV → Flux → Core**, withdraw
   **Spoke → Centrifuge → FRV → Flux → Core**.

#### Queue order

Spoke goes first in both queues so that testnet deposits and withdrawals exercise it. In the deposit
queue it is also the only position that reaches it: the groups ahead of Core currently report no room,
and Core is uncapped, so a group placed after Core would never receive a deposit. Every existing entry
keeps its relative order.

#### Guardian

The Guardian multisig receives nothing from this proposal, because it already holds every role this
family needs: all eleven source roles as wildcards on the testnet AccessControlManager, every
yield-group setter on Hub_USDT, and the supply allowlist on the spoke pool. It can therefore add and
remove markets, swap adapters, reorder the inner and outer queues, change caps, pause and sweep without
a further proposal. The one exception is an implementation upgrade: the Spoke beacon is owned by the
Normal Timelock and is not role-gated, so upgrading it always takes a proposal.

#### Notes

- Testnet only.
- Only vUSDT_HubSpoke is registered. Other spoke markets on this network are left out.
- vUSDT_HubSpoke currently carries bad debt from testing. The adapter excludes it from the position's
  value, so each deposit into the market is marked down by its share of that bad debt on entry.

#### References

- [Spoke yield family pull request](https://github.com/VenusProtocol/venus-liquidity-hub/pull/22)
- [Spoke family deployment on BNB Chain Testnet](https://github.com/VenusProtocol/venus-liquidity-hub/pull/35)
- [Hub-Funded Spoke pool contracts](https://github.com/VenusProtocol/isolated-pools/pull/559)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  // Order matters: grants first, the allowlist before addResource, addResource before the inner queues,
  // addYieldGroup before the outer queues.
  return makeProposal(
    [
      // 1. ACM roles on the new source. The Normal Timelock uses three of them below.
      ...grantsOnSource(),

      // 2. Allowlist the source on the market. The Normal Timelock already holds this role on the
      //    spoke comptroller.
      {
        target: SPOKE_COMPTROLLER,
        signature: "setAllowedSupplier(address,address,bool)",
        params: [VUSDT_SPOKE, SPOKE_SOURCE_USDT, true],
      },

      // 3. Register the market behind AdapterSpokeV1, then set the source's inner queues.
      {
        target: SPOKE_SOURCE_USDT,
        signature: "addResource(address,address)",
        params: [VUSDT_SPOKE, ADAPTER_SPOKE_V1],
      },
      { target: SPOKE_SOURCE_USDT, signature: "setInnerDepositQueue(address[])", params: [SPOKE_ONLY] },
      { target: SPOKE_SOURCE_USDT, signature: "setInnerWithdrawQueue(address[])", params: [SPOKE_ONLY] },

      // 4. Register the group on the Hub, uncapped.
      {
        target: HUB_USDT,
        signature: "addYieldGroup(address,uint256,uint16)",
        params: [SPOKE_SOURCE_USDT, ABSOLUTE_CAP_UNBOUNDED, PERCENTAGE_CAP_DISABLED],
      },

      // 5. Spoke first in both outer queues, every existing entry kept.
      { target: HUB_USDT, signature: "setOuterDepositQueue(address[])", params: [OUTER_DEPOSIT_QUEUE] },
      { target: HUB_USDT, signature: "setOuterWithdrawQueue(address[])", params: [OUTER_WITHDRAW_QUEUE] },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip997;
