import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { NEW_GUARDIAN_GRANTS, NEW_TIMELOCK_GRANTS, giveCallPermission } from "./permissions-bsctestnet-addendum";

const { ACCESS_CONTROL_MANAGER, NORMAL_TIMELOCK, GUARDIAN } = NETWORK_ADDRESSES.bsctestnet;

export const ACM = ACCESS_CONTROL_MANAGER;
export { NORMAL_TIMELOCK, GUARDIAN };

// Existing Hub stack. Only Hub_USDT is called; the other three are queue entries.
export const HUB_USDT = "0x7cE6ADF754D0eC81A6CF8ACd9C7454F45077dc61";
export const CORE_SOURCE_USDT = "0x11e39DC7b8b16BBDA8D9C2903dF741Ae9341Ec88";
export const FRV_SOURCE_USDT = "0xA0Fb0fFeBdcB7F45A3Ec841cCE7F78B7CeBD0f82";
export const FLUX_SOURCE_USDT = "0x044E572144bc08ed2D90E081EeEd7b5b6Cb01016";
export const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";

// Retired. Left on its own beacon running the pre-audit code, and abandoned in place.
export const OLD_CENTRIFUGE_SOURCE_USDT = "0x28e5E0ce9c15E3dE00855C2dda7cA260B470FCC2";
export const OLD_CENTRIFUGE_BEACON = "0xD5F75f510Fd01F40baA13C4410d548FCc5e57137";
export const OLD_ADAPTER_CENTRIFUGE = "0x78b5D33CB96546BEED3F2CeD7B95bc11bD330A35";
export const OLD_MOCK_CENTRIFUGE_VAULT_USDT = "0xbeF5909361D176a6E41C57134bAc071933B569D7";

// Deployed fresh: adapter, implementation, beacon and source.
export const CENTRIFUGE_SOURCE_USDT = "0x8DFF12277C44E73cbF551ceB6E5Ae1eD4CC85542";
export const CENTRIFUGE_BEACON = "0x1dcAAB89344eA7F4c2271598e4ED4Fd6a66A451C";
export const YIELD_GROUP_CENTRIFUGE_IMPL = "0xDF8bfE261508b0814973AB2598A168f648Ed6fa6";
export const ADAPTER_CENTRIFUGE = "0x8219375B48a9fcca0F9E5eA1c1B171524aa347E1";

// Centrifuge has no BSC-testnet deployment. Already funded with 1,000 USDT.
export const MOCK_CENTRIFUGE_VAULT_USDT = "0xb13CA372bB11FcCfb765195b013ad59dAf3F817C";
export const MOCK_CENTRIFUGE_SHARE_USDT = "0xab356B608c817E276d575857893453c13be763b3";

// Testnet policy: no caps on any group.
export const ABSOLUTE_CAP_UNBOUNDED = "340282366920938463463374607431768211455"; // type(uint128).max
export const PERCENTAGE_CAP_DISABLED = 10_000;

export const CENTRIFUGE_ONLY = [MOCK_CENTRIFUGE_VAULT_USDT];

// `removeYieldGroup` cascade-strips the retired source, leaving [FRV, Flux, Core]. This puts the
// replacement back at the front, the position the original proposal set and argued for.
export const OUTER_WITHDRAW_QUEUE = [CENTRIFUGE_SOURCE_USDT, FRV_SOURCE_USDT, FLUX_SOURCE_USDT, CORE_SOURCE_USDT];

const revokeCallPermission = (contract: string, sig: string, account: string) => ({
  target: ACM,
  signature: "revokeCallPermission(address,string,address)",
  params: [contract, sig, account],
});

