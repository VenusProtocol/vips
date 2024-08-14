import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const REWARDS_DISTRIBUTOR = "0xC1044437AbfD8592150d612185581c5600851d44";
export const VBABYDOGE = "0x52eD99Cd0a56d60451dD4314058854bc0845bbB5";

// VIP Execution Txn: https://bscscan.com/tx/0xd8c521d72dbead374c68032b2628c6f1b8f7ae78039a5c83bcd635143f1e2588
export const REWARDS_START_BLOCK = 38895533;
export const REWARDS_END_BLOCK_90_DAYS = REWARDS_START_BLOCK + (90 * 24 * 60 * 60) / 3;

export const vip311 = () => {
  const meta = {
    version: "v2",
    title: "VIP-311 Configure liquidity mining (FRAX, sFRAX, BabyDoge)",
    description: `#### Summary

If passed, the last block with rewards for the [FRAX](https://app.venus.io/#/core-pool/market/0x4fAfbDc4F2a9876Bd1764827b26fb8dc4FD1dB95?chainId=1) and [sFRAX](https://app.venus.io/#/core-pool/market/0x17142a05fe678e9584FA1d88EfAC1bF181bF7ABe?chainId=1) markets on Ethereum will be set to [20509441](https://etherscan.io/block/countdown/20509441), 90 days after the rewards were enabled, approximately, assuming 1 block every 12 seconds.

Moreover, the last block with rewards for the [BabyDoge](https://app.venus.io/#/isolated-pools/pool/0x33B6fa34cd23e5aeeD1B112d5988B026b8A5567d/market/0x52eD99Cd0a56d60451dD4314058854bc0845bbB5?chainId=56) market on BNB Chain would be set to [41487533](https://bscscan.com/block/countdown/41487533), 90 days after the rewards were enabled, approximately, assuming 1 block every 3 seconds

#### Description

Rewards for the FRAX and sFRAX markets on Ethereum were enabled at block 19861441 in this [transaction](https://etherscan.io/tx/0x261395084b5f1a51d331c72ab2f836d10479b6fbb76b6b8b3094ec440e7de032) (May 13th, 2024 01:37:59 PM +UTC).

The configured rewards were set in the [VIP-302](https://app.venus.io/#/governance/proposal/302?chainId=1), following the community proposal “[XVS Ethereum Mainnet Development Program with Lido, Frax, Curve and Gitcoin](https://community.venus.io/t/xvs-ethereum-mainnet-development-program-with-lido-frax-curve-and-gitcoin/4200)”:

- FRAX market: 2,400 XVS for 90 days, provided by the Venus Protocol. 40% for suppliers, 60% for borrowers
- sFRAX market: 2,400 XVS for 90 days, provided by the Venus Protocol. 60% for suppliers, 40% for borrowers

Rewards for the BabyDoge market on BNB Chain were enabled at block 38895533 in this [transaction](https://bscscan.com/tx/0xd8c521d72dbead374c68032b2628c6f1b8f7ae78039a5c83bcd635143f1e2588) (May 20th, 2024 07:18:16 PM +UTC).

The configured rewards were set in the [VIP-304](https://app.venus.io/#/governance/proposal/304?chainId=1), following the community proposal “[Isolated Lending Market for BABYDOGE on Venus](https://community.venus.io/t/isolated-lending-market-for-babydoge-on-venus/4155)”:

- 15,726,472,026,491 BabyDoge for 90 days, provided by the BabyDoge project. 50% for suppliers, 50% for borrowers

Simulation of the multisig transaction: https://github.com/VenusProtocol/vips/pull/285

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x09721d06d784a55b0b29a84de2743d236c216c81a34509beca964fa2065541d9) multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
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
