import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const FIXED_RATE_VAULT_CONTROLLER = "0xf77dED2A00F94e33C392126238360D4642c16Ba2";
export const OLD_VAULT_IMPLEMENTATION = "0x97421799419Eb782628e73e7220d8E0A207469a3";

// Adds depositWithConsent / mintWithConsent.
export const NEW_VAULT_IMPLEMENTATION = "0xB677627eB4B9D8bfB793966e266C899E7FD484C5";

export const vip644 = () => {
  const meta = {
    version: "v2",
    title: "VIP-644 [BNB Chain Testnet] Upgrade Institutional Fixed Rate Vault implementation (consent recording)",
    description: `#### Summary

If passed, this VIP points the Institutional Fixed Rate Vault controller at a new vault clone-source implementation that adds on-chain disclaimer-consent recording to the supplier deposit/mint flow.

#### Description

The \`InstitutionalLoanVault\` implementation used by the controller (${FIXED_RATE_VAULT_CONTROLLER}) to clone new vaults is upgraded from ${OLD_VAULT_IMPLEMENTATION} to ${NEW_VAULT_IMPLEMENTATION}. The new implementation adds two supplier entrypoints:

- \`depositWithConsent(uint256 assets, address receiver, bytes32 consentHash)\` — a thin wrapper over ERC-4626 \`deposit\` that emits \`ConsentRecorded(supplier, receiver, consentHash)\`.
- \`mintWithConsent(uint256 shares, address receiver, bytes32 consentHash)\` — a thin wrapper over ERC-4626 \`mint\` that emits the same event.

The consent hash is optional: passing \`bytes32(0)\` skips the event and deposits/mints as usual. The plain \`deposit\`/\`mint\` entrypoints are unchanged. Existing vaults are immutable clones and are not modified; the change applies to vaults created from now on.

#### Actions

- Point the controller at the new vault implementation via \`setVaultImplementation(${NEW_VAULT_IMPLEMENTATION})\`.

#### Voting options

- **For** — Execute the proposal
- **Against** — Do not execute the proposal
- **Abstain** — Indifferent to execution`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: FIXED_RATE_VAULT_CONTROLLER,
        signature: "setVaultImplementation(address)",
        params: [NEW_VAULT_IMPLEMENTATION],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip644;