export const vip999Addendum = () => {
  const meta = {
    version: "v2",
    // Placeholder number, set for real once the proposal is filed.
    title: "VIP-999 [BNB Chain Testnet] Liquidity Hub (USDT) — replace the Centrifuge YieldGroup with the new release",
    description: `#### Summary

Replaces the Centrifuge YieldGroup of the Liquidity Hub (USDT) on BNB Chain Testnet with a freshly
deployed one, and retires the existing group. The Hub itself and the Core, FRV and Flux
groups are untouched.

The replacement is a complete new family — adapter, implementation, beacon and source — so nothing is
upgraded in place. The retired source keeps its own beacon and its own pre-audit code, and is simply
deregistered from the Hub.

#### Why replace rather than upgrade

The new release changes the group's storage layout. Three mappings were removed and two added
over the same slots:

| Slot | Retired code | New code |
| --- | --- | --- |
| 100 | \`_growthGuard\` | \`_navGuard\` |
| 101 | \`_dropGuard\` | reserved gap |
| 120 | \`_priceAgeGuard\` | \`_spotAPYBps\` |

Upgrading the existing source in place would have left the new mappings reading storage the old ones
wrote. That is provably harmless on this deployment — the growth and age guards were never armed, so
their slots are zero, and the one non-zero record is a disabled drop guard the new code never
reads — but the argument has to be made per registered resource, and it stops holding the moment
another resource is added. A new source removes the question instead of answering it.

#### What changed in the new code

- **The value of the position is bounded, not the price.** The growth cap and drop floor limited how
  fast the fund's share price could move. They are replaced by a single **NAV guard**: a band around
  the value the position reports, held to an anchor that drifts at a rate governance publishes. A
  value outside the band is reported at the edge of the band. It never reverts, and it never pauses
  the Hub, so the source no longer needs the \`pauseHub()\` permission.
- **The price age guard is gone entirely.** Venus no longer keeps its own staleness check on
  Centrifuge's price markers. A missing or unreadable price still stops a valuation, because the
  adapter refuses to value a share-holding position without one.
- **Governance publishes the yield.** Centrifuge reports no rate on chain — a fund's return arrives as
  a new NAV — so the reported APY now comes from \`setSpotAPYBps\`, which governance sets per fund.

#### The mock fund is replaced

The fund registered here is a testnet mock controlled by Venus; Centrifuge has no BNB Chain Testnet
deployment. The mock is redeployed so it reports \`priceLastUpdated()\`, which monitoring reads and
which the old one does not answer at all. The old mock's position cannot be redeemed — its assets were
withdrawn by its owner, so it holds nothing to pay a redemption with — and it is written off with
\`forceRemoveResource\` rather than unwound. The write-off is 1.00 USDT. The new mock is already funded
with 1,000 USDT.

Both \`forceRemoveResource\` and the balance check inside \`removeYieldGroup\` force the order here:
the write-off only runs while the Hub is paused, and the group cannot be deregistered until it holds
nothing. The proposal therefore pauses the Hub at the start and unpauses it at the end. Both happen in
the same transaction, so the Hub is never left paused.

#### The retired source is abandoned, not unwound

Once deregistered the old source is wired to nothing: no Hub registration, no resources, no queue
entries. Its ACM roles are left in place rather than revoked, because every one of them is keyed to
that dead contract and can never move value again.

The single exception is revoked: the old source held \`pauseHub()\` **on the live Hub**, the one role
it has whose target stays in production. Nothing can reach it today — the only caller is
\`enforceDropGuard\`, which returns early because the stored guard is disabled, and arming a new one
needs a registered resource the source no longer has — but a role pointing at a live contract from an
abandoned one is not worth keeping.

#### Actions (one atomic transaction, in order)

1. Pause **Hub_USDT**.
2. Write off the old mock fund on the retired source (\`forceRemoveResource\`), then deregister the
   retired source from the Hub (\`removeYieldGroup\`), which also strips it from the withdraw queue.
3. Grant the gated surface of the new **CentrifugeSource_USDT** to the **Normal Timelock** and the
   **Guardian** multisig. The Guardian is an ACM admin that already holds the shared yield-group
   surface against every contract, so only the signatures its wildcards miss are granted to it.
4. Register the new mock fund behind the new **AdapterCentrifuge** (\`addResource\`), then set the
   source's inner deposit and withdraw queues.
5. Register the new source on **Hub_USDT** (\`addYieldGroup\`), uncapped, matching testnet policy for
   the existing three groups.
6. Set the Hub's outer withdraw queue back to **Centrifuge → FRV → Flux → Core**. The deposit queue is
   not touched: Centrifuge settles over days, so a user deposit routed there would sit unwithdrawable
   in a pending request. Capital enters this group only through an Operator reallocation.
7. Revoke \`pauseHub()\` on **Hub_USDT** from the retired source.
8. Unpause **Hub_USDT**.

#### Why the other yield groups are not replaced

Core, FRV and Flux are untouched: the only change to the shared YieldGroup base contract is that two
internal functions can now be overridden by the Centrifuge group, and the compiled Core, FRV and Flux
implementations are byte-for-byte identical to what is already deployed.

#### Guards

This proposal arms no guard and publishes no APY. The NAV guard needs values chosen from how the fund
actually behaves, and an over-tight band misreports the position on every Hub read. The permissions
are granted now so that setting them later needs no further proposal.

#### References

- The earlier BNB Chain Testnet proposal that onboarded the Centrifuge YieldGroup
- HashDit audit of the Centrifuge YieldGroup`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      { target: HUB_USDT, signature: "pauseHub()", params: [] },

      {
        target: OLD_CENTRIFUGE_SOURCE_USDT,
        signature: "forceRemoveResource(address)",
        params: [OLD_MOCK_CENTRIFUGE_VAULT_USDT],
      },
      { target: HUB_USDT, signature: "removeYieldGroup(address)", params: [OLD_CENTRIFUGE_SOURCE_USDT] },

      ...NEW_TIMELOCK_GRANTS.map(sig => giveCallPermission(ACM, CENTRIFUGE_SOURCE_USDT, sig, NORMAL_TIMELOCK)),
      ...NEW_GUARDIAN_GRANTS.map(sig => giveCallPermission(ACM, CENTRIFUGE_SOURCE_USDT, sig, GUARDIAN)),

      {
        target: CENTRIFUGE_SOURCE_USDT,
        signature: "addResource(address,address)",
        params: [MOCK_CENTRIFUGE_VAULT_USDT, ADAPTER_CENTRIFUGE],
      },
      { target: CENTRIFUGE_SOURCE_USDT, signature: "setInnerDepositQueue(address[])", params: [CENTRIFUGE_ONLY] },
      { target: CENTRIFUGE_SOURCE_USDT, signature: "setInnerWithdrawQueue(address[])", params: [CENTRIFUGE_ONLY] },

      {
        target: HUB_USDT,
        signature: "addYieldGroup(address,uint256,uint16)",
        params: [CENTRIFUGE_SOURCE_USDT, ABSOLUTE_CAP_UNBOUNDED, PERCENTAGE_CAP_DISABLED],
      },
      { target: HUB_USDT, signature: "setOuterWithdrawQueue(address[])", params: [OUTER_WITHDRAW_QUEUE] },

      revokeCallPermission(HUB_USDT, "pauseHub()", OLD_CENTRIFUGE_SOURCE_USDT),
      { target: HUB_USDT, signature: "unpauseHub()", params: [] },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip999Addendum;
