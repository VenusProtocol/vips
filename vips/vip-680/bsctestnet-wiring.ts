import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ABSOLUTE_CAP_UNBOUNDED,
  ADAPTER_CORE_V1,
  ADAPTER_FLUX,
  ADAPTER_FRV,
  CORE_SOURCE_USDT,
  FLUX_SOURCE_USDT,
  FRV_SOURCE_USDT,
  FRV_VAULT_USDT,
  FUSDT_FLUX,
  HUB_REGISTRY,
  HUB_USDT,
  PERCENTAGE_CAP_DISABLED,
  VUSDT_CORE,
} from "./addresses";

// ---------------------------------------------------------------------------------------------------
// VIP-680 (wiring) — BNB Chain Testnet.
//
// Registers the Hub in the HubRegistry and wires all three yield sources (Core, FRV, Flux)
// end-to-end, in one atomic proposal. Depends on the main VIP-680 proposal, which grants the Normal
// Timelock the roles used here and accepts the Hub/registry ownership; this proposal must execute
// after it.
//
// Ordering is load-bearing and must not be reshuffled:
//   - addHub comes FIRST, before every addYieldGroup, so HubAdded lands at a lower log index than any
//     YieldGroupAdded (indexers rely on this to seed each Hub's yield-group set correctly).
//   - each source's addResource precedes its inner-queue setters (the setters reject unregistered
//     resources).
//   - each addYieldGroup precedes the Hub's outer-queue setters (they reject unregistered groups).
//
// Outer queue order [FRV, Flux, Core] (deposit and withdraw): FRV first so deposits reach the vault
// under test; Core last because it is registered uncapped and would otherwise swallow every deposit
// before the others receive any. All three groups are registered uncapped (type(uint128).max absolute,
// 10_000 bps disabling the percentage dimension), matching the testnet policy.
// ---------------------------------------------------------------------------------------------------

const CORE_ONLY = [VUSDT_CORE];
const FRV_ONLY = [FRV_VAULT_USDT];
const FLUX_ONLY = [FUSDT_FLUX];

// Outer queues: FRV -> Flux -> Core, same order for deposits and withdrawals. Every registered group
// is listed so the withdraw-queue funded-coverage guard is satisfied now and after any deposit.
const OUTER_QUEUE = [FRV_SOURCE_USDT, FLUX_SOURCE_USDT, CORE_SOURCE_USDT];

const addYieldGroup = (source: string) => ({
  target: HUB_USDT,
  signature: "addYieldGroup(address,uint256,uint16)",
  params: [source, ABSOLUTE_CAP_UNBOUNDED, PERCENTAGE_CAP_DISABLED],
});

export const vip680Wiring = () => {
  const meta = {
    version: "v2",
    title: "VIP-680 [BNB Chain Testnet] Liquidity Hub (USDT) — register Hub and wire Core, FRV and Flux",
    description: `#### Summary

Second of five proposals onboarding the redeployed **Liquidity Hub (USDT)** on BNB Chain Testnet.
Using the Governance roles granted to the Normal Timelock in the main VIP-680 proposal, this proposal
registers the Hub in the **HubRegistry** and wires all three yield sources end-to-end so the Hub routes
deposits and withdrawals through **FRV**, **Flux** and **Core**.

#### Actions (one atomic transaction, in order)

1. Register **Hub_USDT** in the **HubRegistry** (\`addHub\`) — ordered before any \`addYieldGroup\` so the
   \`HubAdded\` event precedes every \`YieldGroupAdded\`.
2. On the **Core** source, register **vUSDT** behind **AdapterCoreV1** and set its inner deposit/withdraw
   queues.
3. On the **FRV** source, register the **FRV vault** behind **AdapterFRV** and set its inner queues.
4. On the **Flux** source, register the **Fluid fUSDT** fToken behind **AdapterFlux** and set its inner
   queues.
5. Register all three sources on **Hub_USDT** with an effectively-unbounded cap, then point the Hub's
   outer deposit and withdraw queues at **[FRV, Flux, Core]**.

#### Notes

- Queue order routes deposits to FRV first, then Flux, with Core last as the uncapped backstop.
- All three groups are registered uncapped (testnet policy); caps can be tightened later by governance
  or the operator.
- Testnet-only. The Hub is not yet deployed on any mainnet.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // 1. Register the Hub in the registry (must precede every addYieldGroup below).
      { target: HUB_REGISTRY, signature: "addHub(address)", params: [HUB_USDT] },

      // 2. Core source: register vUSDT behind AdapterCoreV1, then set inner queues.
      { target: CORE_SOURCE_USDT, signature: "addResource(address,address)", params: [VUSDT_CORE, ADAPTER_CORE_V1] },
      { target: CORE_SOURCE_USDT, signature: "setInnerDepositQueue(address[])", params: [CORE_ONLY] },
      { target: CORE_SOURCE_USDT, signature: "setInnerWithdrawQueue(address[])", params: [CORE_ONLY] },

      // 3. FRV source: register the FRV vault behind AdapterFRV, then set inner queues.
      { target: FRV_SOURCE_USDT, signature: "addResource(address,address)", params: [FRV_VAULT_USDT, ADAPTER_FRV] },
      { target: FRV_SOURCE_USDT, signature: "setInnerDepositQueue(address[])", params: [FRV_ONLY] },
      { target: FRV_SOURCE_USDT, signature: "setInnerWithdrawQueue(address[])", params: [FRV_ONLY] },

      // 4. Flux source: register the Fluid fUSDT fToken behind AdapterFlux, then set inner queues.
      { target: FLUX_SOURCE_USDT, signature: "addResource(address,address)", params: [FUSDT_FLUX, ADAPTER_FLUX] },
      { target: FLUX_SOURCE_USDT, signature: "setInnerDepositQueue(address[])", params: [FLUX_ONLY] },
      { target: FLUX_SOURCE_USDT, signature: "setInnerWithdrawQueue(address[])", params: [FLUX_ONLY] },

      // 5. Register the three sources on the Hub (in queue order), then point the outer queues at them.
      addYieldGroup(FRV_SOURCE_USDT),
      addYieldGroup(FLUX_SOURCE_USDT),
      addYieldGroup(CORE_SOURCE_USDT),
      { target: HUB_USDT, signature: "setOuterDepositQueue(address[])", params: [OUTER_QUEUE] },
      { target: HUB_USDT, signature: "setOuterWithdrawQueue(address[])", params: [OUTER_QUEUE] },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip680Wiring;
