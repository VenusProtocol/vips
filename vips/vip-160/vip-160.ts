import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const THE = "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11";
const TWT = "0x4b0f1812e5df2a09796481ff14017e6005508003";
const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
const VTOKEN_RECEIVER_THE = "0x1c6C2498854662FDeadbC4F14eA2f30ca305104b";
const VTOKEN_RECEIVER_TWT = "0x1c6C2498854662FDeadbC4F14eA2f30ca305104b"; // To be revised
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const VTHE_DeFi = "";
const VTWT_DeFi = "";
const REWARD_DISTRIBUTOR_THE = "";
const DEFI_COMPTROLLER = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const USDT = "0x55d398326f99059ff775485246999027b3197955";
const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

export const vip160 = () => {
  const meta = {
    version: "v2",
    title: "VIP-160 Add THE and TWT market to DeFi Pool",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with add market",
    againstDescription: "I do not think that Venus Protocol should proceed with add market",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with add market",
  };

  return makeProposal(
    // Tranfer From Tresury to community wallet
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("6000", 18), COMMUNITY_WALLET],
      },
      // ================ THE Market ========================
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [THE, parseUnits("58823.5", 18), NORMAL_TIMELOCK],
      },
      {
        target: THE,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
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
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [TWT, parseUnits("58823.5", 18), NORMAL_TIMELOCK],
      },
      {
        target: TWT,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
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
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [THE, parseUnits("58823.5", 18), NORMAL_TIMELOCK],
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
        params: [[VTHE_DeFi], ["68082754629629629"], ["68082754629629629"]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
