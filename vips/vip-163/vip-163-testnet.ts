import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const THE = "0xB1cbD28Cb101c87b5F94a14A8EF081EA7F985593";
const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
const VTOKEN_RECEIVER_THE = "0x1c6C2498854662FDeadbC4F14eA2f30ca305104b";
const VTHE_DeFi = "0xc934C824a2d2b79e4Beae8bf4131d36966459892";
const REWARD_DISTRIBUTOR_THE = "0x5cBf86e076b3F36a85dD73A730a3567FdCA0D21E";
const DEFI_COMPTROLLER = "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD";
const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";

export const vip163Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-163 Testnet Add THE market to DeFi Pool",
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
        params: [THE, parseUnits("0.11470", 18)],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            THE,
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
        target: THE,
        signature: "faucet(uint256)",
        params: [parseUnits("117647", 18)], // 50/50 for initial supply and rewards
      },
      {
        target: THE,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, "0"],
      },
      {
        target: THE,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, parseUnits("58823.5", 18)],
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VTHE_DeFi,
            0,
            parseUnits("1", 18),
            parseUnits("58823.5", 18),
            VTOKEN_RECEIVER_THE,
            parseUnits("2000000", 18),
            parseUnits("1000000", 18),
          ],
        ],
      },
      {
        target: THE,
        signature: "transfer(address,uint256)",
        params: [REWARD_DISTRIBUTOR_THE, parseUnits("58823.5", 18)],
      },
      {
        target: DEFI_COMPTROLLER,
        signature: "addRewardsDistributor(address)",
        params: [REWARD_DISTRIBUTOR_THE],
      },
      {
        target: REWARD_DISTRIBUTOR_THE,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: REWARD_DISTRIBUTOR_THE,
        signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
        params: [[VTHE_DeFi], ["17020688657407407"], ["17020688657407407"]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
