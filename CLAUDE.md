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

# Multisig simulation
npx hardhat test multisig/simulations/<network>/<vip-path>/index.ts --fork <network>

# Type checking only
yarn tsc --noEmit
```

### Proposing and Executing

```bash
npx hardhat propose <path-relative-to-vips/> --network bscmainnet
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

- **`Command`**: Single contract call — `{ target, signature, params, value?, dstChainId? }`
- **`Proposal`**: Array of targets/signatures/params/values built from Commands
- **`ProposalType`**: `REGULAR` (0), `FAST_TRACK` (1), `CRITICAL` (2) — different timelock delays
- **`LzChainId`**: LayerZero chain IDs for cross-chain proposals

### Key Utility: `makeProposal()` (src/utils.ts)

Converts an array of `Command` objects into a `Proposal`. Automatically handles cross-chain routing: commands with `dstChainId` are bundled into LayerZero omnichain execution calls via `OmnichainProposalSender`.

### VIP File Pattern

```typescript
// vips/vip-NNN.ts
import { makeProposal } from "src/utils";
import { ProposalType } from "src/types";

export const vipNNN = () => {
  const meta = { version: "v2", title: "...", description: "...", forDescription: "...", againstDescription: "...", abstainDescription: "..." };
  return makeProposal([
    { target: "0x...", signature: "functionName(type1,type2)", params: [arg1, arg2] },
    // Cross-chain command:
    { target: "0x...", signature: "functionName(type)", params: [arg], dstChainId: LzChainId.ethereum },
  ], meta, ProposalType.REGULAR);
};
export default vipNNN;
```

### Simulation File Pattern

```typescript
// simulations/vip-NNN/simulations.ts
import { forking, testVip } from "src/vip-framework";
import { vipNNN } from "../../vips/vip-NNN";

forking(BLOCK_NUMBER, async () => {
  describe("Pre-VIP behavior", () => { /* assert current state */ });
  testVip("VIP-NNN Description", await vipNNN());
  describe("Post-VIP behavior", () => { /* assert state changes */ });
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

| Type           | Voting Period | Execution Delay | Cross-chain Extra Delay | Use Case                    |
| -------------- | ------------- | --------------- | ----------------------- | --------------------------- |
| **Normal**     | 24h           | 48h             | +48h                    | Regular proposals           |
| **Fast-track** | 24h           | 6h              | +6h                     | Semi-urgent adjustments     |
| **Critical**   | 6h            | 1h              | +1h                     | Emergency security fixes    |

### Timeline Estimates

| Scenario            | Pre-work | On-chain | Total     |
| ------------------- | -------- | -------- | --------- |
| **BSC Normal**      | 2-3 days | 3 days   | **5-6 days** |
| **Cross-chain Normal** | 2-3 days | 5 days | **7-8 days** |
| **Critical**        | varies   | ~7h      | faster    |

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
- ABIs for simulation tests are stored alongside the simulation file in an `abi/` subdirectory
- Network addresses imported from `src/networkAddresses.ts` via `NETWORK_ADDRESSES.<network>.<key>`
- Commit messages follow conventional commits (enforced by commitlint + husky)
- Prettier: 120 char width, double quotes (single for Solidity), sorted imports
