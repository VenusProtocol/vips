import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const LAST_REWARD_BLOCK = 39793420; // Fri Jun 21 2024 01:34:41 UTC
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const BABYDOGE = "0xc748673057861a797275CD8A068AbB95A902e8de";
export const VBABYDOGE = "0x52eD99Cd0a56d60451dD4314058854bc0845bbB5";
export const REWARDS_DISTRIBUTOR = "0xC1044437AbfD8592150d612185581c5600851d44";
export const VTREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

const rewardsStartBlock = 38895533; // https://bscscan.com/tx/0xd8c521d72dbead374c68032b2628c6f1b8f7ae78039a5c83bcd635143f1e2588
const rewardsAllocated = parseUnits("15726472026491.075844320", 9);
const rewardPerBlock = BigNumber.from("12134623477230768").mul(2);
const rewardedBlocks = rewardsAllocated.div(rewardPerBlock).toNumber(); // 648000 blocks
const lastRewardedBlock = rewardsStartBlock + rewardedBlocks; // 39543533

const blocksToSponsor = LAST_REWARD_BLOCK - lastRewardedBlock; // 249887
const babyDogeToSponsor = rewardPerBlock.mul(blocksToSponsor); // 6064569313709.529846432 BabyDoge
const babyDogePrice = parseUnits("0.000000001595", 18 + 9); // 0.000000001595 $/BabyDoge, adjusted for decimals
const usdtToSend = babyDogeToSponsor.mul(babyDogePrice).div(parseUnits("1", 18)); // = 9672.988055366700105059 USDT

export const vip325 = () => {
  const meta = {
    version: "v2",
    title: "VIP-325 Configure liquidity mining (BabyDoge)",
    description: `#### Summary

If passed, the last block with rewards for the [BabyDoge](https://app.venus.io/#/isolated-pools/pool/0x33B6fa34cd23e5aeeD1B112d5988B026b8A5567d/market/0x52eD99Cd0a56d60451dD4314058854bc0845bbB5?chainId=56) market on BNB Chain would be set to [39793420](https://bscscan.com/block/countdown/39793420), 33 days after the rewards were enabled, approximately, assuming 1 block every 3 seconds. Moreover 9672.98 USDT will be sent to the [Community Wallet](https://bscscan.com/address/0xc444949e0054A23c44Fc45789738bdF64aed2391) that will be used to complete the BabyDoge rewards.

#### Description

Rewards for the BabyDoge market on BNB Chain were enabled at block 38895533 in this [transaction](https://bscscan.com/tx/0xd8c521d72dbead374c68032b2628c6f1b8f7ae78039a5c83bcd635143f1e2588) (May 20th, 2024 07:18:16 PM +UTC).

The configured rewards were set in the [VIP-304](https://app.venus.io/#/governance/proposal/304?chainId=1), following the community proposal “[Isolated Lending Market for BABYDOGE on Venus](https://community.venus.io/t/isolated-lending-market-for-babydoge-on-venus/4155)”:

- 15,726,472,026,491 BabyDoge for 22.5 days (instead of 90 days, as mentioned in the [VIP-311](https://venus-mainnet.vercel.app/#/governance/proposal/311)), provided by the BabyDoge project. 50% for suppliers, 50% for borrowers. So, the last block with rewards provided by the BabyDoge project was [39543533](https://bscscan.com/block/39543533) (June 12th, 2024)
- Venus Treasury will sponsor the BabyDoge rewards for extra 10.5 days, with a total cost of 6,064,569,313,709 BabyDoge (around $9,672 with the current price, on June 17th 2024)

Venus Treasury doesn’t have enough BabyDoge tokens to fund this sponsorship, so 9,672 USDT will be transferred to the Community Wallet in this VIP. This wallet will swap the received USDT for BabyDoge tokens, and it will send them to the [RewardsDistributor contract](https://bscscan.com/address/0xC1044437AbfD8592150d612185581c5600851d44).

Simulation of the VIP: [https://github.com/VenusProtocol/vips/pull/306](https://github.com/VenusProtocol/vips/pull/306)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, usdtToSend, COMMUNITY_WALLET],
      },
      {
        target: REWARDS_DISTRIBUTOR,
        signature: "setLastRewardingBlocks(address[],uint32[],uint32[])",
        params: [[VBABYDOGE], [LAST_REWARD_BLOCK], [LAST_REWARD_BLOCK]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip325;
