import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const THE = "0xB1cbD28Cb101c87b5F94a14A8EF081EA7F985593";
const TWT = "0xb99C6B26Fdf3678c6e2aff8466E3625a0e7182f8";
const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
const VTOKEN_RECEIVER_THE = "0x1c6C2498854662FDeadbC4F14eA2f30ca305104b";
const VTOKEN_RECEIVER_TWT = "0x1c6C2498854662FDeadbC4F14eA2f30ca305104b";
const VTHE_DeFi = "0xDC2510CE5b2f28E1D4ee1708AE0A041f9B35131F";
const VTWT_DeFi = "0xc0349EFd5a72E39e8f6F5Fe16152001cFD8Ba46D";
const REWARD_DISTRIBUTOR_THE = "0x5cBf86e076b3F36a85dD73A730a3567FdCA0D21E";
const DEFI_COMPTROLLER = "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD";
const BINANCE_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";

export const vip160Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-160 Testnet Add THE and TWT market to DeFi Pool",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with add market",
    againstDescription: "I do not think that Venus Protocol should proceed with add market",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with add market",
  };

  return makeProposal(
    [
      {
        target: BINANCE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [THE, parseUnits("0.11470", 18)],
      },
      {
        target: BINANCE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [TWT, parseUnits("0.85120", 18)],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            THE,
            [
              BINANCE_ORACLE,
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            TWT,
            [
              BINANCE_ORACLE,
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },
      // ================ THE Market ========================
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
            parseUnits("0.2", 18),
            parseUnits("0.3", 18),
            parseUnits("58823.5", 18),
            VTOKEN_RECEIVER_THE,
            parseUnits("1400000", 18),
            parseUnits("2600000", 18),
          ],
        ],
      },
      // ================= TWT Market ======================
      {
        target: TWT,
        signature: "faucet(uint256)",
        params: [parseUnits("58823.5", 18)],
      },
      {
        target: TWT,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, "0"],
      },
      {
        target: TWT,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, parseUnits("58823.5", 18)],
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VTWT_DeFi,
            parseUnits("0.5", 18),
            parseUnits("0.6", 18),
            parseUnits("58823.5", 18), // To be revised
            VTOKEN_RECEIVER_TWT, // To be revised
            parseUnits("500000", 18),
            parseUnits("1000000", 18),
          ],
        ],
      },

      // =============REWARDS_THE_MARKET================
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
        params: [[VTHE_DeFi], ["68082754629629629"], ["68082754629629629"]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
