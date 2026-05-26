import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ACM = NETWORK_ADDRESSES.bscmainnet.ACCESS_CONTROL_MANAGER;

export const vip625 = () => {
  const meta = {
    version: "v2",
    title: "VIP-625 [SNAPSHOT] Venus Tokenomics Phase II — Prime Rewards Redesign",
    description: `#### Summary

Please note that this is an empty VIP and serves as a snapshot vote to quantify the Venus community's response to a proposed change. As a reminder, the Snapshot.box account belonging to Venus is no longer in use — any new updates to that page should be ignored. Refer to official channels only for information on Venus Protocol.

#### Description

A community post was shared on proposed changes to the Venus Prime program, receiving mixed reactions from the Venus community. Having expressed our viewpoint and responding in a comment to the sentiment of the community, we have seen mixed reactions. This empty VIP serves as a snapshot for us to better quantify the perspective of the Venus community. If you have not seen the original community post, you may refer to it here: [https://community.venus.io/t/venus-tokenomics-phase-ii-prime-rewards-redesign/5774](https://community.venus.io/t/venus-tokenomics-phase-ii-prime-rewards-redesign/5774)

Our response to common community concerns is in the comment here: [https://community.venus.io/t/venus-tokenomics-phase-ii-prime-rewards-redesign/5774/18?u=0xshyu](https://community.venus.io/t/venus-tokenomics-phase-ii-prime-rewards-redesign/5774/18?u=0xshyu)

We encourage all community members to participate in this voting to give us a clear understanding of the current sentiment on this proposed change.

#### Voting options

- **For** — Supportive of the proposed update
- **Against** — Not supportive of the proposed update
- **Abstain** — Indifferent to the proposed update

#### Proposed Changes

This is a signaling-only proposal. GovernorBravo requires every proposal to include at least one on-chain action, so this VIP includes a single no-op view call (AccessControlManager.DEFAULT_ADMIN_ROLE()) which performs no state change. The intent is purely to record on-chain voting sentiment.`,
    forDescription: "I support the proposed Venus Prime rewards redesign",
    againstDescription: "I do not support the proposed Venus Prime rewards redesign",
    abstainDescription: "I am indifferent to the proposed Venus Prime rewards redesign",
  };

  return makeProposal(
    [
      // No-op: pure-getter call on ACM. GovernorBravo requires targets.length != 0;
      // DEFAULT_ADMIN_ROLE() satisfies that without changing state (returns bytes32(0)).
      { target: ACM, signature: "DEFAULT_ADMIN_ROLE()", params: [] },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip625;
