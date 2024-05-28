import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const REWARDS_DISTRIBUTOR = "0x34e14e4A5f5de28f8e58aeD296068ce5c3C25C4c";
export const VBABYDOGE = "0x73d2F6e0708599a4eA70F6A0c55A4C59196a101c";

// VIP Execution Txn: https://testnet.bscscan.com/tx/0x2466d7ad7639bb4ee0f4c62ce0abe4f484b23d983e996b7027eab9dde75265e6
export const REWARDS_START_BLOCK = 40348560;
export const REWARDS_END_BLOCK_90_DAYS = REWARDS_START_BLOCK + (90 * 24 * 60 * 60) / 3;

export const vip311 = () => {
  const meta = {
    version: "v2",
    title: "VIP-311 Pause BabyDoge Rewards",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with setting last rewarding block",
    againstDescription: "I do not think that Venus Protocol should proceed with setting last rewarding block",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with setting last rewarding block",
  };

  return makeProposal(
    [
      {
        target: REWARDS_DISTRIBUTOR,
        signature: "setLastRewardingBlocks(address[],uint32[],uint32[])",
        params: [[VBABYDOGE], [REWARDS_END_BLOCK_90_DAYS], [REWARDS_END_BLOCK_90_DAYS]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip311;
