import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { HUB_REGISTRY, HUB_REGISTRY_IMPL, HUB_REGISTRY_PROXY_ADMIN } from "./addresses";

// ---------------------------------------------------------------------------------------------------
// VIP-680 [BNB Chain Testnet] — HubRegistry implementation upgrade (adds `assetForHub`).
//
// A standalone proposal (independent of the Liquidity Hub onboarding proposals in this folder). It
// upgrades the HubRegistry proxy to the implementation that exposes `assetForHub(hub)` — the reverse of
// `hubForAsset`, so indexers / FE / BE can resolve a Hub's registered asset in one call.
//
// The upgrade goes through the HubRegistry's ProxyAdmin, which is single-step `Ownable` already owned by
// the Normal Timelock (transferred at deploy), so this Normal-Timelock proposal can call it directly.
// The new implementation is append-only (adds one `view`, no new storage), so a plain `upgrade` — not
// `upgradeAndCall` — is correct and preserves all registry storage.
// ---------------------------------------------------------------------------------------------------

export const vip680HubRegistryUpgrade = () => {
  const meta = {
    version: "v2",
    title: "VIP-680 [BNB Chain Testnet] HubRegistry — upgrade to expose assetForHub",
    description: `#### Summary

Upgrades the Liquidity Hub **HubRegistry** proxy to a new implementation that adds the
\`assetForHub(hub)\` reverse getter (the inverse of \`hubForAsset\`). It returns the asset a Hub is
registered under (\`address(0)\` if not registered), giving indexers, front-end and back-end a single
authoritative call for the Hub → asset direction.

#### Actions

1. Via the Normal-Timelock-owned ProxyAdmin, \`upgrade\` the HubRegistry proxy to the new implementation.

#### Notes

- Append-only change (one \`view\` function, no new storage), so a plain \`upgrade\` preserves every
  registry mapping and the enumeration; no reinitializer is required.
- The ProxyAdmin is single-step \`Ownable\`, already owned by the Normal Timelock, so no ownership
  handoff is needed here.
- Testnet-only. The Hub is not yet deployed on any mainnet.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: HUB_REGISTRY_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [HUB_REGISTRY, HUB_REGISTRY_IMPL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip680HubRegistryUpgrade;
