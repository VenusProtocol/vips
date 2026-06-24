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

export const vip637 = () => {
  const meta = {
    version: "v2",
    title: "VIP-637 Raise proposal threshold to 1,000,000 XVS",
    description: `#### Summary

If passed, this VIP raises the proposal threshold for every governance route (Normal, Fast-track, Critical) from 300,000 XVS to 1,000,000 XVS.

#### Description

The proposal threshold is the minimum amount of XVS voting power an account must hold to create a governance proposal. It is configured per route through \`GovernorBravoDelegate.setProposalConfigs\`.

The current \`GovernorBravoDelegate\` implementation hardcodes \`MAX_PROPOSAL_THRESHOLD = 300,000 XVS\` and \`setProposalConfigs\` reverts for any threshold above that cap. Raising the threshold therefore requires two actions, in order:

1. Upgrade the \`GovernorBravo\` implementation to a new \`GovernorBravoDelegate\` that sets \`MAX_PROPOSAL_THRESHOLD = 1,000,000 XVS\` and \`quorumVotes = 1,500,000 XVS\`. Only constants change, the storage layout is unchanged.
2. Update the proposal configs for all three routes, raising the proposal threshold to 1,000,000 XVS while keeping the existing voting delays and voting periods.

#### Security and additional considerations

- The implementation change is storage-safe: only the \`MAX_PROPOSAL_THRESHOLD\` and \`quorumVotes\` constants are modified, no storage variable is added, removed, or reordered.
- Voting delays and voting periods are preserved exactly as currently configured on-chain.
- The quorum (\`quorumVotes\`) is raised from 600,000 XVS to 1,500,000 XVS as part of the implementation upgrade.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/PENDING)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
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

export default vip637;
