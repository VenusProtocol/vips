import { ProposalType } from "./types";

export const NETWORK_CONFIG = {
  bscmainnet: {
    DELAY_BLOCKS: {
      [ProposalType.REGULAR]: 57600,
      [ProposalType.FAST_TRACK]: 7200,
      [ProposalType.CRITICAL]: 1200,
    },
  },
  bsctestnet: {
    DELAY_BLOCKS: {
      [ProposalType.REGULAR]: 200,
      [ProposalType.FAST_TRACK]: 100,
      [ProposalType.CRITICAL]: 34,
    },
  },
  sepolia: {
    DELAY_BLOCKS: {
      [ProposalType.REGULAR]: 200,
      [ProposalType.FAST_TRACK]: 100,
      [ProposalType.CRITICAL]: 34,
    },
  },
};
