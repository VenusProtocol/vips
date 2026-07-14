import { Command, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { LZ_CHAIN_ID, RemoteChain } from "./data/remote";
import {
  AGGREGATOR,
  Chain,
  DEFAULT_ADMIN_ROLE,
  GRANT_INDEX,
  REVOKE_INDEX,
  acmOf,
  grantPermissions,
  revokePermissions,
} from "./utils/commands";

// The commands the VIP emits per chain: grant the aggregator DEFAULT_ADMIN_ROLE, execute the grant and/or
// revoke batch, revoke the role. Local on BNB; wrapped with dstChainId (LayerZero) on remotes.
const aggregatorCommands = (chain: Chain): Command[] => {
  const acm = acmOf(chain);
  const agg = AGGREGATOR[chain];
  const route = chain === "bscmainnet" ? {} : { dstChainId: LZ_CHAIN_ID[chain as RemoteChain] };
  const commands: Command[] = [
    { target: acm, signature: "grantRole(bytes32,address)", params: [DEFAULT_ADMIN_ROLE, agg], ...route },
  ];
  if (grantPermissions(chain).length > 0)
    commands.push({
      target: agg,
      signature: "executeGrantPermissions(uint256)",
      params: [GRANT_INDEX[chain]],
      ...route,
    });
  if (revokePermissions(chain).length > 0)
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
  title: "VIP-665 [Multi-Chain] Reduce CriticalTimelock privileges",
  description: `#### Summary

This proposal hardens governance by removing high-severity powers from the CriticalTimelock on every mainnet, and — for a small set of BNB Chain functions where a Guardian multisig does not already hold them — moving them to the Guardian. It also cleans up dangling permissions left on removed setters and retired contracts.

#### Description

A proposal routed through the Critical route executes in roughly 7 hours on BNB Chain and 8 hours on remote chains once voting, queue and timelock delays are counted. To shrink that fast-path attack surface, this VIP takes the high-severity powers off the CriticalTimelock across BNB Chain, Ethereum, Arbitrum One, Base, zkSync Era, OP Mainnet, Unichain and opBNB. The full per-contract, per-chain list of permissions changed is in the accompanying community post and the pull request.

Actions per chain: revoke the listed permissions from the CriticalTimelock; on BNB Chain, grant a few functions to Guardian 1 (swap) and grant one to Guardian 1 while keeping Critical (add); and revoke dangling grants on removed setters and retired contracts from every current holder.

#### Execution model

To keep the whole change in one proposal within the BNB Chain per-transaction gas limit, every chain is executed through its pre-seeded ACMCommandsAggregator. For each chain the proposal grants the aggregator the ACM DEFAULT_ADMIN_ROLE, calls executeGrantPermissions and/or executeRevokePermissions by batch index, and revokes the role — all in the same proposal. Each batch contains only the giveCallPermission / revokeCallPermission calls for that chain.

#### Security and additional considerations

- **Scoped privilege**: the aggregator's DEFAULT_ADMIN_ROLE grant is scoped to this proposal — granted, used once, and revoked in the same transaction sequence, per chain.
- **VIP execution simulation**: validated in a fork environment that every listed permission moved as intended (revoke / swap / grant), that "No change" permissions are untouched, and that the expected ACM events fire.
- **Cross-chain payload size**: each LayerZero message carries only 3 commands, well under the Relayer cap.

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
