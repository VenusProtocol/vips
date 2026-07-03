import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// VIP-665 addendum (VPD-1488) — re-upgrade the InstitutionalVaultController on BNB testnet to a new
// implementation that can clear a previously set institution-name override (setInstitutionNameOverride
// now accepts an empty string; the old implementation reverted, so a mistaken override could never be
// undone). This only re-points the proxy; VIP-665's ACM permissions and vault implementation stay untouched.

export const INSTITUTIONAL_VAULT_CONTROLLER = "0xf77dED2A00F94e33C392126238360D4642c16Ba2";
export const PROXY_ADMIN = "0x7877fFd62649b6A1557B55D4c20fcBaB17344C91";

// VIP-665 controller impl -> new controller impl that can clear an override.
export const OLD_CONTROLLER_IMPLEMENTATION = "0xEb8Ca841cBe1BC4832A10b15c7dAB1081eDaD371";
export const NEW_CONTROLLER_IMPLEMENTATION = "0xC36dFaCc7a125859C106F29b9F2d874CCF29A55A";

export const vip665Addendum = () => {
  const meta = {
    version: "v2",
    title:
      "VIP-665 Addendum [BNB Chain Testnet] Institutional Fixed Rate Vault controller re-upgrade (allow clearing institution-name overrides)",
    description: `#### Summary

Addendum to VIP-665. This VIP re-upgrades the \`InstitutionalVaultController\` proxy on BNB Chain Testnet to a
new implementation that can clear a previously set institution-name override: \`setInstitutionNameOverride\` now
accepts an empty string to remove an override and fall back to the vault's on-chain name (previously it reverted,
so a mistaken override could not be undone).

This is a controller-only change with no signature changes. It only re-points the proxy via the \`ProxyAdmin\`;
the ACM permissions and vault implementation from VIP-665 are unchanged.

#### Upgrade details

| Contract | Proxy | Old implementation | New implementation |
|---|---|---|---|
| InstitutionalVaultController | ${INSTITUTIONAL_VAULT_CONTROLLER} | ${OLD_CONTROLLER_IMPLEMENTATION} | ${NEW_CONTROLLER_IMPLEMENTATION} |

- **ProxyAdmin**: ${PROXY_ADMIN}`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Re-point the InstitutionalVaultController proxy at the new implementation.
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [INSTITUTIONAL_VAULT_CONTROLLER, NEW_CONTROLLER_IMPLEMENTATION],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip665Addendum;
