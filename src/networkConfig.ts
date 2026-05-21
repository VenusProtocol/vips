import { ProposalType, SUPPORTED_NETWORKS } from "./types";

// Per-network per-tx gas cap (single transaction limit enforced by the
// chain's protocol rules). `governorBravo.execute(proposalId)` and the
// destination chain's `OmnichainGovernanceExecutor.execute(proposalId)` each
// run every command of their bundle in a single tx, so any per-chain bundle
// whose gasUsed exceeds the destination cap is unexecutable on chain.
//
// Sources (verified against the originating EIP / BEP / client release):
//   - bscmainnet / bsctestnet: Osaka/Mendel hardfork — BEP-652 implements
//     EIP-7825 with a 2^24 = 16,777,216 per-tx cap.
//   - ethereum / sepolia: Fusaka hardfork — EIP-7825 ships the same
//     2^24 = 16,777,216 cap.
//   - opbnbmainnet / opbnbtestnet: bnb-chain/op-geth v0.5.10 enforces
//     EIP-7825 (16,777,216) at tx-pool admission and block packing.
//
// Other L2s in this repo (arbitrumone, opmainnet, basemainnet, zksyncmainnet,
// unichainmainnet) are left unset — no per-tx cap confirmed against a
// primary source yet. Revisit when a chain ships an EIP-7825-equivalent rule.
//
// Used as the fallback for `resolvePerTxGasCap` in `src/utils.ts`, which
// prefers the `eth_txGasLimitCap` RPC method (EIP-8123) when supported.
export const PER_TX_GAS_CAP_2_24 = 16_777_216;
export const PER_TX_GAS_CAP_BY_NETWORK: Partial<Record<SUPPORTED_NETWORKS, number>> = {
  bscmainnet: PER_TX_GAS_CAP_2_24,
  bsctestnet: PER_TX_GAS_CAP_2_24,
  ethereum: PER_TX_GAS_CAP_2_24,
  sepolia: PER_TX_GAS_CAP_2_24,
  opbnbmainnet: PER_TX_GAS_CAP_2_24,
  opbnbtestnet: PER_TX_GAS_CAP_2_24,
};

export const NETWORK_CONFIG = {
  bscmainnet: {
    DELAY_BLOCKS: {
      [ProposalType.REGULAR]: 57600,
      [ProposalType.FAST_TRACK]: 7200,
      [ProposalType.CRITICAL]: 1200,
    },
    XVS_VAULT_POOL_ID: 0,
  },
  bsctestnet: {
    DELAY_BLOCKS: {
      [ProposalType.REGULAR]: 200,
      [ProposalType.FAST_TRACK]: 100,
      [ProposalType.CRITICAL]: 34,
    },
    XVS_VAULT_POOL_ID: 1,
  },
  sepolia: {
    DELAY_BLOCKS: {
      [ProposalType.REGULAR]: 200,
      [ProposalType.FAST_TRACK]: 100,
      [ProposalType.CRITICAL]: 34,
    },
    XVS_VAULT_POOL_ID: 0,
  },
  ethereum: {
    DELAY_BLOCKS: {
      [ProposalType.REGULAR]: 200,
      [ProposalType.FAST_TRACK]: 100,
      [ProposalType.CRITICAL]: 34,
    },
    XVS_VAULT_POOL_ID: 0,
  },
  opbnbtestnet: {
    DELAY_BLOCKS: {
      [ProposalType.REGULAR]: 200,
      [ProposalType.FAST_TRACK]: 100,
      [ProposalType.CRITICAL]: 34,
    },
    XVS_VAULT_POOL_ID: 0,
  },
  opbnbmainnet: {
    DELAY_BLOCKS: {
      [ProposalType.REGULAR]: 200,
      [ProposalType.FAST_TRACK]: 100,
      [ProposalType.CRITICAL]: 34,
    },
    XVS_VAULT_POOL_ID: 0,
  },
  arbitrumsepolia: {
    DELAY_BLOCKS: {
      [ProposalType.REGULAR]: 200,
      [ProposalType.FAST_TRACK]: 100,
      [ProposalType.CRITICAL]: 34,
    },
    XVS_VAULT_POOL_ID: 0,
  },
  arbitrumone: {
    DELAY_BLOCKS: {
      [ProposalType.REGULAR]: 200,
      [ProposalType.FAST_TRACK]: 100,
      [ProposalType.CRITICAL]: 34,
    },
    XVS_VAULT_POOL_ID: 0,
  },
  zksyncsepolia: {
    DELAY_BLOCKS: {
      [ProposalType.REGULAR]: 200,
      [ProposalType.FAST_TRACK]: 100,
      [ProposalType.CRITICAL]: 34,
    },
    XVS_VAULT_POOL_ID: 0,
  },
  zksyncmainnet: {
    DELAY_BLOCKS: {
      [ProposalType.REGULAR]: 200,
      [ProposalType.FAST_TRACK]: 100,
      [ProposalType.CRITICAL]: 34,
    },
    XVS_VAULT_POOL_ID: 0,
  },
  opsepolia: {
    DELAY_BLOCKS: {
      [ProposalType.REGULAR]: 200,
      [ProposalType.FAST_TRACK]: 100,
      [ProposalType.CRITICAL]: 34,
    },
    XVS_VAULT_POOL_ID: 0,
  },
  opmainnet: {
    DELAY_BLOCKS: {
      [ProposalType.REGULAR]: 200,
      [ProposalType.FAST_TRACK]: 100,
      [ProposalType.CRITICAL]: 34,
    },
    XVS_VAULT_POOL_ID: 0,
  },
  basesepolia: {
    DELAY_BLOCKS: {
      [ProposalType.REGULAR]: 200,
      [ProposalType.FAST_TRACK]: 100,
      [ProposalType.CRITICAL]: 34,
    },
    XVS_VAULT_POOL_ID: 0,
  },
  basemainnet: {
    DELAY_BLOCKS: {
      [ProposalType.REGULAR]: 200,
      [ProposalType.FAST_TRACK]: 100,
      [ProposalType.CRITICAL]: 34,
    },
    XVS_VAULT_POOL_ID: 0,
  },
  unichainsepolia: {
    DELAY_BLOCKS: {
      [ProposalType.REGULAR]: 200,
      [ProposalType.FAST_TRACK]: 100,
      [ProposalType.CRITICAL]: 34,
    },
    XVS_VAULT_POOL_ID: 0,
  },
  unichainmainnet: {
    DELAY_BLOCKS: {
      [ProposalType.REGULAR]: 200,
      [ProposalType.FAST_TRACK]: 100,
      [ProposalType.CRITICAL]: 34,
    },
    XVS_VAULT_POOL_ID: 0,
  },
};
