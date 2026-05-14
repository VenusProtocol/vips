import { ProposalType, SUPPORTED_NETWORKS } from "./types";

// Per-network per-tx gas cap (single transaction limit enforced by the
// chain's protocol rules). `governorBravo.execute(proposalId)` runs every
// command in a single tx, so any proposal whose gasUsed exceeds the
// destination cap is unexecutable on chain.
//
// Sources:
//   - bscmainnet / bsctestnet: BSC Maxwell + Osaka hardforks introduced a
//     hard per-tx cap of 2^24 = 16,777,216.
//   - ethereum / sepolia: Fusaka hardfork ships EIP-7825 with the same
//     2^24 = 16,777,216 per-tx cap.
//   - L2s (arbitrumone, opmainnet, basemainnet, opbnbmainnet, zksyncmainnet,
//     unichainmainnet) currently have effective per-tx limits well above the
//     L1 cap (driven by the L2 block gas limit, not a protocol per-tx rule).
//     Left unset (no enforcement) until a concrete per-tx rule lands.
//
// Used as the fallback table for `resolvePerTxGasCap` in `src/utils.ts`,
// which prefers the EIP-8123 `eth_txGasLimitCap` RPC method when supported
// and falls back to this map otherwise.
export const PER_TX_GAS_CAP_2_24 = 16_777_216;
export const PER_TX_GAS_CAP_BY_NETWORK: Partial<Record<SUPPORTED_NETWORKS, number>> = {
  bscmainnet: PER_TX_GAS_CAP_2_24,
  bsctestnet: PER_TX_GAS_CAP_2_24,
  ethereum: PER_TX_GAS_CAP_2_24,
  sepolia: PER_TX_GAS_CAP_2_24,
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
