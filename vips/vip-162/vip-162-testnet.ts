import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const TWT = "0xb99C6B26Fdf3678c6e2aff8466E3625a0e7182f8";
const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
const VTOKEN_RECEIVER_TWT = "0x8b293600C50D6fbdc6Ed4251cc75ECe29880276f"; // To be revised
const VTWT_DeFi = "0x4C94e67d239aD585275Fdd3246Ab82c8a2668564";
const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";

export const vip162Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-162 Testnet Add TWT market to DeFi Pool",
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
        params: [TWT, parseUnits("0.85120", 18)],
      },

      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            TWT,
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
        target: TWT,
        signature: "faucet(uint256)",
        params: [parseUnits("10000", 18)],
      },
      {
        target: TWT,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, "0"],
      },
      {
        target: TWT,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, parseUnits("10000", 18)],
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VTWT_DeFi,
            parseUnits("0.5", 18),
            parseUnits("0.6", 18),
            parseUnits("10000", 18),
            VTOKEN_RECEIVER_TWT,
            parseUnits("1000000", 18),
            parseUnits("500000", 18),
          ],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
