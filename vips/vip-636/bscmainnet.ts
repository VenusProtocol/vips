import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const GOVERNANCE_BRAVO = "0x2d56dC077072B53571b8252008C60e945108c75a";

// New GovernorBravoDelegate implementation: MAX_PROPOSAL_THRESHOLD raised to 1,000,000 XVS
// and quorumVotes raised to 1,500,000 XVS.
export const NEW_BRAVO_IMPL = "0x9975d7064e40D16E1B76B90e56F606D72B385701";

// New proposal threshold for every route. The current implementation caps this at
// MAX_PROPOSAL_THRESHOLD (300,000 XVS), so the implementation upgrade must execute first.
export const PROPOSAL_THRESHOLD = parseUnits("1000000", 18);

// quorumVotes is a constant baked into the implementation. Upgrading the implementation
// raises it from 600,000 XVS to 1,500,000 XVS; no separate call is required.
export const OLD_QUORUM_VOTES = parseUnits("600000", 18);
// Quorum set to 1.5x the new 1,000,000 XVS proposal threshold so quorum stays above
// what a single proposer can supply, preserving meaningful multi-voter consensus.
export const NEW_QUORUM_VOTES = parseUnits("1500000", 18);

// Current on-chain voting params (preserved). Only proposalThreshold changes.
// struct order: [votingDelay, votingPeriod, proposalThreshold]
export const NT_VOTING_DELAY = 1;
export const NT_VOTING_PERIOD = 192384;

export const FT_VOTING_DELAY = 1;
export const FT_VOTING_PERIOD = 192384;

export const CT_VOTING_DELAY = 1;
export const CT_VOTING_PERIOD = 48096;

export const PROPOSAL_CONFIGS = [
  [NT_VOTING_DELAY, NT_VOTING_PERIOD, PROPOSAL_THRESHOLD], // REGULAR
  [FT_VOTING_DELAY, FT_VOTING_PERIOD, PROPOSAL_THRESHOLD], // FASTTRACK
  [CT_VOTING_DELAY, CT_VOTING_PERIOD, PROPOSAL_THRESHOLD], // CRITICAL
];

export const vip636 = () => {
  const meta = {
    version: "v2",
    title: "VIP-636 Raise VIP Proposal Threshold to 1,000,000 XVS",
    description: `## Summary

If passed, this VIP raises the proposal threshold for every governance route (Normal, Fast-track, Critical) from **300,000 XVS to 1,000,000 XVS**, and raises the governance quorum from **600,000 XVS to 1,500,000 XVS**.

## Description

The proposal threshold is the minimum amount of XVS voting power an account must hold to create a governance proposal, configured per route through \`GovernorBravoDelegate.setProposalConfigs\`. The current \`GovernorBravoDelegate\` implementation hardcodes \`MAX_PROPOSAL_THRESHOLD = 300,000 XVS\` and reverts for any threshold above that cap, so raising the threshold requires upgrading the implementation first and then updating the proposal configs. The implementation change is storage-safe — only the \`MAX_PROPOSAL_THRESHOLD\` and \`quorumVotes\` constants are modified, with no storage variable added, removed, or reordered — and the quorum is raised from 600,000 XVS to 1,500,000 XVS as part of that upgrade. Voting delays and voting periods are preserved exactly as currently configured on all three routes.

## Actions

This VIP performs the following 2 actions on BNB Chain:

1. **Upgrade the governance implementation** — Calls \`_setImplementation(address)\` on \`GovernorBravo\` (\`${GOVERNANCE_BRAVO}\`), pointing it to the new \`GovernorBravoDelegate\` (\`${NEW_BRAVO_IMPL}\`), which sets \`MAX_PROPOSAL_THRESHOLD = 1,000,000 XVS\` and \`quorumVotes = 1,500,000 XVS\`.
2. **Update proposal configs** — Calls \`setProposalConfigs((uint256,uint256,uint256)[])\` on \`GovernorBravo\` (\`${GOVERNANCE_BRAVO}\`), raising the proposal threshold to 1,000,000 XVS on the Normal, Fast-track, and Critical routes while preserving the existing voting delays and voting periods.

## Voting options

- **For** — Execute the proposal
- **Against** — Do not execute the proposal
- **Abstain** — Indifferent to execution`,
    forDescription: "Execute the proposal",
    againstDescription: "Do not execute the proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // 1. Point GovernorBravo to the new implementation (raises MAX_PROPOSAL_THRESHOLD).
      {
        target: GOVERNANCE_BRAVO,
        signature: "_setImplementation(address)",
        params: [NEW_BRAVO_IMPL],
      },
      // 2. Raise the proposal threshold for every route.
      {
        target: GOVERNANCE_BRAVO,
        signature: "setProposalConfigs((uint256,uint256,uint256)[])",
        params: [PROPOSAL_CONFIGS],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip636;
