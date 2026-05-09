import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { DEVIATION_BOUNDED_ORACLE } from "./bsctestnet";

const { bsctestnet } = NETWORK_ADDRESSES;
const { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, ACCESS_CONTROL_MANAGER } = bsctestnet;

// DBO proxy admin on BSC Testnet — owned by NormalTimelock.
export const PROXY_ADMIN = "0xef480a5654b231ff7d80A0681F938f3Db71a6Ca6";

// New DBO implementation to install behind the proxy.
export const NEW_DBO_IMPLEMENTATION = "0x90c9756446ebA9E1762811c239Fe10029019e35e";

export const TIMELOCKS = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];

// Old (multi-arg) setTokenConfig signatures granted by VIP-665 — to be revoked.
export const OLD_SET_TOKEN_CONFIG_SIGS = [
  "setTokenConfig(address,uint64,uint256,uint256,bool)",
  "setTokenConfigs(address[],uint64[],uint256[],uint256[],bool[])",
];

// New (struct-based) setTokenConfig signatures introduced by the new DBO impl.
export const NEW_SET_TOKEN_CONFIG_SIGS = [
  "setTokenConfig((address,uint64,uint256,uint256,bool,bool))",
  "setTokenConfigs((address,uint64,uint256,uint256,bool,bool)[])",
];

export const vip665Addendum = () => {
  const meta = {
    version: "v2",
    title: "VIP-665 Addendum [BNB Chain Testnet] Upgrade DeviationBoundedOracle implementation",
    description: `#### Summary

If passed, this VIP will upgrade the **DeviationBoundedOracle (DBO)** logic contract behind the proxy at \`${DEVIATION_BOUNDED_ORACLE}\` to a new implementation at \`${NEW_DBO_IMPLEMENTATION}\`, and re-align the ACM permissions for \`setTokenConfig\` / \`setTokenConfigs\` to match the new struct-based function signatures exposed by the new implementation.

The upgrade is storage-layout-compatible: existing per-asset token configs (price bounds, thresholds, cooldown, caching state) and the cache storage slots used by \`getBoundedCollateralPrice\` / \`getBoundedDebtPrice\` are preserved. No per-asset configuration is changed by this proposal.

#### Action

1. Call \`upgrade(${DEVIATION_BOUNDED_ORACLE}, ${NEW_DBO_IMPLEMENTATION})\` on the proxy admin at \`${PROXY_ADMIN}\`.
2. Revoke the previously-granted ACM permissions for the old multi-arg \`setTokenConfig(address,uint64,uint256,uint256,bool)\` and \`setTokenConfigs(address[],uint64[],uint256[],uint256[],bool[])\` for the 3 timelocks.
3. Grant ACM permissions for the new struct-based \`setTokenConfig((address,uint64,uint256,uint256,bool,bool))\` and \`setTokenConfigs((address,uint64,uint256,uint256,bool,bool)[])\` to the 3 timelocks.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // Step 1 — Upgrade DBO implementation
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [DEVIATION_BOUNDED_ORACLE, NEW_DBO_IMPLEMENTATION],
      },

      // Step 2 — Revoke old (multi-arg) setTokenConfig / setTokenConfigs permissions for 3 timelocks
      ...OLD_SET_TOKEN_CONFIG_SIGS.flatMap(sig =>
        TIMELOCKS.map(caller => ({
          target: ACCESS_CONTROL_MANAGER,
          signature: "revokeCallPermission(address,string,address)",
          params: [DEVIATION_BOUNDED_ORACLE, sig, caller],
        })),
      ),

      // Step 3 — Grant new (struct-based) setTokenConfig / setTokenConfigs permissions for 3 timelocks
      ...NEW_SET_TOKEN_CONFIG_SIGS.flatMap(sig =>
        TIMELOCKS.map(caller => ({
          target: ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [DEVIATION_BOUNDED_ORACLE, sig, caller],
        })),
      ),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip665Addendum;
