import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { NORMAL_TIMELOCK, GUARDIAN, ACCESS_CONTROL_MANAGER } = NETWORK_ADDRESSES.bsctestnet;

// AccessControlManager that the Liquidity Hub contracts were initialised with. Verified on-chain to
// equal Hub_USDT.accessControlManager() and CoreSource_USDT.accessControlManager(), and to match the
// governance-contracts testnet ACM (NETWORK_ADDRESSES.bsctestnet.ACCESS_CONTROL_MANAGER =
// 0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA). Grants must target THIS ACM — it is the one the Hub
// and sources check against in _checkAccessAllowed.
export const ACM = ACCESS_CONTROL_MANAGER;

// ---------------------------------------------------------------------------------------------------
// Liquidity Hub (USDT) — hardcoded from venus-liquidity-hub/deployments/bsctestnet/*.json.
// The Hub is not published as an @venusprotocol/*-deployments npm package, so addresses are inlined
// here rather than imported. Cross-checked against the deployment registry and on-chain state.
// ---------------------------------------------------------------------------------------------------

// Per-asset ERC-4626 Hub (USDT)
export const HUB_USDT = "0x8C8894217b9552736CF86784B087b5114b7CfF76";

// Core yield source (a YieldGroup proxy over Venus Core lending) — the one source wired by this VIP.
export const CORE_SOURCE_USDT = "0x5A53efCa9ac93c6456d60E3c33839e3F06BA9356";

// Deferred yield sources — deployed but intentionally NOT wired by this VIP (no concrete resource on
// testnet). See the file-level note below; a follow-up VIP wires each when its resource exists.
export const FRV_SOURCE_USDT = "0x503BF2929232a0Cf7C1D296a8C59D63C6224777D";
export const FLUX_SOURCE_USDT = "0x8Aac02EB8054F4CBAdE1396651b94F8F7D87fafc";

// Core resource + adapter: Venus Core-pool vUSDT and the shared stateless AdapterCoreV1.
// vUSDT is @venusprotocol/venus-protocol bsctestnet `vUSDT`; verified on-chain that
// vUSDT.underlying() == Hub_USDT.asset() (USDT) and its Comptroller.treasuryPercent() == 0
// (required for AdapterCoreV1.validateRegistration to pass).
export const VUSDT_CORE = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";
export const ADAPTER_CORE_V1 = "0x480B8A3BBb6B16920c3B60cDcD64Ad059EfDb352";

// ---------------------------------------------------------------------------------------------------
// Caps for addYieldGroup(source, absoluteCap, percentageCapBps).
// ---------------------------------------------------------------------------------------------------

// Effectively-unbounded absolute cap. The Hub rejects type(uint256).max as InvalidCap, so
// type(uint128).max is the canonical "no ceiling" sentinel used throughout the Hub test-suite.
export const CORE_ABSOLUTE_CAP = "340282366920938463463374607431768211455"; // type(uint128).max
// 10_000 bps disables the percentage-of-TVL cap dimension, leaving only the absolute cap binding.
export const PERCENTAGE_CAP_DISABLED = 10_000;

// ---------------------------------------------------------------------------------------------------
// ACM role strings — copied verbatim from the literals passed to _checkAccessAllowed(...) in the
// target contracts (Hub.sol / YieldGroupBase.sol / YieldGroup.sol). Split by access class per the
// Hub's asymmetric permission model (README "Permissions"): Governance can loosen AND tighten; the
// Operator can only tighten (lower caps, pause, reorder queues) plus reallocate.
//
// This VIP (VIP-680) provisions the Governance role set for the NORMAL timelock (the executor, which
// then performs the wiring) and the Operator role set for the Guardian. The Fast-Track and Critical
// timelocks receive the same Governance role set in the addendum proposal (bsctestnet-addendum.ts) —
// split out because all three timelocks' governance grants plus the wiring exceed the single-proposal
// block-gas budget on BSC.
// ---------------------------------------------------------------------------------------------------

// Hub_USDT — Governance role set (every gated Hub function except `reallocate`, which is Operator-only).
export const HUB_GOVERNANCE_SIGS = [
  "addYieldGroup(address,uint256,uint16)",
  "removeYieldGroup(address)",
  "raiseYieldGroupCap(address,uint256,uint16)",
  "lowerYieldGroupCap(address,uint256,uint16)",
  "setOuterDepositQueue(address[])",
  "setOuterWithdrawQueue(address[])",
  "emergencyReallocate((address,address,uint256)[],(address,address,uint256)[])",
  "pauseHub()",
  "unpauseHub()",
  "pauseYieldGroup(address)",
  "unpauseYieldGroup(address)",
  "raiseMaxWithdrawalSize(uint256)",
  "lowerMaxWithdrawalSize(uint256)",
  "setManagementFeeBps(uint16)",
  "setPerformanceFeeBps(uint16)",
  "setRedeemFeeBps(uint16)",
  "setFeeRecipient(address)",
  "sweep(address,address)",
];

// Hub_USDT — Operator role set (tighten-only + reallocate + emergency pause).
export const HUB_OPERATOR_SIGS = [
  "lowerYieldGroupCap(address,uint256,uint16)",
  "setOuterDepositQueue(address[])",
  "setOuterWithdrawQueue(address[])",
  "reallocate((address,address,uint256)[],(address,address,uint256)[])",
  "pauseHub()",
  "pauseYieldGroup(address)",
  "lowerMaxWithdrawalSize(uint256)",
];

