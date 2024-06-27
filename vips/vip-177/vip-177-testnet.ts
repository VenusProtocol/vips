import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const SnBNB = "0xd2aF6A916Bc77764dc63742BC30f71AF4cF423F4";
const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
const VTOKEN_RECEIVER_SnBNB = "0xDC2D855A95Ee70d7282BebD35c96f905CDE31f55";
const vSnBNB_LiquidStakedBNB = "0xeffE7874C345aE877c1D893cd5160DDD359b24dA";
const REWARD_DISTRIBUTOR_SnBNB = "0xc1Ea6292C49D6B6E952baAC6673dE64701bB88cB";
const Liquid_Staked_BNB_Comptroller = "0x596B11acAACF03217287939f88d63b51d3771704";
const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
const HAY = "0xe73774DfCD551BF75650772dC2cC56a2B6323453";

export const vip177Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-177 Testnet Add SnBnb market to Liquid Staked BNB Pool",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with add market",
    againstDescription: "I do not think that Venus Protocol should proceed with add market",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with add market",
  };

  return makeProposal(
    [
      {
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [SnBNB, parseUnits("217", 18)],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            SnBNB,
            [
              CHAINLINK_ORACLE,
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },

      {
        target: SnBNB,
        signature: "faucet(uint256)",
        params: [parseUnits("47", 18)],
      },
      {
        target: SnBNB,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, "0"],
      },
      {
        target: SnBNB,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, parseUnits("47", 18)],
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            vSnBNB_LiquidStakedBNB,
            parseUnits("0.87", 18),
            parseUnits("0.9", 18),
            parseUnits("47", 18),
            VTOKEN_RECEIVER_SnBNB,
            parseUnits("1000", 18),
            parseUnits("100", 18),
          ],
        ],
      },
      {
        target: HAY,
        signature: "faucet(uint256)",
        params: [parseUnits("3000", 18)],
      },

      {
        target: REWARD_DISTRIBUTOR_SnBNB,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: HAY,
        signature: "transfer(address,uint256)",
        params: [REWARD_DISTRIBUTOR_SnBNB, parseUnits("3000", 18)],
      },
      {
        target: Liquid_Staked_BNB_Comptroller,
        signature: "addRewardsDistributor(address)",
        params: [REWARD_DISTRIBUTOR_SnBNB],
      },
      {
        target: REWARD_DISTRIBUTOR_SnBNB,
        signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
        params: [[vSnBNB_LiquidStakedBNB], ["930059523809523"], ["930059523809523"]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
