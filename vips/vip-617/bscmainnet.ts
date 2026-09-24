import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { assetConfigs } from "./utils/asset-configs-bscmainnet.json";
import { cutParams } from "./utils/cut-params-bscmainnet.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const {
  NORMAL_TIMELOCK,
  FAST_TRACK_TIMELOCK,
  CRITICAL_TIMELOCK,
  GUARDIAN,
  ACCESS_CONTROL_MANAGER,
  UNITROLLER,
  VAI_UNITROLLER,
} = bscmainnet;

// ──────────────────────────────────────────────────────────────────────────
// Newly deployed addresses
// ──────────────────────────────────────────────────────────────────────────

export const DEVIATION_BOUNDED_ORACLE = "0xc79Cb7efEBd121DC4B39eA141C214606595D665A";
export const COMPTROLLER_LENS = "0x75A71Ad878f6f24616A2AE21d046C0C8E72f67F8";
export const VAI_CONTROLLER_IMPL = "0x8A7d8589A597619A7842d3BC284b9a5a276FaE56";
export const UNITROLLER_IMPLEMENTATION = "0x82cA18785BBbacBeD1C4f482921E2B2E989D8C08";
export const KEEPER = "0xa44eb88198a7a94dc6d2507bc0e5a216c2410d79";

// ──────────────────────────────────────────────────────────────────────────
// ACM-gated function signatures — DeviationBoundedOracle
// ──────────────────────────────────────────────────────────────────────────

// Granted to all 3 timelocks
export const DBO_GOVERNANCE_FUNCTIONS_3TL = [
  "setTokenConfig((address,uint64,uint256,uint256,bool,bool))",
  "setTokenConfigs((address,uint64,uint256,uint256,bool,bool)[])",
  "setCooldownPeriod(address,uint64)",
  "setThresholds(address,uint256,uint256)",
];

// Granted to all 3 timelocks + Guardian
export const DBO_GOVERNANCE_FUNCTIONS_3TL_GUARDIAN = [
  "setAssetBoundedPricingEnabled(address,bool)",
  "setCachingEnabled(address,bool)",
];

// Granted to all 3 timelocks + Guardian + Keeper
export const DBO_KEEPER_FUNCTIONS = [
  "updateMinPrice(address,uint128)",
  "updateMaxPrice(address,uint128)",
  "exitProtectionMode(address)",
  "syncPriceBoundsAndProtections((address,uint8,uint256)[])",
];

export const COMPTROLLER_DBO_SETTER = "setDeviationBoundedOracle(address)";

export const TIMELOCKS = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];
export const TIMELOCKS_AND_GUARDIAN = [...TIMELOCKS, GUARDIAN];
export const KEEPER_CALLERS = [...TIMELOCKS_AND_GUARDIAN, KEEPER];

// ──────────────────────────────────────────────────────────────────────────
// ACMCommandsAggregator — batches all 42 ACM grants into 4 commands
// (populate → grant admin role → execute → revoke admin role).
// Audit: governance-contracts/audits/118_ACMCommandsAggregator_certik_20241007.pdf
// ──────────────────────────────────────────────────────────────────────────

export const BSC_ACM_AGGREGATOR = "0x8b443Ea6726E56DF4C4F62f80F0556bB9B2a7c64";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

// Index assigned to the batch pushed by this VIP.
export const GRANT_PERMISSIONS_INDEX = 1;

type AcmTuple = [string, string, string]; // (contractAddress, functionSig, account)

const buildAcmGrants = (target: string, signatures: string[], callers: string[]): AcmTuple[] =>
  signatures.flatMap(signature => callers.map(caller => [target, signature, caller] as AcmTuple));

export const ACM_GRANTS: AcmTuple[] = [
  // DBO governance setters → 3 timelocks                (12)
  ...buildAcmGrants(DEVIATION_BOUNDED_ORACLE, DBO_GOVERNANCE_FUNCTIONS_3TL, TIMELOCKS),
  // DBO 3TL+Guardian setters → 3 timelocks + Guardian   ( 8)
  ...buildAcmGrants(DEVIATION_BOUNDED_ORACLE, DBO_GOVERNANCE_FUNCTIONS_3TL_GUARDIAN, TIMELOCKS_AND_GUARDIAN),
  // DBO keeper actions → 3 timelocks + Guardian + K     (20)
  ...buildAcmGrants(DEVIATION_BOUNDED_ORACLE, DBO_KEEPER_FUNCTIONS, KEEPER_CALLERS),
  // Comptroller setDBO → Normal + Guardian              ( 2)
  ...buildAcmGrants(UNITROLLER, [COMPTROLLER_DBO_SETTER], [NORMAL_TIMELOCK, GUARDIAN]),
];

export type AssetConfig = {
  name: string;
  asset: string;
  vToken: string;
  cooldownPeriod: number;
  triggerThreshold: string;
  resetThreshold: string;
  isBoundedPricingEnabled: boolean;
  cachingEnabled: boolean;
};

export const ASSET_CONFIGS: AssetConfig[] = assetConfigs as AssetConfig[];

