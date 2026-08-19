import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ADAPTER_FRV,
  FRV_ABSOLUTE_CAP,
  FRV_PERCENTAGE_CAP_BPS as FRV_PERCENTAGE_CAP_BPS_OLD,
  STACKS,
} from "../vip-650/addresses/bscmainnet";

// ===================================================================================================
// VIP-665 [BNB Chain] — Wire the Cash+ and Ceffu FRV vaults into the Liquidity Hub, raise FRV caps to 50%
//
// Hub-side wiring so the Operator can allocate funds into fixed-rate vaults (VPD-1867 / VDB-53). See
// meta.description below for the full rationale; this banner only records the on-chain verification.
//
// Re-verified on-chain at HEAD and at the sim fork block 116,780,000 (every fact below is stable
// across that gap):
//   - U / USDT Hub and FRV source addresses reused from VIP-650's address book (STACKS); each
//     source.asset() matches its Hub asset, both FRV groups have
//     yieldGroupConfig == (5,000,000e18, 3000 bps, registered, unpaused) and resources() == [].
//   - CASH+ vault: asset() == U and AdapterFRV.asset(vault) == U, so addResource's asset-match check
//     passes; it is a deployed InstitutionalLoanVault clone, currently in lifecycle state
//     MarginDeposited (pre-Fundraising, maxDeposit == 0).
//   - Ceffu (USDT) vault: NOT yet deployed. Its address is fixed by CREATE2 — the controller clones
//     the vault with Clones.cloneDeterministic(salt = keccak256(institutionOperator, nonce)) — and is
//     read straight from the live controller: InstitutionalVaultController(CONTROLLER)
//     .predictVaultAddress(CEFFU_INSTITUTION) == CEFFU_VAULT (checked at HEAD and at 116,780,000, so
//     the institution's nonce has not advanced). Its supplyAsset will be USDT, matching the USDT Hub.
//   - ADAPTER_FRV is the shared FRV adapter registered by VIP-650/651.
//   - Normal Timelock holds every role called below on both FRV sources and Hubs (ACM.hasRole);
//     Operator holds `reallocate` on both Hubs.
// ===================================================================================================

// Hub / FRV-source addresses come from VIP-650's verified address book rather than being re-literalled.
const stack = (key: string) => {
  const found = STACKS.find(s => s.key === key);
  if (!found) throw new Error(`VIP-665: no ${key} Hub stack in the VIP-650 address book`);
  return found;
};
const uStack = stack("U");
const usdtStack = stack("USDT");

export const U_HUB = uStack.hub;
export const U_FRV_SOURCE = uStack.frv;
export const USDT_HUB = usdtStack.hub;
export const USDT_FRV_SOURCE = usdtStack.frv;

// Shared FRV adapter (VIP-650). AdapterFRV.asset(CASH_PLUS_VAULT) == U, so addResource does not revert
// ResourceAssetMismatch and its validateRegistration is a no-op.
export { ADAPTER_FRV };

// Asseto CASH+ fixed-rate vault for U (deployed by the fixed-rate-vaults workstream). asset() == U.
// EIP-55 checksummed so ethers validates the literal.
export const CASH_PLUS_VAULT = "0x41179fc6ff878b7795B900888E0B61fd8029bceA";

// Ceffu fixed-rate vault for USDT. NOT yet deployed: the address is the deterministic CREATE2 clone
// address the InstitutionalVaultController will mint for institution CEFFU_INSTITUTION at its current
// nonce, read live from the controller (predictVaultAddress(CEFFU_INSTITUTION) == CEFFU_VAULT — see
// the header). The vault must be deployed by the fixed-rate-vaults workstream before this VIP is
// executed; the simulation asserts the prediction still holds at the fork block. All EIP-55
// checksummed so ethers validates the literals.
export const CONTROLLER = "0x6D9e91cB766259af42619c14c994E694E57e6E85"; // InstitutionalVaultController proxy
export const CEFFU_INSTITUTION = "0x8972E6F8874406D294fc0380afBDA839B1b96262"; // Ceffu institution operator
export const CEFFU_VAULT = "0x086fd7972510dF9d9cFdc4efB8677fc72d290103"; // predictVaultAddress(CEFFU_INSTITUTION)

