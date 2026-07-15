import { Command, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { LZ_CHAIN_ID, RemoteChain } from "./data/addresses";
import {
  AGGREGATOR,
  Chain,
  DEFAULT_ADMIN_ROLE,
  GRANT_INDEX,
  REVOKE_INDEX,
  acmOf,
  buildGrantPermissions,
  buildRevokePermissions,
  legacyWildcardCommands,
} from "./utils/commands";

// Expected RoleGranted / RoleRevoked counts per chain, asserted by the simulations after execution.
export const EXPECTED_ROLE_EVENTS: Record<"bscmainnet" | RemoteChain, { granted: number; revoked: number }> = {
  bscmainnet: { granted: 1, revoked: 279 },
  ethereum: { granted: 2, revoked: 136 },
  arbitrumone: { granted: 2, revoked: 122 },
  basemainnet: { granted: 2, revoked: 95 },
  zksyncmainnet: { granted: 2, revoked: 81 },
  opmainnet: { granted: 2, revoked: 74 },
  unichainmainnet: { granted: 2, revoked: 74 },
  opbnbmainnet: { granted: 2, revoked: 56 },
};

// The commands the VIP emits per chain: grant the aggregator DEFAULT_ADMIN_ROLE, execute the grant and/or
// revoke batch, revoke the role. Local on BNB; wrapped with dstChainId (LayerZero) on remotes.
const aggregatorCommands = (chain: Chain): Command[] => {
  const acm = acmOf(chain);
  const agg = AGGREGATOR[chain];
  const route = chain === "bscmainnet" ? {} : { dstChainId: LZ_CHAIN_ID[chain as RemoteChain] };
  const commands: Command[] = [
    { target: acm, signature: "grantRole(bytes32,address)", params: [DEFAULT_ADMIN_ROLE, agg], ...route },
  ];
  if (buildGrantPermissions(chain).length > 0)
    commands.push({
      target: agg,
      signature: "executeGrantPermissions(uint256)",
      params: [GRANT_INDEX[chain]],
      ...route,
    });
  if (buildRevokePermissions(chain).length > 0)
    commands.push({
      target: agg,
      signature: "executeRevokePermissions(uint256)",
      params: [REVOKE_INDEX[chain]],
      ...route,
    });
  commands.push({ target: acm, signature: "revokeRole(bytes32,address)", params: [DEFAULT_ADMIN_ROLE, agg], ...route });
  return commands;
};

const meta = {
  version: "v2",
  title: "VIP-665 [Multi-Chain] Remove all CriticalTimelock privileges",
  description: `#### Summary

This proposal hardens governance by removing every permission the CriticalTimelock holds on all eight mainnets, leaving it with zero privileges. No permission is moved to a Guardian. It also cleans up dangling permissions left on removed setters and retired contracts, removes redundant per-contract grants that are already covered by an identical wildcard grant, and normalizes the \`syncCash()\` permission on every remote chain to the wildcard convention used by all other vToken setters.

#### Description

A proposal routed through the Critical route executes in roughly 7 hours on BNB Chain and 8 hours on remote chains once voting, queue and timelock delays are counted. To eliminate that fast-path attack surface entirely, this VIP revokes every permission the CriticalTimelock currently holds across BNB Chain, Ethereum, Arbitrum One, Base, zkSync Era, OP Mainnet, Unichain and opBNB — including emergency pause powers. The full per-contract, per-chain list of permissions revoked is in the accompanying community post and the pull request.

Actions per chain: revoke every CriticalTimelock permission (no Guardian is granted anything), and revoke redundant per-contract grants that are already shadowed by an identical wildcard grant (behavior-preserving). On BNB Chain, additionally revoke dangling grants on removed setters and retired contracts from every current holder (including the deprecated BUSDLiquidator and the retired SetCheckpoint deploy contracts). On each remote chain, grant \`syncCash()\` on the wildcard target (address(0)) to the NormalTimelock and revoke the per-market \`syncCash()\` grants it currently holds.

#### Execution model

To keep the whole change in one proposal within the BNB Chain per-transaction gas limit, every chain is executed through its pre-seeded ACMCommandsAggregator. For each chain the proposal grants the aggregator the ACM DEFAULT_ADMIN_ROLE, calls executeGrantPermissions and/or executeRevokePermissions by batch index, and revokes the role — all in the same proposal. Each batch contains only the giveCallPermission / revokeCallPermission calls for that chain. The CriticalTimelock's wildcard grants on the legacy BNB ACM — together with the retired contracts' wildcard grants (the RetiredRiskSteward cap setters and the SetCheckpoint interest-rate-model deploy contracts) — are cleared with direct ACM.revokeRole calls, which the aggregator cannot reach.

#### Security and additional considerations

- **Scoped privilege**: the aggregator's DEFAULT_ADMIN_ROLE grant is scoped to this proposal — granted, used once, and revoked in the same transaction sequence, per chain.
- **VIP execution simulation**: validated in a fork environment that the CriticalTimelock is left holding no permission on any chain, that the cleanup grants are removed, that Guardians receive no new permission, and that the expected ACM events fire.
- **Cross-chain payload size**: each LayerZero message carries only 4 commands (grant the aggregator the ACM role, execute the grant batch, execute the revoke batch, revoke the role), well under the Relayer cap.

#### Voting options

- **For** — Execute the proposal
- **Against** — Do not execute the proposal
- **Abstain** — Indifferent to execution`,
  forDescription: "I agree that Venus Protocol should proceed with this proposal",
  againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
  abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
};

export const vip665 = () =>
  makeProposal(
    [
      ...aggregatorCommands("bscmainnet"),
      ...legacyWildcardCommands(),
      ...aggregatorCommands("ethereum"),
      ...aggregatorCommands("arbitrumone"),
      ...aggregatorCommands("basemainnet"),
      ...aggregatorCommands("zksyncmainnet"),
      ...aggregatorCommands("opmainnet"),
      ...aggregatorCommands("unichainmainnet"),
      ...aggregatorCommands("opbnbmainnet"),
    ],
    meta,
    ProposalType.REGULAR,
  );

export default vip665;
