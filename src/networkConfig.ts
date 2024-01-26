import { ProposalType } from "./types";

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
};
