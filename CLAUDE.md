# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Venus Protocol VIP (Venus Improvement Proposal) simulation repository. Manages governance proposals across 14+ EVM networks (BSC, Ethereum, Arbitrum, Optimism, Base, Unichain, ZkSync, opBNB). Uses Hardhat + TypeScript + Yarn 3.

## Common Commands

```bash
yarn install                  # Install dependencies
yarn compile                  # Compile contracts (regular + zksync)
yarn build                    # Full build (tsc + hardhat compile + copy artifacts)
yarn test                     # Run all tests
yarn lint                     # ESLint + Prettier check
yarn prettier                 # Auto-format code
```

### Running Simulations

```bash
# Single VIP simulation (requires --fork)
npx hardhat test simulations/<vip-path>/simulations.ts --fork bscmainnet

# zkSync simulation: runs against a local anvil-zksync fork, not --fork alone (README: "Run Simulations for ZKSync")
yarn local-anvil-node:zksyncmainnet --fork-block-number <block-number>   # separate terminal, fresh for every run
npx hardhat test simulations/<vip-path>/zksyncmainnet.ts --network zksynctestnode --fork zksyncmainnet --config hardhat.config.zksync.ts

# Multisig simulation
npx hardhat test multisig/simulations/<network>/<vip-path>/index.ts --fork <network>

# Type checking only
yarn tsc --noEmit
```

### Proposing and Executing

```bash
npx hardhat propose <path-relative-to-vips/> --network bscmainnet
npx hardhat seedAggregatorBatches <path-relative-to-vips/> --network bscmainnet
npx hardhat proposeOnTestnet <path-relative-to-vips/> --network bsctestnet
npx hardhat createProposal --network <networkName>
npx hardhat multisig <path-relative-to-multisig/proposals/> --network <network>
npx hardhat safeTxData <path-relative-to-multisig/proposals/> --network <network>
```

## Architecture

### VIP Lifecycle

1. Write VIP file in `vips/` exporting a default function that returns a `Proposal`
2. Write simulation tests in `simulations/` using `forking()` + `testVip()`
3. Propose via Hardhat tasks, vote through governance, execute after timelock delay

### Core Types (src/types.ts)

- **`Command`**: Single contract call — `{ target, signature, params, value?, dstChainId?, aclSignature? }`
- **`Proposal`**: Array of targets/signatures/params/values built from Commands
- **`ProposalType`**: `REGULAR` (0), `FAST_TRACK` (1), `CRITICAL` (2) — different timelock delays
- **`LzChainId`**: LayerZero chain IDs for cross-chain proposals

### Key Utility: `makeProposal()` (src/utils.ts)

Converts an array of `Command` objects into a `Proposal`. Automatically handles cross-chain routing: commands with `dstChainId` are bundled into LayerZero omnichain execution calls via `OmnichainProposalSender`.

### Aggregator Batches: `batch()` (src/auxiliaryCommandsAggregator.ts)

A REGULAR proposal that would exceed the propose gas cap, the 100-operation cap or the LayerZero payload cap can wrap commands in `batch([...])` on any chain with an `AUXILIARY_COMMANDS_AGGREGATOR` in `NETWORK_ADDRESSES`. Building reads that chain's aggregator, which must be the upgraded one (it has `getBatchCount()`); an older one fails the build. Its ABI (`src/vip-framework/abi/`) and the unit-test fixture (`tests/fixtures/`) come from the same governance-contracts build, so regenerate them together.

