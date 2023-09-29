import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const agEUR = "0x63061de4A25f24279AAab80400040684F92Ee319";
const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
const VTOKEN_RECEIVER_agEUR = "0xc444949e0054a23c44fc45789738bdf64aed2391";
const vagEUR_StableCoins = "0x4E1D35166776825402d50AfE4286c500027211D1";
const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
const REWARD_DISTRIBUTOR = "0x78d32FC46e5025c29e3BA03Fcf2840323351F26a";
const STABLECOIN_COMPTROLLER = "0x10b57706AD2345e590c2eA4DC02faef0d9f5b08B";
const ANGLE = "0xD1Bc731d188ACc3f52a6226B328a89056B0Ec71a";

export const vip178Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-178 Add agEUR market to Stablecoin Pool",
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
        params: [agEUR, parseUnits("1.06", 18)],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            agEUR,
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
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [ANGLE, parseUnits(".032", 18)],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            ANGLE,
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
        target: agEUR,
        signature: "faucet(uint256)",
        params: [parseUnits("9000", 18)],
      },
      {
        target: agEUR,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, "0"],
      },
      {
        target: agEUR,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, parseUnits("9000", 18)],
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            vagEUR_StableCoins,
            parseUnits("0.75", 18),
            parseUnits("0.8", 18),
            parseUnits("9000", 18),
            VTOKEN_RECEIVER_agEUR,
            parseUnits("100000", 18),
            parseUnits("50000", 18),
          ],
        ],
      },

      {
        target: ANGLE,
        signature: "faucet(uint256)",
        params: [parseUnits("17650", 18)],
      },

      {
        target: REWARD_DISTRIBUTOR,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: ANGLE,
        signature: "transfer(address,uint256)",
        params: [REWARD_DISTRIBUTOR, parseUnits("17650", 18)],
      },
      {
        target: STABLECOIN_COMPTROLLER,
        signature: "addRewardsDistributor(address)",
        params: [REWARD_DISTRIBUTOR],
      },
      {
        target: REWARD_DISTRIBUTOR,
        signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
        params: [[vagEUR_StableCoins], ["0"], ["87549603174603174"]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
