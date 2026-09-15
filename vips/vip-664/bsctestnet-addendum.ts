import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ACCESS_CONTROL_MANAGER: ACM, NORMAL_TIMELOCK, GUARDIAN } = NETWORK_ADDRESSES.bsctestnet;
export { ACM, NORMAL_TIMELOCK, GUARDIAN };

export const HUB_USDT = "0x7cE6ADF754D0eC81A6CF8ACd9C7454F45077dc61";
export const CENTRIFUGE_SOURCE_USDT = "0x28e5E0ce9c15E3dE00855C2dda7cA260B470FCC2";
export const CENTRIFUGE_BEACON = "0xD5F75f510Fd01F40baA13C4410d548FCc5e57137";

export const OLD_MOCK_CENTRIFUGE_VAULT_USDT = "0xbeF5909361D176a6E41C57134bAc071933B569D7";
export const NEW_MOCK_CENTRIFUGE_VAULT_USDT = "0xb13CA372bB11FcCfb765195b013ad59dAf3F817C";
export const NEW_MOCK_CENTRIFUGE_SHARE_USDT = "0xab356B608c817E276d575857893453c13be763b3";

export const OLD_YIELD_GROUP_CENTRIFUGE_IMPL = "0x07B13f1A527Be4777678c7B8F17e9bd1729D55cF";
export const NEW_YIELD_GROUP_CENTRIFUGE_IMPL = "0x038977634B66A62457b396a86468B81E39d88af5";
export const OLD_ADAPTER_CENTRIFUGE = "0x78b5D33CB96546BEED3F2CeD7B95bc11bD330A35";
export const NEW_ADAPTER_CENTRIFUGE = "0xeCC52D00247B93C455C6e522Ad0Dd442D4a0921A";

// Every price defence the onboarding proposal granted. The audit removed all six.
export const OLD_PRICE_GUARD_SIGS = [
  "setPriceAgeGuard(address,address,uint64,uint64)",
  "disablePriceAgeGuard(address)",
  "setGrowthGuardRate(address,uint16,uint16,uint32)",
  "setGrowthGuardSnapshot(address,uint128,uint64)",
  "setDropGuardRate(address,uint16,uint16,uint32)",
  "setDropGuardSnapshot(address,uint128,uint64)",
];

export const NEW_NAV_GUARD_SIGS = [
  "setNavGuardRate(address,uint16,uint16,uint16,uint32,bool,bool)",
  "setNavGuardSnapshot(address,uint128,uint64)",
  "setNavGuardEnabled(address,bool,bool)",
];

export const NEW_SPOT_APY_SIG = "setSpotAPYBps(address,uint64)";

export const GRANTED_SIGS = [...NEW_NAV_GUARD_SIGS, NEW_SPOT_APY_SIG];

const giveCallPermission = (contract: string, sig: string, account: string) => ({
  target: ACM,
  signature: "giveCallPermission(address,string,address)",
  params: [contract, sig, account],
});

const revokeCallPermission = (contract: string, sig: string, account: string) => ({
  target: ACM,
  signature: "revokeCallPermission(address,string,address)",
  params: [contract, sig, account],
});