// CoreSource_USDT — Governance role set (all gated YieldGroup functions).
export const CORE_SOURCE_GOVERNANCE_SIGS = [
  "addResource(address,address)",
  "removeResource(address)",
  "updateResourceAdapter(address,address)",
  "setInnerDepositQueue(address[])",
  "setInnerWithdrawQueue(address[])",
  "pauseResource(address)",
  "unpauseResource(address)",
  "raiseResourceCap(address,uint256)",
  "lowerResourceCap(address,uint256)",
  "setBlocksPerYear(uint256)",
  "sweep(address,address)",
];

// CoreSource_USDT — Operator role set (tighten-only).
export const CORE_SOURCE_OPERATOR_SIGS = [
  "setInnerDepositQueue(address[])",
  "setInnerWithdrawQueue(address[])",
  "pauseResource(address)",
  "lowerResourceCap(address,uint256)",
];

// Operator holder: the testnet Guardian multisig (the Venus Core multisig plays the Operator role).
const OPERATOR = GUARDIAN;

export const giveCallPermission = (contract: string, sig: string, account: string) => ({
  target: ACM,
  signature: "giveCallPermission(address,string,address)",
  params: [contract, sig, account],
});

export const vip680 = () => {
  const meta = {
    version: "v2",
    title: "VIP-680 [BNB Chain Testnet] Configure Liquidity Hub (USDT) — permissions and Core yield source",
    description: `#### Summary

Post-deploy governance wiring for the newly deployed **Liquidity Hub (USDT)** on BNB Chain Testnet.
The Hub and its yield-source proxies were deployed without any ACM permissions, registry, or queue
configuration (the deploy scripts only deploy and initialise; all ACM-gated wiring is governance's
job). This VIP provisions the core access-control roles and wires the **Core** yield source
end-to-end so the USDT Hub becomes usable, routing deposits and withdrawals through Venus Core. A
companion addendum proposal grants the same Governance role set to the Fast-Track and Critical
timelocks.

#### Access-control model

The Hub uses an asymmetric permission model: **Governance** can both loosen and tighten, while the
**Operator** can only tighten (lower caps, pause, reorder queues) plus rebalance via \`reallocate\`.

1. Grant the **Governance** role set on **Hub_USDT** and the **Core source** to the Normal Timelock
   (registry, caps, queues, pause/unpause, fees, sweep, adapter updates, \`emergencyReallocate\`).
2. Grant the **Operator** role set on **Hub_USDT** and the **Core source** to the Guardian multisig
   (\`lowerYieldGroupCap\`, \`lowerMaxWithdrawalSize\`, \`lowerResourceCap\`, \`setOuter*/setInner*Queue\`,
   \`pauseHub\`, \`pauseYieldGroup\`, \`pauseResource\`, \`reallocate\`).

#### Wiring

3. Register **vUSDT** (Venus Core pool) on the Core source behind the shared **AdapterCoreV1**, and
   point the source's inner deposit/withdraw queues at it.
4. Register the Core source on **Hub_USDT** with an effectively-unbounded cap, and point the Hub's
   outer deposit/withdraw queues at it.

#### Notes

- **FRV and Flux sources are deferred.** Both proxies are deployed but have no concrete resource on
  testnet: no FRV vault instance exists for USDT (only the vault implementation and controller are
  deployed), and the Flux adapter is not deployed (no Fluid LendingResolver on testnet). Their
  permissions and registration will be handled by a dedicated follow-up VIP once each resource exists.
- Testnet-only. The Hub is not yet deployed on any mainnet.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // 1. Governance role set (loosen + tighten) → the Normal Timelock (this proposal's executor).
      ...HUB_GOVERNANCE_SIGS.map(sig => giveCallPermission(HUB_USDT, sig, NORMAL_TIMELOCK)),
      ...CORE_SOURCE_GOVERNANCE_SIGS.map(sig => giveCallPermission(CORE_SOURCE_USDT, sig, NORMAL_TIMELOCK)),

      // 2. Operator role set (tighten-only + reallocate + emergency pause) → the Guardian multisig.
      ...HUB_OPERATOR_SIGS.map(sig => giveCallPermission(HUB_USDT, sig, OPERATOR)),
      ...CORE_SOURCE_OPERATOR_SIGS.map(sig => giveCallPermission(CORE_SOURCE_USDT, sig, OPERATOR)),

      // 3. Register vUSDT on the Core source behind AdapterCoreV1, then set its inner queues.
      //    addResource must precede the inner-queue setters (they reject unregistered resources).
      {
        target: CORE_SOURCE_USDT,
        signature: "addResource(address,address)",
        params: [VUSDT_CORE, ADAPTER_CORE_V1],
      },
      { target: CORE_SOURCE_USDT, signature: "setInnerDepositQueue(address[])", params: [[VUSDT_CORE]] },
      { target: CORE_SOURCE_USDT, signature: "setInnerWithdrawQueue(address[])", params: [[VUSDT_CORE]] },

      // 4. Register the Core source on the Hub, then point the outer queues at it.
      //    addYieldGroup must precede the outer-queue setters (they reject unregistered sources).
      {
        target: HUB_USDT,
        signature: "addYieldGroup(address,uint256,uint16)",
        params: [CORE_SOURCE_USDT, CORE_ABSOLUTE_CAP, PERCENTAGE_CAP_DISABLED],
      },
      { target: HUB_USDT, signature: "setOuterDepositQueue(address[])", params: [[CORE_SOURCE_USDT]] },
      { target: HUB_USDT, signature: "setOuterWithdrawQueue(address[])", params: [[CORE_SOURCE_USDT]] },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip680;
