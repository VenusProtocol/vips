import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// ===================================================================================================
// VIP-665 [BNB Chain] — Wire the Cash+ FRV vault into the U Liquidity Hub, raise the FRV cap to 50%
//
// VIP-650 / VIP-651 onboarded the Liquidity Hub on BNB Chain mainnet for USDT, USDC and U. On every
// Hub the FRV (Fixed-Rate Vault) yield source was registered as a yield group but left UNWIRED — no
// fixed-rate vault existed yet to register as a resource. Each FRV group launched with an absolute
// cap of 5,000,000 and a 30% (3000 bps) percentage-of-TVL cap, sits LAST in the outer withdraw queue
// [Flux, Core, FRV] and is deliberately kept OUT of the outer deposit queue (FRV is filled by the
// Operator's `reallocate`, not by the deposit cascade).
//
// The Asseto CASH+ fixed-rate vault for the U asset is now deployed, so this proposal does the
// Hub-side wiring needed before the Operator can allocate funds into it (VPD-1867):
//   - register the CASH+ vault as a resource on the U Hub's FRV source (behind the shared AdapterFRV);
//   - set that source's inner deposit/withdraw queues to the vault, mirroring the Core/Flux wiring;
//   - raise the FRV percentage cap from 30% to 50% on BOTH the U and USDT Hubs (absolute cap
//     unchanged at 5,000,000), so headroom exists for reallocations once vaults are live.
//
// The Ceffu FRV vault for the USDT Hub is NOT yet deployed, so its resource registration is left to a
// follow-up VIP; only the USDT Hub's FRV cap is raised here (policy, independent of any vault).
//
// Every command is callable DIRECTLY by the Normal Timelock: VIP-650/651 granted it the full
// Governance role set on each Hub and FRV source (addResource / setInnerDepositQueue /
// setInnerWithdrawQueue on the source, raiseYieldGroupCap on the Hub), so NO new ACM grants and no
// aggregator are needed.
//
// Addresses — from venus-liquidity-hub/deployments/bscmainnet/ and VIP-650's address book, each
// re-verified on-chain at block 116,788,760:
//   - U Hub / U FRV source / USDT Hub / USDT FRV source: hub.asset() / source.asset() match their
//     asset; both FRV groups have yieldGroupConfig == (5,000,000e18, 3000 bps, registered, unpaused)
//     and resources() == [] (unwired).
//   - CASH+ vault: asset() == U and AdapterFRV.asset(vault) == U (so addResource's asset-match check
//     passes); it is a deployed contract, currently in lifecycle state MarginDeposited (pre-Fundraising).
//   - ADAPTER_FRV is the shared FRV adapter registered by VIP-650/651.
//   - Normal Timelock holds every role called below (verified via ACM.hasRole); Operator holds
//     `reallocate` on both Hubs.
// ===================================================================================================

// --- U Hub stack (asset U = 0xcE24439F2D9C6a2289F741120FE202248B666666) ---
export const U_HUB = "0x0e5AA174d4F31b757a237eb1999DE151596788B0";
export const U_FRV_SOURCE = "0x30908eddB9E94add7AC9944a0adda66d80B89143";

// --- USDT Hub stack (asset USDT = 0x55d398326f99059fF775485246999027B3197955) ---
export const USDT_HUB = "0x18AfDACF30F8671021dec4b78297E39d2FE87226";
export const USDT_FRV_SOURCE = "0x621eF38cE0C4e7060fF0bF3D609E3D46EC144bE7";

// Shared FRV adapter (venus-liquidity-hub/deployments/bscmainnet/AdapterFRV.json), same instance
// VIP-650/651 registered. AdapterFRV.asset(CASH_PLUS_VAULT) == U, so addResource does not revert
// ResourceAssetMismatch, and its validateRegistration is a no-op.
export const ADAPTER_FRV = "0x1FA0365bDd603452CE96BE3c0e12Db5515a35902";

// Asseto CASH+ fixed-rate vault for U (deployed by the fixed-rate-vaults workstream). asset() == U.
export const CASH_PLUS_VAULT = "0x41179fc6ff878b7795b900888e0b61fd8029bcea";

// FRV yield-group cap on each Hub. Absolute cap is UNCHANGED (the launch value); only the percentage
// dimension is raised 30% -> 50%. `_effectiveCap` takes the lower of the two, so the effective FRV
// ceiling is min(5,000,000, 50% x Hub TVL).
export const FRV_ABSOLUTE_CAP = parseUnits("5000000", 18).toString(); // 5,000,000 tokens (unchanged)
export const FRV_PERCENTAGE_CAP_BPS_OLD = 3_000; // 30% — launch value, asserted pre-VIP
export const FRV_PERCENTAGE_CAP_BPS_NEW = 5_000; // 50% — set by this proposal

