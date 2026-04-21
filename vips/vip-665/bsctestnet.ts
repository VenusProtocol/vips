import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { cutParams } from "../../simulations/vip-665/utils/cut-params-bsctestnet.json";

const { bsctestnet } = NETWORK_ADDRESSES;
const {
  NORMAL_TIMELOCK,
  FAST_TRACK_TIMELOCK,
  CRITICAL_TIMELOCK,
  GUARDIAN,
  ACCESS_CONTROL_MANAGER,
  UNITROLLER,
  VAI_UNITROLLER,
} = bsctestnet;

// ──────────────────────────────────────────────────────────────────────────
// Newly deployed addresses.

export const DEVIATION_BOUNDED_ORACLE = "0xE0dafC97895B3c98d3B96D3f8739AaC73166beB8";
export const COMPTROLLER_LENS = "0xdBD0992dEd0a1EC14CE0532e60ea023F79372eD9";
export const VAI_CONTROLLER_IMPL = "0xd2848305b0ee7646C930240D79549D50d6Ed024F";

// ──────────────────────────────────────────────────────────────────────────
// ACM-gated function signatures — DeviationBoundedOracle
// ──────────────────────────────────────────────────────────────────────────

export const DBO_GOVERNANCE_FUNCTIONS = [
  "setTokenConfig(address,uint64,uint256,uint256,bool)",
  "setTokenConfigs(address[],uint64[],uint256[],uint256[],bool[])",
  "setCooldownPeriod(address,uint64)",
  "setThresholds(address,uint256,uint256)",
  "setAssetBoundedPricingEnabled(address,bool)",
];

export const DBO_KEEPER_FUNCTIONS = [
  "updateMinPrice(address,uint128)",
  "updateMaxPrice(address,uint128)",
  "exitProtectionMode(address)",
];

export const COMPTROLLER_DBO_SETTER = "setDeviationBoundedOracle(address)";

export const TIMELOCKS = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];

// Expected event counts for post-VIP verification.
// Phase 1: 15 (governance × 3 timelocks) + 12 (keeper × [3 timelocks + Guardian]) + 3 (comptroller setter × 3 timelocks) = 30
export const EXPECTED_PERMISSION_GRANTED_EVENTS = 30;

