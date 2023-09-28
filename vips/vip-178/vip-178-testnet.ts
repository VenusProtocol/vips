import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const agEUR = "0x63061de4A25f24279AAab80400040684F92Ee319";
const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
const VTOKEN_RECEIVER_agEUR = "0xDC2D855A95Ee70d7282BebD35c96f905CDE31f55"; // To be revised
const vagEUR_StableCoins = "0xa0571e758a00C586DbD53fb431d0f48eff9d0F15";
const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";

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
        target: agEUR,
        signature: "faucet(uint256)",
        params: [parseUnits("10000", 18)],
      },
      {
        target: agEUR,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, "0"],
      },
      {
        target: agEUR,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, parseUnits("10000", 18)],
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            vagEUR_StableCoins,
            parseUnits("0.75", 18),
            parseUnits("0.8", 18),
            parseUnits("10000", 18), // To be revised
            VTOKEN_RECEIVER_agEUR,
            parseUnits("100000", 18),
            parseUnits("50000", 18),
          ],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
