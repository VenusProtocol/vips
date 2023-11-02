import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const PLANET = "0x52b4E1A2ba407813F829B4b3943A1e57768669A9";
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
const VTOKEN_RECEIVER = "0x8b293600C50D6fbdc6Ed4251cc75ECe29880276f";
const VPLANET_DEFI = "0x890bb304488c9ba15D7388BD755Ae871B55612b8";
const REWARD_DISTRIBUTOR = "0x9372F0d88988B2cC0a2bf8700a5B3f04B0b81b8C";
const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const COMPTROLLER = "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD";
const PSR = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";

export const vip197 = () => {
  const meta = {
    version: "v2",
    title: "Add PLANET market to DeFi Pool",
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
        params: [PLANET, parseUnits("0.00005117", 18)],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            PLANET,
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
        target: VPLANET_DEFI,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [100],
      },
      {
        target: VPLANET_DEFI,
        signature: "setProtocolShareReserve(address)",
        params: [PSR],
      },
      {
        target: PLANET,
        signature: "faucet(uint256)",
        params: [parseUnits("174983000", 18)],
      },
      {
        target: PLANET,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, "0"],
      },
      {
        target: PLANET,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, parseUnits("174983000", 18)],
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VPLANET_DEFI,
            parseUnits("0.2", 18),
            parseUnits("0.3", 18),
            parseUnits("174983000", 18),
            VTOKEN_RECEIVER,
            parseUnits("500000000", 18),
            parseUnits("500000000", 18),
          ],
        ],
      },
      {
        target: USDT,
        signature: "allocateTo(address,uint256)",
        params: [REWARD_DISTRIBUTOR, parseUnits("3000", 6)],
      },
      {
        target: COMPTROLLER,
        signature: "addRewardsDistributor(address)",
        params: [REWARD_DISTRIBUTOR],
      },
      {
        target: REWARD_DISTRIBUTOR,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: REWARD_DISTRIBUTOR,
        signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
        params: [[VPLANET_DEFI], ["1860"], ["1860"]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