- **What it builds:** `batch()` is one proposal entry, not a spread: `makeProposal([normalCommand, batch([commandA, commandB])], meta, ProposalType.REGULAR)`. Each `batch()` becomes one aggregator batch, executed by `executeBatch(index)` in its place; the other commands stay as written. Each `executeBatch` is wrapped in its own `grantRole(DEFAULT_ADMIN_ROLE, aggregator)` … `revokeRole(...)`, so the aggregator holds the role only while that batch runs. Use one `batch()` per chain per VIP: a second one repeats the grant and revoke commands byte for byte, and the Timelock refuses an identical command already queued at the same eta.
- **What goes in:** one chain's commands, at least one, no nested batches, no value. Batched calls run as the aggregator, not the timelock, so keep owner-only calls, `acceptOwnership()` and calls on the caller's own balance, allowance or votes out of it. Every target must have code or `addBatch` reverts with `InvalidTarget`.
- **Permissions:** each batch starts with `giveCallPermission` for every distinct target and signature it calls and ends with the matching `revokeCallPermission`; calls on the ACM itself need no grant. `aclSignature` on a command replaces `signature` in the grant when the target checks a different string.
- **Call format:** by default each call is stored as its signature plus ABI-encoded arguments, readable on chain. `batch(commands, { raw: true })` stores every call, grants and revokes included, as full calldata with an empty signature: fewer bytes and cheaper seeding, but no function names on chain.
- **Size:** a batch must fit one `addBatch` transaction. An oversized one reverts when seeded, in simulation setup (which sends it under the chain's per-tx gas cap, or the block gas limit where none is configured) or in `seedAggregatorBatches`. Use `raw: true`, move the oversized command out, or split the VIP.
- **Indices:** a batch runs once, so an unpinned batch takes the chain's next free index and an index whose batch already ran is refused. `{ seededIndex }` pins a batch to an index that already holds its calls (keep `raw: true` when pinning a raw batch). `{ expectedIndex }` seeds at that index, which must be the chain's next free one unless the batch is already seeded there.
- **Simulations:** `makeProposal()` reads only the forked chain's aggregator and resolves indices without seeding. `testVip` and `testForkedNetworkVipCommands` seed the forked chain's unseeded batches in test setup. Pass `{ seedProposalBatches: false }` and call `seedProposalBatchesOnFork(proposal)` (exported from `src/vip-framework`) to seed yourself, for example before building a second unpinned proposal on the same fork, since two unseeded builds take the same index. Pinned batches must already be seeded at the fork block. After execution the tests check that every batch ran and the aggregator holds no role or permission. On BNB Chain a failing batch is replayed call by call to name the failing call.
- **Proposing:** `propose`, `createProposal` and `proposeOnTestnet` refuse a proposal with an unseeded batch (`BATCH_NOT_SEEDED`) or one built without reading its chain (`batches were not read`): build against a live network, e.g. `--network bscmainnet`. Among the testnets only `bsctestnet` has an aggregator address, so `batch()` builds on the mainnets and `bsctestnet`.
- **Seeding:** after final review, run `npx hardhat seedAggregatorBatches <path> --network bscmainnet`. It signs with `AGGREGATOR_BATCHER_PRIVATE_KEY` over each chain's `ARCHIVE_NODE_<network>`, seeds every unpinned batch, and prints each chain's indices in VIP order, e.g. `{"bscmainnet":[5,6]}`. Pin each batch with `seededIndex` and move the sims' fork blocks past the seeding; a second run seeds any still-unpinned batch again.

### VIP File Pattern

```typescript
// vips/vip-NNN.ts
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vipNNN = () => {
  const meta = {
    version: "v2",
    title: "...",
    description: "...",
    forDescription: "...",
    againstDescription: "...",
    abstainDescription: "...",
  };
  return makeProposal(
    [
      { target: "0x...", signature: "functionName(type1,type2)", params: [arg1, arg2] },
      // Cross-chain command:
      { target: "0x...", signature: "functionName(type)", params: [arg], dstChainId: LzChainId.ethereum },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vipNNN;
```

### Simulation File Pattern

```typescript
// simulations/vip-NNN/simulations.ts
import { forking, testVip } from "src/vip-framework";

import { vipNNN } from "../../vips/vip-NNN";

forking(BLOCK_NUMBER, async () => {
  describe("Pre-VIP behavior", () => {
    /* assert current state */
  });
  testVip("VIP-NNN Description", await vipNNN());
  describe("Post-VIP behavior", () => {
    /* assert state changes */
  });
});
```

For remote (non-BSC) chain simulations, use `testForkedNetworkVipCommands` instead of `testVip`.

### Multisig Proposals

Located in `multisig/proposals/<network>/vip-NNN/index.ts`. Same `makeProposal` pattern but executed through Gnosis Safe rather than governance. Simulations in `multisig/simulations/<network>/vip-NNN/index.ts`.

### Directory Layout

- `vips/` — VIP proposal definitions (default export returns `Proposal`)
- `simulations/` — Fork-based simulation tests for each VIP
- `multisig/proposals/` — Multisig proposals organized by network
- `multisig/simulations/` — Multisig simulation tests by network
- `src/` — Shared framework code:
  - `utils.ts` — `makeProposal()`, `initMainnetUser()`, `setForkBlock()`, helpers
  - `vip-framework/index.ts` — `forking()`, `testVip()`, `testForkedNetworkVipCommands()`
  - `vip-framework/checks/` — Reusable validation functions
  - `types.ts` — Core type definitions
  - `networkAddresses.ts` — Per-network contract addresses (`NETWORK_ADDRESSES`)
  - `networkConfig.ts` — Per-network timelock delay configs
  - `transactions.ts` — Transaction building utilities

### Supported Networks

Mainnets: `bscmainnet`, `ethereum`, `arbitrumone`, `opmainnet`, `opbnbmainnet`, `zksyncmainnet`, `basemainnet`, `unichainmainnet`

Testnets: `bsctestnet`, `sepolia`, `arbitrumsepolia`, `opsepolia`, `opbnbtestnet`, `zksyncsepolia`, `basesepolia`, `unichainsepolia`

### Cross-Chain Governance

BSC is the governance hub. Commands targeting other chains use `dstChainId` (LayerZero chain ID) to route through `OmnichainProposalSender` on BSC to `OmnichainGovernanceExecutor` on the destination chain.

## VIP Governance Process

### VIP Types

| Type           | Voting Period | Execution Delay | Cross-chain Extra Delay | Use Case                 |
| -------------- | ------------- | --------------- | ----------------------- | ------------------------ |
| **Normal**     | 24h           | 48h             | +48h                    | Regular proposals        |
| **Fast-track** | 24h           | 6h              | +6h                     | Semi-urgent adjustments  |
| **Critical**   | 6h            | 1h              | +1h                     | Emergency security fixes |

### Timeline Estimates

| Scenario               | Pre-work | On-chain | Total        |
| ---------------------- | -------- | -------- | ------------ |
| **BSC Normal**         | 2-3 days | 3 days   | **5-6 days** |
| **Cross-chain Normal** | 2-3 days | 5 days   | **7-8 days** |
| **Critical**           | varies   | ~7h      | faster       |

### Full Workflow

**Phase 1: Pre-work (~2-3 days)** — Requirements → Implementation → Code Review (n+2) → Community Post → Multisig Propose

**Phase 2: On-chain Governance (~3 days BSC)** — Voting → Timelock delay → Execution

### VIP Review Checklist

- [ ] New contracts: implementation verified on-chain, source code matches repo
- [ ] Existing contracts: address matches `deployed-contracts` in [venus-protocol-documentation](https://github.com/VenusProtocol/venus-protocol-documentation)
- [ ] Function signatures match contract ABI
- [ ] Numeric values verified independently
- [ ] Pending owner is correct (usually timelock)
- [ ] Simulation passes locally: `npx hardhat test simulations/vip-XXX/<network>.ts --fork <network>`

### On-Chain Verification

```bash
# Fetch contract source (Etherscan V2 API, key in .env as ETHERSCAN_V2_API_KEY)
curl "https://api.etherscan.io/v2/api?chainid={chainid}&module=contract&action=getsourcecode&address={address}&apikey=$ETHERSCAN_V2_API_KEY"

# Check proxy implementation
cast implementation <proxy_address> --rpc-url <rpc_url>
```

### Key Governance Contracts (BSC Mainnet)

- Governor Bravo: `0x2d56dc077072b53571b8252008c60e945108c75a`
- Normal Timelock: `0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396`
- FastTrack Timelock: `0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02`
- Critical Timelock: `0x213c446ec11e45b15a6E29C1C1b402B8897f606d`

### Related Repos

- [VenusProtocol/venus-protocol](https://github.com/VenusProtocol/venus-protocol) — Core protocol contracts
- [VenusProtocol/isolated-pools](https://github.com/VenusProtocol/isolated-pools) — Isolated lending pools
- [VenusProtocol/venus-protocol-documentation](https://github.com/VenusProtocol/venus-protocol-documentation) — Deployed contract addresses

### Reference PRs

- **Prime Reward**: [PR #653](https://github.com/VenusProtocol/vips/pull/653) — VIP-578
- **XVS Vault Reward**: [PR #619](https://github.com/VenusProtocol/vips/pull/619) — VIP-552

## Environment

Requires archive node URLs in `.env` (see `.env.example`):

```
ARCHIVE_NODE_bscmainnet=https://...
ARCHIVE_NODE_ethereum=https://...
```

## Conventions

- VIP default exports must be functions (used by simulation and proposal tasks)
- Write VIP files to be easy to read and review; don't over-optimize them
- ABIs for simulation tests are stored alongside the simulation file in an `abi/` subdirectory
- Network addresses imported from `src/networkAddresses.ts` via `NETWORK_ADDRESSES.<network>.<key>`
- Commit messages follow conventional commits (enforced by commitlint + husky)
- Prettier: 120 char width, double quotes (single for Solidity), sorted imports
