import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ACCESS_CONTROL_MANAGER: ACM, NORMAL_TIMELOCK, GUARDIAN } = NETWORK_ADDRESSES.bsctestnet;
export { ACM, NORMAL_TIMELOCK, GUARDIAN };

export const HUB_USDT = "0x7cE6ADF754D0eC81A6CF8ACd9C7454F45077dc61";
export const CENTRIFUGE_SOURCE_USDT = "0x28e5E0ce9c15E3dE00855C2dda7cA260B470FCC2";
export const MOCK_CENTRIFUGE_VAULT_USDT = "0xbeF5909361D176a6E41C57134bAc071933B569D7";
export const CENTRIFUGE_BEACON = "0xD5F75f510Fd01F40baA13C4410d548FCc5e57137";

export const OLD_YIELD_GROUP_CENTRIFUGE_IMPL = "0x07B13f1A527Be4777678c7B8F17e9bd1729D55cF";
export const NEW_YIELD_GROUP_CENTRIFUGE_IMPL = "0x4dA4C682E38a5400B56e979bcA3Fc70Bf73A70Ee";
export const OLD_ADAPTER_CENTRIFUGE = "0x78b5D33CB96546BEED3F2CeD7B95bc11bD330A35";
export const NEW_ADAPTER_CENTRIFUGE = "0xD85Ffe60A942DBE87Df5768f664f21fE3962c58c";

// `disablePriceAgeGuard(address)` is unchanged and stays granted.
export const OLD_PRICE_GUARD_SIGS = [
  "setPriceAgeGuard(address,address,uint64,uint64)",
  "setGrowthGuardRate(address,uint16,uint16,uint32)",
  "setGrowthGuardSnapshot(address,uint128,uint64)",
  "setDropGuardRate(address,uint16,uint16,uint32)",
  "setDropGuardSnapshot(address,uint128,uint64)",
];

export const NEW_NAV_GUARD_SIGS = [
  "setPriceAgeGuard(address,address,bool,bool)",
  "setNavGuardRate(address,uint16,uint16,uint16,uint32)",
  "setNavGuardSnapshot(address,uint128,uint64)",
  "setNavGuardEnabled(address,bool,bool)",
];

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

Upgrades the Centrifuge YieldGroup contracts of the Liquidity Hub (USDT) on BNB Chain Testnet to the
version, and updates the ACM permissions to match the new
functions. The source contract, its registration on the Hub, the registered fund and the assets it holds
stay exactly as they are. Only the code behind them changes.

#### What changed

- **The value of the position is bounded, not just its price.** The old growth and drop guards limited how
  fast the fund's share price could move. They are replaced by one **NAV guard**, a band around the total
  value the fund reports. A value outside the band is reported at the edge of the band instead. It never
  reverts, and it no longer pauses the Hub, so the source no longer needs the \`pauseHub()\` permission.
- **Price freshness follows Centrifuge's own expiry.** The price age guard can now be switched on per price
  leg, and only enforces the expiry Centrifuge publishes with each price. There is no longer a separate
  maximum age chosen by Venus. A price that was never published is rejected as well.
- **The adapter and the yield group work as a pair.** The adapter asks the yield group to check price
  freshness before reading a price, and the yield group applies the NAV guard to the adapter's valuation.
  Both have to be replaced in the same transaction.

#### Actions (one transaction, in order)

1. Point the **CentrifugeBeacon** at the new **YieldGroupCentrifuge** implementation. The beacon is owned by
   the Normal Timelock. Storage is preserved: the only layout change is in the storage the old guards
   used, where the registered fund has nothing but a drop guard record that was already disabled and
   that the new code never reads.
2. Update the adapter of the registered fund on **CentrifugeSource_USDT** to the new **AdapterCentrifuge**.
3. Grant the four new permissions on the source to the **Normal Timelock** and the **Guardian**:
   \`setPriceAgeGuard(address,address,bool,bool)\`, \`setNavGuardRate\`, \`setNavGuardSnapshot\` and
   \`setNavGuardEnabled\`.
4. Revoke the five permissions that no longer exist from both: the old
   \`setPriceAgeGuard(address,address,uint64,uint64)\` and the four growth and drop guard setters.
   \`disablePriceAgeGuard\` is unchanged and stays granted.
5. Revoke the \`pauseHub()\` permission on **Hub_USDT** from the source. Nothing in the new code calls it.

#### Why the other yield groups are not upgraded

Core, FRV and Flux are not upgraded: the only change to the shared YieldGroup base contract is that two
internal functions can now be overridden by the Centrifuge group, and the compiled Core, FRV and Flux
implementations are byte-for-byte identical to what is already deployed.

#### Guards

This proposal does not turn on any guard. The NAV guard and the price age guard both need values chosen
from how the fund actually behaves. The permissions are granted now so that turning them on later does not
need another proposal.

#### References

- The earlier BNB Chain Testnet proposal that onboarded the Centrifuge YieldGroup
- HashDit audit of the Centrifuge YieldGroup`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      { target: CENTRIFUGE_BEACON, signature: "upgradeTo(address)", params: [NEW_YIELD_GROUP_CENTRIFUGE_IMPL] },
      {
        target: CENTRIFUGE_SOURCE_USDT,
        signature: "updateResourceAdapter(address,address)",
        params: [MOCK_CENTRIFUGE_VAULT_USDT, NEW_ADAPTER_CENTRIFUGE],
      },
      ...[NORMAL_TIMELOCK, GUARDIAN].flatMap(holder =>
        NEW_NAV_GUARD_SIGS.map(sig => giveCallPermission(CENTRIFUGE_SOURCE_USDT, sig, holder)),
      ),
      ...[NORMAL_TIMELOCK, GUARDIAN].flatMap(holder =>
        OLD_PRICE_GUARD_SIGS.map(sig => revokeCallPermission(CENTRIFUGE_SOURCE_USDT, sig, holder)),
      ),
      revokeCallPermission(HUB_USDT, "pauseHub()", CENTRIFUGE_SOURCE_USDT),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664Addendum;