export const vip664Addendum = () => {
  const meta = {
    version: "v2",
    // Placeholder number, set for real once the proposal is filed.
    title:
      "VIP-667 [BNB Chain Testnet] Liquidity Hub (USDT) — upgrade the Centrifuge YieldGroup to the audited release",
    description: `#### Summary

Upgrades the Centrifuge YieldGroup of the Liquidity Hub (USDT) on BNB Chain Testnet to the audited code,
swaps the testnet mock fund for a redeployed one, and moves the ACM permissions to the functions that
now exist. The Hub, the source contract and its registration on the Hub all stay as they are.

#### What changed in the audited code

- **The value of the position is bounded, not the price.** The old growth cap and drop floor limited how
  fast the fund's share price could move. They are replaced by a single **NAV guard**: a band around the
  value the position reports, held to an anchor that drifts at a rate governance publishes. A value
  outside the band is reported at the edge of the band. It never reverts, and it never pauses the Hub,
  so the source no longer needs the \`pauseHub()\` permission.
- **The price age guard is gone entirely.** Venus no longer keeps its own staleness check on Centrifuge's
  price markers. A missing or unreadable price still stops a valuation, because the adapter refuses to
  value a share-holding position without one.
- **Governance publishes the yield.** Centrifuge reports no rate on chain — a fund's return arrives as a
  new NAV — so the reported APY now comes from \`setSpotAPYBps\`, which governance sets per fund.
- **The adapter and the yield group work as a pair.** Both are replaced in this proposal.

#### The mock fund is replaced

The fund registered here is a testnet mock controlled by Venus; Centrifuge has no BNB Chain Testnet
deployment. The mock is redeployed so it reports \`priceLastUpdated()\`, which monitoring reads and which
the old one does not answer at all. The old mock's position cannot be redeemed — its assets were
withdrawn by its owner, so it holds nothing to pay a redemption with — and it is written off with
\`forceRemoveResource\` rather than unwound. The write-off is 1.00 USDT. The new mock is already funded
with 1,000 USDT.

\`forceRemoveResource\` only runs while the Hub is paused, so the proposal pauses the Hub at the start and
unpauses it at the end. Both happen in the same transaction, so the Hub is never left paused.

#### Actions (one transaction, in order)

1. Pause **Hub_USDT**.
2. Write off the old mock fund on **CentrifugeSource_USDT** (\`forceRemoveResource\`). This runs on the old
   implementation and the old adapter, so the retired pair is never mixed with the new one.
3. Point the **CentrifugeBeacon** at the new **YieldGroupCentrifuge** implementation. The beacon is owned
   by the Normal Timelock. Storage is preserved: the retired guards' storage is either empty or falls
   inside the gap the new code never reads.
4. Register the new mock fund behind the new **AdapterCentrifuge** (\`addResource\`), then set the source's
   inner deposit and withdraw queues to it.
5. Grant the four permissions the audited code adds to the **Normal Timelock** and the **Guardian**:
   \`setNavGuardRate\`, \`setNavGuardSnapshot\`, \`setNavGuardEnabled\` and \`setSpotAPYBps\`.
6. Revoke the six permissions that no longer exist from both: the two price age guard functions and the
   four growth and drop guard setters.
7. Revoke the \`pauseHub()\` permission on **Hub_USDT** from the source. Nothing in the new code calls it.
8. Unpause **Hub_USDT**.

#### Why the other yield groups are not upgraded

Core, FRV and Flux are not upgraded: the only change to the shared YieldGroup base contract is that two
internal functions can now be overridden by the Centrifuge group, and the compiled Core, FRV and Flux
implementations are byte-for-byte identical to what is already deployed.

#### Guards

This proposal arms no guard and publishes no APY. The NAV guard needs values chosen from how the fund
actually behaves, and an over-tight band misreports the position. The permissions are granted now so
that setting them later needs no further proposal.

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
        target: CENTRIFUGE_SOURCE_USDT,
        signature: "forceRemoveResource(address)",
        params: [OLD_MOCK_CENTRIFUGE_VAULT_USDT],
      },
      { target: CENTRIFUGE_BEACON, signature: "upgradeTo(address)", params: [NEW_YIELD_GROUP_CENTRIFUGE_IMPL] },
      {
        target: CENTRIFUGE_SOURCE_USDT,
        signature: "addResource(address,address)",
        params: [NEW_MOCK_CENTRIFUGE_VAULT_USDT, NEW_ADAPTER_CENTRIFUGE],
      },
      {
        target: CENTRIFUGE_SOURCE_USDT,
        signature: "setInnerDepositQueue(address[])",
        params: [[NEW_MOCK_CENTRIFUGE_VAULT_USDT]],
      },
      {
        target: CENTRIFUGE_SOURCE_USDT,
        signature: "setInnerWithdrawQueue(address[])",
        params: [[NEW_MOCK_CENTRIFUGE_VAULT_USDT]],
      },
      ...[NORMAL_TIMELOCK, GUARDIAN].flatMap(holder =>
        GRANTED_SIGS.map(sig => giveCallPermission(CENTRIFUGE_SOURCE_USDT, sig, holder)),
      ),
      ...[NORMAL_TIMELOCK, GUARDIAN].flatMap(holder =>
        OLD_PRICE_GUARD_SIGS.map(sig => revokeCallPermission(CENTRIFUGE_SOURCE_USDT, sig, holder)),
      ),
      revokeCallPermission(HUB_USDT, "pauseHub()", CENTRIFUGE_SOURCE_USDT),
      { target: HUB_USDT, signature: "unpauseHub()", params: [] },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664Addendum;