// FRV yield-group cap on each Hub. Absolute cap is UNCHANGED (the launch value); only the percentage
// dimension is raised 30% -> 50%. `_effectiveCap` takes the lower of the two, so the effective FRV
// ceiling is min(5,000,000, 50% x Hub TVL).
export { FRV_ABSOLUTE_CAP, FRV_PERCENTAGE_CAP_BPS_OLD };
export const FRV_PERCENTAGE_CAP_BPS_NEW = 5_000; // 50% — set by this proposal

export const vip665 = () => {
  const meta = {
    version: "v2",
    title: "VIP-665 [BNB Chain] Wire Cash+ and Ceffu FRV vaults into the Liquidity Hub and raise FRV caps to 50%",
    description: `#### Summary

Prepares the **Liquidity Hub** on BNB Chain to allocate funds into fixed-rate vaults (VPD-1867). It
registers the **Asseto CASH+** fixed-rate vault as a resource on the **U** Hub's FRV yield source, the
**Ceffu** fixed-rate vault as a resource on the **USDT** Hub's FRV yield source, and raises the FRV
percentage-of-TVL cap from **30% to 50%** (absolute cap unchanged at **5,000,000**) on both the **U**
and **USDT** Hubs.

VIP-650/651 onboarded the Hub with each FRV yield source registered but left UNWIRED, because no
fixed-rate vault existed yet. This proposal completes the Hub-side wiring the Operator needs before it
can \`reallocate\` funds into the vaults. Registering a vault does NOT auto-route deposits into it: the
FRV source stays out of the Hub's outer deposit queue, so lender deposits continue to land in
Core/Flux and FRV is filled only by the Operator's reallocate.

The **Ceffu** vault is not yet deployed. Its address is deterministic: the
InstitutionalVaultController clones it via \`Clones.cloneDeterministic\` with
\`salt = keccak256(institutionOperator, nonce)\`, so it is fixed before deployment and read straight
from the controller — \`predictVaultAddress(${CEFFU_INSTITUTION}) == ${CEFFU_VAULT}\`. The
fixed-rate-vaults workstream must deploy the vault at this address (institution nonce unchanged)
before this VIP is executed; the fork simulation asserts the prediction still holds.

#### Actions (one atomic transaction, in order)

On the **U** Hub's FRV source (\`${U_FRV_SOURCE}\`):

1. \`addResource(${CASH_PLUS_VAULT}, AdapterFRV)\` — register the CASH+ vault behind the shared FRV
   adapter. Reverts unless the vault's asset matches the source asset (U), which it does.
2. \`setInnerWithdrawQueue([CASH+ vault])\` — so any funds later placed in the vault are reachable via
   the Hub's normal withdraw path once the vault reaches a terminal state. This is the withdraw side
   only; the inner **deposit** queue is deliberately left empty (see Notes).

3. \`raiseYieldGroupCap(U FRV source, 5,000,000, 5000 bps)\` on the U Hub.

On the **USDT** Hub's FRV source (\`${USDT_FRV_SOURCE}\`):

4. \`addResource(${CEFFU_VAULT}, AdapterFRV)\` — register the Ceffu vault behind the shared FRV
   adapter. Reverts unless the vault's asset matches the source asset (USDT), which it will.
5. \`setInnerWithdrawQueue([Ceffu vault])\` — withdraw side only, same rationale as the CASH+ leg.

6. \`raiseYieldGroupCap(USDT FRV source, 5,000,000, 5000 bps)\` on the USDT Hub.

Both cap changes keep the absolute cap at 5,000,000 and only raise the percentage dimension from 3000
to 5000 bps, which the Hub's raise guard accepts (absolute unchanged, percentage strictly increases).

#### Access control

No ACM grants are needed. VIP-650/651 granted the **Normal Timelock** the full Governance role set on
every Hub and FRV source, so it calls \`addResource\`, \`setInnerWithdrawQueue\` and
\`raiseYieldGroupCap\` directly.

#### Notes

- Each FRV source's inner **deposit** queue is left empty on purpose. The Operator's \`reallocate\`
  targets the vault resource explicitly, so it does not depend on the inner deposit queue; setting it
  would only pre-arm automatic cascade routing into FRV, which nothing here needs. It can be set by
  the VIP that later adds FRV to the Hub's outer deposit queue, together with that decision.
- The outer withdraw queues are unchanged — FRV already sits last in each Hub's [Flux, Core, FRV].
- Absolute caps, fees, outer queues and the USDC Hub are untouched.

#### Security / operational guardrails (reviewer findings — record before merge)

- **Do not \`reallocate\` funds into the CASH+ or Ceffu vault yet.** On the InstitutionalVaultController
  the \`sweep(address,address)\` and \`setTreasury(address)\` roles are held by the CriticalGuardian
  3-of-6 Safe with no timelock delay, and \`BaseVault.sweep\` does not exclude the supply asset, so that
  Safe could move vault capital while AdapterFRV still marks full principal. Not exploitable while a
  vault is pre-Fundraising (\`maxDeposit == 0\`), so this VIP ships safely, but funds must not be pushed
  in until those controller roles are narrowed to the Normal Timelock and the sweep guard is added.
- The FRV per-source cap is the primary containment for FRV illiquidity; the secondary exit-fee brake
  is currently off (\`redeemFeeBps == 0\`). This VIP does not set a redeem fee — no value was specified
  in the approved scope and risk parameters are not assumed. Raising the cap only creates headroom;
  the Operator holding off on reallocations (above) keeps the effective exposure at zero until the
  exit-fee decision is made.

#### Deployed contracts (BNB Chain)

- U Hub: ${U_HUB} · U FRV source: ${U_FRV_SOURCE}
- USDT Hub: ${USDT_HUB} · USDT FRV source: ${USDT_FRV_SOURCE}
- Asseto CASH+ vault (U): ${CASH_PLUS_VAULT}
- Ceffu vault (USDT, predicted, pending deployment): ${CEFFU_VAULT}
- InstitutionalVaultController: ${CONTROLLER}
- Shared AdapterFRV: ${ADAPTER_FRV}`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // --- U Hub: register the CASH+ vault on the FRV source (addResource must precede the withdraw
      //     queue setter, which rejects unregistered resources), then raise the U Hub FRV cap ---
      {
        target: U_FRV_SOURCE,
        signature: "addResource(address,address)",
        params: [CASH_PLUS_VAULT, ADAPTER_FRV],
      },
      {
        target: U_FRV_SOURCE,
        signature: "setInnerWithdrawQueue(address[])",
        params: [[CASH_PLUS_VAULT]],
      },
      {
        target: U_HUB,
        signature: "raiseYieldGroupCap(address,uint256,uint16)",
        params: [U_FRV_SOURCE, FRV_ABSOLUTE_CAP, FRV_PERCENTAGE_CAP_BPS_NEW],
      },

      // --- USDT Hub: register the Ceffu vault on the FRV source (same ordering), then raise the
      //     USDT Hub FRV cap. FRV percentage cap goes 30% -> 50% on both Hubs (absolute unchanged) ---
      {
        target: USDT_FRV_SOURCE,
        signature: "addResource(address,address)",
        params: [CEFFU_VAULT, ADAPTER_FRV],
      },
      {
        target: USDT_FRV_SOURCE,
        signature: "setInnerWithdrawQueue(address[])",
        params: [[CEFFU_VAULT]],
      },
      {
        target: USDT_HUB,
        signature: "raiseYieldGroupCap(address,uint256,uint16)",
        params: [USDT_FRV_SOURCE, FRV_ABSOLUTE_CAP, FRV_PERCENTAGE_CAP_BPS_NEW],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip665;
