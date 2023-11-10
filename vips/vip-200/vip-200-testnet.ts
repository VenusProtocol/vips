import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const VPLANET_DEFI = "0xe237aA131E7B004aC88CB808Fa56AF3dc4C408f1";
const REWARD_DISTRIBUTOR = "0x9372F0d88988B2cC0a2bf8700a5B3f04B0b81b8C";

const REWARDS_START_BLOCK = 34772656;
const REWARDS_END_BLOCK_28_DAYS = REWARDS_START_BLOCK + 806400;

export const vip200Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-200 Isolated Lending Pools: Configure Liquidity Mining (PLANET)",
    description: `#### Summary 

If passed, this VIP will set the last block with rewards for the PLANET market in the DeFi pool.

#### Description 

This VIP sets the last block with rewards for the PLANET market in the DeFi pool.

In vPLANET_DeFi, the last block with rewards will be 34150223. That means around 28 days (806,400 blocks) after being enabled.

Simulation of the VIP: https://github.com/VenusProtocol/vips/pull/106`,
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
