import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { GUARDIAN_GRANTS, NORMAL_TIMELOCK_GRANTS, giveCallPermission } from "./permissions-bsctestnet";

const { ACCESS_CONTROL_MANAGER, NORMAL_TIMELOCK, GUARDIAN } = NETWORK_ADDRESSES.bsctestnet;

export const ACM = ACCESS_CONTROL_MANAGER;
export { NORMAL_TIMELOCK, GUARDIAN };

// Existing Hub stack. Only Hub_USDT is called; the rest are queue entries.
export const HUB_USDT = "0x7cE6ADF754D0eC81A6CF8ACd9C7454F45077dc61";
export const CORE_SOURCE_USDT = "0x11e39DC7b8b16BBDA8D9C2903dF741Ae9341Ec88";
export const FRV_SOURCE_USDT = "0xA0Fb0fFeBdcB7F45A3Ec841cCE7F78B7CeBD0f82";
export const FLUX_SOURCE_USDT = "0x044E572144bc08ed2D90E081EeEd7b5b6Cb01016";
export const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";

export const ADAPTER_CENTRIFUGE = "0x78b5D33CB96546BEED3F2CeD7B95bc11bD330A35";
export const CENTRIFUGE_SOURCE_USDT = "0x28e5E0ce9c15E3dE00855C2dda7cA260B470FCC2";

// A Venus-controlled mock: Centrifuge has no BSC-testnet deployment.
export const MOCK_CENTRIFUGE_VAULT_USDT = "0xbeF5909361D176a6E41C57134bAc071933B569D7";

// Testnet policy: no caps on any group.
const ABSOLUTE_CAP_UNBOUNDED = "340282366920938463463374607431768211455"; // type(uint128).max
const PERCENTAGE_CAP_DISABLED = 10_000;

const CENTRIFUGE_ONLY = [MOCK_CENTRIFUGE_VAULT_USDT];

// Drained front to back. Centrifuge first, so settled assets earning nothing are spent before a
// productive position; Core last as the liquid backstop. It has to be listed at all because the Hub
// rejects a withdraw queue omitting a group that holds a balance. The deposit queue is left alone —
// Centrifuge settles over days, so a deposit routed there would be stuck in a pending request.
const OUTER_WITHDRAW_QUEUE = [CENTRIFUGE_SOURCE_USDT, FRV_SOURCE_USDT, FLUX_SOURCE_USDT, CORE_SOURCE_USDT];

const grantsOnSource = () =>
  [
    // Both holders get the whole surface. The timelock is granted all of it, the Guardian only what
    // its wildcards miss. See ./permissions-bsctestnet.
    ...NORMAL_TIMELOCK_GRANTS.map(sig => ({ account: NORMAL_TIMELOCK, sig })),
    ...GUARDIAN_GRANTS.map(sig => ({ account: GUARDIAN, sig })),
  ].map(({ account, sig }) => giveCallPermission(ACM, CENTRIFUGE_SOURCE_USDT, sig, account));

export const vip664 = () => {
  const meta = {
    version: "v2",
    // Placeholder number. The testnet governor is already past this, so it will be wrong on chain —
    // it gets set for real once the mainnet proposal is finalized. Nothing in the description below
    // cites a VIP number, so only this line has to change.
    title: "VIP-666 [BNB Chain Testnet] Liquidity Hub (USDT) — onboard the Centrifuge YieldGroup",
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

1. Grant the full gated surface of **CentrifugeSource_USDT** to the **Normal Timelock** and to the
   **Guardian** multisig, which stands in for the Operator and the Keeper on this network. Nobody else
   is granted anything. The Guardian is an ACM admin that already holds the shared yield-group surface
   against every contract, so only the Centrifuge-specific signatures are granted to it.
2. Grant **CentrifugeSource_USDT** itself the \`pauseHub()\` role on **Hub_USDT**. The drop guard's only
   reaction is the group calling \`pauseHub()\`; without this role a genuine breach would make the
   permissionless \`enforceDropGuard\` revert instead of pausing.
3. Register the Centrifuge vault on the source behind **AdapterCentrifuge** (\`addResource\`), then set the
   source's inner deposit and withdraw queues.
4. Register the source on **Hub_USDT** (\`addYieldGroup\`), uncapped, matching testnet policy for the
   existing three groups.
5. Set the Hub's outer withdraw queue to **Centrifuge → FRV → Flux → Core**. The deposit queue is
   not touched.

#### Deposit routing

The Centrifuge group joins the **withdraw** queue only; the deposit queue is left as it is. Because
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
- The earlier BNB Chain Testnet proposal that deployed this Hub stack and wired Core, FRV and Flux`,
    forDescription: "I agree that Venus Protocol should proceed with onboarding the Centrifuge YieldGroup",
    againstDescription: "I do not think that Venus Protocol should proceed with onboarding the Centrifuge YieldGroup",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with onboarding the Centrifuge YieldGroup",
  };

  // Order matters: grants first, addResource before the inner queues, addYieldGroup before the outer.
  return makeProposal(
    [
      // 1. ACM roles on the new source.
      ...grantsOnSource(),

      // 2. The drop guard's only reaction: gated on the Hub, granted to the source itself.
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [HUB_USDT, "pauseHub()", CENTRIFUGE_SOURCE_USDT],
      },

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

      // 5. Centrifuge joins the withdraw cascade. The deposit queue is left alone.
      { target: HUB_USDT, signature: "setOuterWithdrawQueue(address[])", params: [OUTER_WITHDRAW_QUEUE] },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664;