export const vip617 = () => {
  const meta = {
    version: "v2",
    title: "VIP-617 [BNB Chain] Oracle Dynamic Protection Mode",
    description: `#### Summary

Deploys the new DeviationBoundedOracle (DBO) on BNB Chain mainnet and upgrades the Core Pool Comptroller (Diamond), VAIController, and ComptrollerLens to integrate it. The DBO wraps the existing ResilientOracle with a per-market rolling 15-minute min/max price window, returning protected (min(spot, windowMin), max(spot, windowMax)) pricing on the borrow path when spot deviates beyond the per-market threshold. Phase 1 ships DBO inactive for 23 of 24 assets and active only for **TRX** as a low-liquidity pilot — Phase 2 (separate future VIP) will activate the remaining assets after the keeper and parameters are validated.

#### Description

This VIP performs a one-shot deployment of the DBO infrastructure plus the Comptroller and VAIController upgrades required to integrate it. The Comptroller upgrade routes borrow-path pricing through DBO; the liquidation path is unchanged and continues to use the existing ResilientOracle spot price. ACM permissions are granted in a single batch via ACMCommandsAggregator (42 grants total), adding a Keeper role and Guardian-callable governance setters on top of the testnet permission set. Per-asset configs are seeded in step 13: 23 assets with isBoundedPricingEnabled = false (DBO returns (spot, spot) → no behavioural change), TRX with isBoundedPricingEnabled = true (live protection active).

For full design details and the threshold worked example, see the PR: [VenusProtocol/vips#697](https://github.com/VenusProtocol/vips/pull/697).

#### Actions

This VIP performs the following 13 actions on BNB Chain:

1. **ACMCommandsAggregator: push permission batch** — load the 42 grants for the Keeper role and Guardian-callable governance setters.
2. **Grant aggregator DEFAULT_ADMIN_ROLE** on the AccessControlManager so it can execute the grants in step 3.
3. **Execute the batched permission grants** via ACMCommandsAggregator.
4. **Revoke DEFAULT_ADMIN_ROLE** from the aggregator after execution.
5. **Upgrade Unitroller implementation** to the new Diamond-based implementation (0x82cA18785BBbacBeD1C4f482921E2B2E989D8C08).
6. **Set the new Unitroller implementation** on the Comptroller proxy.
7. **diamondCut** — apply the facet cut from vips/vip-617/utils/cut-params-bscmainnet.json.
8. **Wire new ComptrollerLens** (0x75A71Ad878f6f24616A2AE21d046C0C8E72f67F8) on the Comptroller.
9. **Upgrade VAIController implementation** to 0x8A7d8589A597619A7842d3BC284b9a5a276FaE56.
10. **Set the new VAIController implementation** on the VAIUnitroller.
11. **Accept ownership** of the deployed DeviationBoundedOracle (0xc79Cb7efEBd121DC4B39eA141C214606595D665A) by calling acceptOwnership().
12. **Wire DBO into Comptroller** — set the DBO address as the borrow-path price source.
13. **Seed per-asset configs** via setTokenConfigs on DBO with 24 entries from vips/vip-617/utils/asset-configs-bscmainnet.json — 23 with isBoundedPricingEnabled = false, TRX with isBoundedPricingEnabled = true.

#### Deployed contracts (populated prior to proposal)

- **DeviationBoundedOracle** (proxy): ${DEVIATION_BOUNDED_ORACLE}
- **ComptrollerLens**: ${COMPTROLLER_LENS}
- **VAIController implementation**: ${VAI_CONTROLLER_IMPL}
- **Unitroller implementation (new Diamond)**: ${UNITROLLER_IMPLEMENTATION}
- **Keeper**: ${KEEPER}
- **Unitroller**: ${UNITROLLER}
- **VaiUnitroller**: ${VAI_UNITROLLER}
`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Step 1 — ACM permissions (42 grants) via ACMCommandsAggregator
      //   1.1. Push the batch of grants into the aggregator
      //   1.2. Grant the aggregator DEFAULT_ADMIN_ROLE on ACM
      //   1.3. Execute the batch (aggregator calls giveCallPermission for each grant)
      //   1.4. Revoke DEFAULT_ADMIN_ROLE from the aggregator
      {
        target: BSC_ACM_AGGREGATOR,
        signature: "addGrantPermissions((address,string,address)[])",
        params: [ACM_GRANTS],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, BSC_ACM_AGGREGATOR],
      },
      {
        target: BSC_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [GRANT_PERMISSIONS_INDEX],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, BSC_ACM_AGGREGATOR],
      },

      // Step 2 — Unitroller implementation upgrade
      {
        target: UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [UNITROLLER_IMPLEMENTATION],
      },
      {
        target: UNITROLLER_IMPLEMENTATION,
        signature: "_become(address)",
        params: [UNITROLLER],
      },

      // Step 3 — diamondCut: 5 facets replaced + new `setDeviationBoundedOracle` selector added
      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [cutParams],
      },

      // Step 4 — Wire new ComptrollerLens (admin-gated; timelock is Unitroller admin)
      {
        target: UNITROLLER,
        signature: "_setComptrollerLens(address)",
        params: [COMPTROLLER_LENS],
      },

      // Step 5 — VAIController implementation upgrade
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

      // Step 6 — Accept DBO ownership (Ownable2Step handshake)
      {
        target: DEVIATION_BOUNDED_ORACLE,
        signature: "acceptOwnership()",
        params: [],
      },

      // Step 7 — Wire DBO into Comptroller (uses ACM permission granted in Step 1.4)
      {
        target: UNITROLLER,
        signature: "setDeviationBoundedOracle(address)",
        params: [DEVIATION_BOUNDED_ORACLE],
      },

      // Step 8 — Seed per-asset configs
      {
        target: DEVIATION_BOUNDED_ORACLE,
        signature: "setTokenConfigs((address,uint64,uint256,uint256,bool,bool)[])",
        params: [
          ASSET_CONFIGS.map(c => [
            c.asset,
            c.cooldownPeriod,
            c.triggerThreshold,
            c.resetThreshold,
            c.isBoundedPricingEnabled,
            c.cachingEnabled,
          ]),
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip617;
