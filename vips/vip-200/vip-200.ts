import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const VPLANET_DEFI = "0xFf1112ba7f88a53D4D23ED4e14A117A2aE17C6be";
const REWARD_DISTRIBUTOR = "0xD86FCff6CCF5C4E277E49e1dC01Ed4bcAb8260ba";

const REWARDS_START_BLOCK = 33343823;
const REWARDS_END_BLOCK_28_DAYS = REWARDS_START_BLOCK + 806400;

export const vip200 = () => {
  const meta = {
    version: "v2",
    title: "VIP-200 Isolated Lending Pools: Configure Liquidity Mining (PLANET)",
    description: `#### Summary

If passed, this VIP will set the last block with rewards for the PLANET market in the DeFi pool.

#### Description

This VIP sets the last block with rewards for the PLANET market in the DeFi pool.

In [vPLANET_DeFi](https://app.venus.io/#/isolated-pools/pool/0x3344417c9360b963ca93A4e8305361AEde340Ab9/market/0xFf1112ba7f88a53D4D23ED4e14A117A2aE17C6be), the last block with rewards will be 34150223. That means around 28 days (806,400 blocks) after [being enabled](https://app.venus.io/#/governance/proposal/198).

Simulation of the VIP: [https://github.com/VenusProtocol/vips/pull/106](https://github.com/VenusProtocol/vips/pull/106)`,
    forDescription: "Process to configure Liquidity Mining",
    againstDescription: "Defer configuration of Liquidity Mining",
    abstainDescription: "No opinion on the matter",
  };

  return makeProposal(
    [
      {
        target: REWARD_DISTRIBUTOR,
        signature: "setLastRewardingBlocks(address[],uint32[],uint32[])",
        params: [[VPLANET_DEFI], [REWARDS_END_BLOCK_28_DAYS], [REWARDS_END_BLOCK_28_DAYS]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