export const vip665 = () => {
  const meta = {
    version: "v2",
    title: "VIP-665 [BNB Chain] Wire Cash+ FRV vault into the U Liquidity Hub and raise FRV caps to 50%",
    description: `#### Summary

Prepares the **Liquidity Hub** on BNB Chain to allocate funds into fixed-rate vaults (VPD-1867). It
registers the **Asseto CASH+** fixed-rate vault as a resource on the **U** Hub's FRV yield source and
raises the FRV percentage-of-TVL cap from **30% to 50%** (absolute cap unchanged at **5,000,000**) on
both the **U** and **USDT** Hubs.

VIP-650/651 onboarded the Hub with each FRV yield source registered but left UNWIRED, because no
fixed-rate vault existed yet. The CASH+ vault for U is now deployed, so this proposal completes the
Hub-side wiring the Operator needs before it can \`reallocate\` funds into the vault. Registering the
vault does NOT auto-route deposits into it: the FRV source stays out of the Hub's outer deposit queue,
so lender deposits continue to land in Core/Flux and FRV is filled only by the Operator's reallocate.

The Ceffu fixed-rate vault for the **USDT** Hub is not yet deployed; its resource registration is a
follow-up VIP. Only the USDT Hub's FRV cap is raised here — a policy change independent of any vault.

#### Actions (one atomic transaction, in order)

On the **U** Hub's FRV source (\`${U_FRV_SOURCE}\`):

1. \`addResource(${CASH_PLUS_VAULT}, AdapterFRV)\` — register the CASH+ vault behind the shared FRV
   adapter. Reverts unless the vault's asset matches the source asset (U), which it does.
2. \`setInnerDepositQueue([CASH+ vault])\` — mirror the Core/Flux inner-queue wiring.
3. \`setInnerWithdrawQueue([CASH+ vault])\` — so FRV funds are reachable via the normal withdraw path
   once the vault reaches a terminal state.

On the Hubs:

4. \`raiseYieldGroupCap(U FRV source, 5,000,000, 5000 bps)\` on the U Hub.
5. \`raiseYieldGroupCap(USDT FRV source, 5,000,000, 5000 bps)\` on the USDT Hub.

Both cap changes keep the absolute cap at 5,000,000 and only raise the percentage dimension from 3000
to 5000 bps, which the Hub's raise guard accepts (absolute unchanged, percentage strictly increases).

#### Access control

No ACM grants are needed. VIP-650/651 granted the **Normal Timelock** the full Governance role set on
every Hub and FRV source, so it calls \`addResource\`, \`setInnerDepositQueue\`,
\`setInnerWithdrawQueue\` and \`raiseYieldGroupCap\` directly.

#### Notes

- Adding the CASH+ vault to the FRV source's inner deposit queue does NOT auto-route deposits into it.
  The FRV source is deliberately kept out of each Hub's outer deposit queue, so lender deposits keep
  routing to Core/Flux; FRV is filled only by the Operator's \`reallocate\`.
- The outer withdraw queues are unchanged — FRV already sits last in each Hub's [Flux, Core, FRV].
- Absolute caps, fees, outer queues and the USDC Hub are untouched.

#### Deployed contracts (BNB Chain)

- U Hub: ${U_HUB} · U FRV source: ${U_FRV_SOURCE}
- USDT Hub: ${USDT_HUB} · USDT FRV source: ${USDT_FRV_SOURCE}
- Asseto CASH+ vault (U): ${CASH_PLUS_VAULT}
- Shared AdapterFRV: ${ADAPTER_FRV}`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // --- U Hub: wire the CASH+ vault on the FRV source (addResource before the queue setters,
      //     which reject unregistered resources) ---
      {
        target: U_FRV_SOURCE,
        signature: "addResource(address,address)",
        params: [CASH_PLUS_VAULT, ADAPTER_FRV],
      },
      {
        target: U_FRV_SOURCE,
        signature: "setInnerDepositQueue(address[])",
        params: [[CASH_PLUS_VAULT]],
      },
      {
        target: U_FRV_SOURCE,
        signature: "setInnerWithdrawQueue(address[])",
        params: [[CASH_PLUS_VAULT]],
      },

      // --- Raise the FRV percentage cap 30% -> 50% on both Hubs (absolute cap unchanged) ---
      {
        target: U_HUB,
        signature: "raiseYieldGroupCap(address,uint256,uint16)",
        params: [U_FRV_SOURCE, FRV_ABSOLUTE_CAP, FRV_PERCENTAGE_CAP_BPS_NEW],
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
