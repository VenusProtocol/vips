import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

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

export const vip326 = () => {
  const meta = {
    version: "v2",
    title: "VIP-326",
    description: ``,
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

export default vip326;
