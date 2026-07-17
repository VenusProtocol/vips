import { Command, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { LZ_CHAIN_ID, RemoteChain } from "./data/addresses";
import {
  AGGREGATOR,
  Chain,
  DEFAULT_ADMIN_ROLE,
  GRANT_INDEX,
  REVOKE_INDICES,
  acmOf,
  buildGrantPermissions,
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
  for (const revokeIndex of REVOKE_INDICES[chain])
    commands.push({
      target: agg,
      signature: "executeRevokePermissions(uint256)",
      params: [revokeIndex],
      ...route,
    });
  commands.push({ target: acm, signature: "revokeRole(bytes32,address)", params: [DEFAULT_ADMIN_ROLE, agg], ...route });
  return commands;
};

const meta = {
  version: "v2",
  title: "VIP-645 [Multi-Chain] Remove all CriticalTimelock Privileges",
  description: `#### Summary

This proposal revokes every permission the CriticalTimelock holds across all eight Venus mainnets — including its emergency pause powers — leaving it with zero privileges and no permission moved to a Guardian, and additionally cleans up dangling, redundant and non-standard permission grants on the AccessControlManager (ACM). Refer to the community post for the full background and rationale.

#### Actions

On each of the eight chains the proposal executes the following sequence through that chain's ACMCommandsAggregator:

1. **Grant aggregator admin** — Calls grantRole(DEFAULT_ADMIN_ROLE, aggregator) on the chain's AccessControlManager.
2. **Execute grant batch** — Calls executeGrantPermissions(index) on the aggregator (remote chains only; applies the wildcard syncCash() grant to the NormalTimelock).
3. **Execute revoke batch** — Calls executeRevokePermissions(index) on the aggregator, revoking all CriticalTimelock permissions plus the redundant and stale grants for that chain.
4. **Revoke aggregator admin** — Calls revokeRole(DEFAULT_ADMIN_ROLE, aggregator) on the AccessControlManager.

ACMCommandsAggregator addresses:

- BNB Chain — 0x8b443Ea6726E56DF4C4F62f80F0556bB9B2a7c64
- Ethereum — 0xb78772bed6995551b64e54Cdb8e09800d86C73ee
- Arbitrum One — 0x74AFeA28456a683b8fF907699Ff77138edef00f3
- Base — 0xB2770DBD5146f7ee0766Dc9E3931433bb697Aa06
- zkSync Era — 0x88B1452e512c8fcf83889DdCfe54dF37D561Db82
- OP Mainnet — 0xbbEBaF646e7a3E4064a899e68565B1b439eFdf70
- Unichain — 0x904D11b00bdB2740d16176cc00DE139d0d626115
- opBNB — 0x6dB5e303289fea2E83F7d442470210045592AD93

On BNB Chain, the proposal additionally issues direct ACM.revokeRole calls on the AccessControlManager (0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555) to clear the CriticalTimelock's legacy 32-byte wildcard grants and the retired contracts' wildcard grants, which the aggregator cannot reach.

Expected ACM event counts per chain (RoleGranted / RoleRevoked): BNB Chain 1 / 279, Ethereum 2 / 136, Arbitrum One 2 / 122, Base 2 / 95, zkSync Era 2 / 81, OP Mainnet 2 / 74, Unichain 2 / 74, opBNB 2 / 56.

The complete per-contract, per-chain list of every permission granted and revoked is in the GitHub pull request: [https://github.com/VenusProtocol/vips/pull/740](https://github.com/VenusProtocol/vips/pull/740)

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

export const vip645 = () =>
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

export default vip645;
