import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const REWARD_DISTRIBUTORS = [
  "0x134bfDEa7e68733921Bc6A87159FB0d68aBc6Cf8",
  "0x76611EEA26aF8842281B56Bb742129E77133592F",
  "0x886767B62C7ACD601672607373048FFD96Cf27B2",
  "0x8473B767F68250F5309bae939337136a899E43F9",
  "0x5f65A7b60b4F91229B8484F80bc2EEc52758EAf9",
  "0x461dE281c453F447200D67C9Dd31b3046c8f49f8",
  "0x7A91bEd36D96E4e644d3A181c287E0fcf9E9cc98",
  "0xe72Aa7BaB160eaa2605964D2379AA56Cb4b9A1BB",
  "0xDCB0CfA130496c749738Acbe2d6aA06C7C320f06",
  "0x1e25CF968f12850003Db17E0Dba32108509C4359",
];

const vip053 = () => {
  return makeProposal([
    ...REWARD_DISTRIBUTORS.map(rewardDistributor => {
      return {
        target: rewardDistributor,
        signature: "transferOwnership(address)",
        params: [ethereum.NORMAL_TIMELOCK],
      };
    }),

    // Revoke permissions
    ...REWARD_DISTRIBUTORS.map(rewardDistributor => {
      return {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [rewardDistributor, "setRewardTokenSpeeds(address[],uint256[],uint256[])", ethereum.GUARDIAN],
      };
    }),
    ...REWARD_DISTRIBUTORS.map(() => {
      return {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setLastRewardingBlock(address[],uint32[],uint32[])", ethereum.GUARDIAN],
      };
    }),
    ...REWARD_DISTRIBUTORS.map(rewardDistributor => {
      return {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [rewardDistributor, "setLastRewardingBlocks(address[],uint32[],uint32[])", ethereum.GUARDIAN],
      };
    }),
    ...REWARD_DISTRIBUTORS.map(rewardDistributor => {
      return {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [
          rewardDistributor,
          "setLastRewardingBlockTimestamps(address[],uint256[],uint256[])",
          ethereum.GUARDIAN,
        ],
      };
    }),
  ]);
};

export default vip053;