export const vip665 = () => {
  const meta = {
    version: "v2",
    title: "VIP-665 [BNB Chain Testnet] Deploy and wire the DeviationBoundedOracle into the Core Comptroller",
    description: `#### Summary

If passed, this VIP will roll out the new **DeviationBoundedOracle (DBO)** on BNB Chain Testnet and wire it into the Core Pool Comptroller so that CF-path pricing is protected against short-term price manipulation on low-liquidity collateral tokens.

The DBO maintains a per-market rolling min/max price window and, when the spot price deviates beyond a configured threshold, values collateral at \`min(spot, windowMin)\` and debt at \`max(spot, windowMax)\`. Per-asset configuration is intentionally excluded from this proposal — it will follow in a separate VIP once per-asset thresholds and cooldown periods are finalized.

#### Deployed contracts (populated prior to proposal)

- **DeviationBoundedOracle** (proxy): ${DEVIATION_BOUNDED_ORACLE}
- **ComptrollerLens**: ${COMPTROLLER_LENS}
- **VAIController implementation**: ${VAI_CONTROLLER_IMPL}
- **Unitroller**: ${UNITROLLER}
- **VaiUnitroller**: ${VAI_UNITROLLER}

#### Actions

**Phase 1 — ACM permissions (30 grants)**

| Target                | Signatures (count)                    | Callers                                 | Grants |
|-----------------------|---------------------------------------|-----------------------------------------|--------|
| DeviationBoundedOracle| 5 governance setters                  | 3 timelocks                             | 15     |
| DeviationBoundedOracle| 3 keeper actions                      | 3 timelocks + Guardian                  | 12     |
| Unitroller            | \`setDeviationBoundedOracle(address)\`| 3 timelocks                             | 3      |

**Phase 2 — Accept DBO ownership.** The deployment script calls \`transferOwnership(NORMAL_TIMELOCK)\`; this VIP completes the Ownable2Step handshake with \`acceptOwnership()\`.

**Phase 3 — Comptroller facet upgrade (\`diamondCut\`).** Installs the new Diamond implementation and the five upgraded facets (PolicyFacet, SetterFacet, MarketFacet, RewardFacet, FlashLoanFacet). The new \`setDeviationBoundedOracle(address)\` selector is added to the new SetterFacet; every other existing selector on the five facets is replaced to point at its new facet address.

**Phase 4 — Wire the new ComptrollerLens.** The new \`ComptrollerLens\` uses DBO-bounded prices on the CF path; it is installed via the admin-gated \`_setComptrollerLens\` setter.

**Phase 5 — VAIController implementation upgrade.** \`VAIController.mintVAI\` and \`getMintableVAI\` now read \`comptroller.deviationBoundedOracle()\`, so the logic contract behind the \`VaiUnitroller\` proxy is upgraded via \`_setPendingImplementation\` + \`_become\`.

**Phase 6 — Wire the DBO into Comptroller.** Calls \`setDeviationBoundedOracle\` on the Unitroller to set the V19 storage slot consumed by the upgraded facets and VAIController.
`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ──────────────────────────────────────────────────────────────────
      // PHASE 1 — ACM permissions (30 grants)
      //   1a. DBO governance setters → 3 timelocks               (15)
      //   1b. DBO keeper actions     → 3 timelocks + Guardian    (12)
      //   1c. Comptroller DBO setter → 3 timelocks                (3)
      // ──────────────────────────────────────────────────────────────────

      // 1a — DBO governance setters for 3 timelocks
      ...DBO_GOVERNANCE_FUNCTIONS.flatMap(sig =>
        TIMELOCKS.map(caller => ({
          target: ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [DEVIATION_BOUNDED_ORACLE, sig, caller],
        })),
      ),

      // 1b — DBO keeper actions for 3 timelocks + Guardian
      ...DBO_KEEPER_FUNCTIONS.flatMap(sig =>
        [...TIMELOCKS, GUARDIAN].map(caller => ({
          target: ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [DEVIATION_BOUNDED_ORACLE, sig, caller],
        })),
      ),

      // 1c — Comptroller setDeviationBoundedOracle for 3 timelocks
      ...TIMELOCKS.map(timelock => ({
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, COMPTROLLER_DBO_SETTER, timelock],
      })),

      // ──────────────────────────────────────────────────────────────────
      // PHASE 2 — Accept DBO ownership (Ownable2Step handshake)
      // ──────────────────────────────────────────────────────────────────
      {
        target: DEVIATION_BOUNDED_ORACLE,
        signature: "acceptOwnership()",
        params: [],
      },

      // ──────────────────────────────────────────────────────────────────
      // PHASE 3 — Comptroller facet upgrade (diamondCut)
      //   Installs the new Diamond impl + 5 upgraded facets and adds the
      //   new `setDeviationBoundedOracle(address)` selector.
      // ──────────────────────────────────────────────────────────────────
      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [cutParams],
      },

      // ──────────────────────────────────────────────────────────────────
      // PHASE 4 — Wire new ComptrollerLens
      //   `_setComptrollerLens` is admin-gated (not ACM); the timelock is
      //   the Unitroller admin so no permission grant is required.
      // ──────────────────────────────────────────────────────────────────
      {
        target: UNITROLLER,
        signature: "_setComptrollerLens(address)",
        params: [COMPTROLLER_LENS],
      },

      // ──────────────────────────────────────────────────────────────────
      // PHASE 5 — VAIController implementation upgrade
      //   VAIController.mintVAI and getMintableVAI read
      //   comptroller.deviationBoundedOracle(); swap in the new logic
      //   before the DBO is wired on the Comptroller (Phase 6).
      // ──────────────────────────────────────────────────────────────────
      {
        target: VAI_UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [VAI_CONTROLLER_IMPL],
      },
      {
        target: VAI_CONTROLLER_IMPL,
        signature: "_become(address)",
        params: [VAI_UNITROLLER],
      },

      // ──────────────────────────────────────────────────────────────────
      // PHASE 6 — Wire DBO into Comptroller
      //   Uses the ACM permission granted in Phase 1c.
      // ──────────────────────────────────────────────────────────────────
      {
        target: UNITROLLER,
        signature: "setDeviationBoundedOracle(address)",
        params: [DEVIATION_BOUNDED_ORACLE],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip665;
