import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const THE = "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11";
const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
const VTOKEN_RECEIVER_THE = "0x1c6C2498854662FDeadbC4F14eA2f30ca305104b";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const VTHE_DeFi = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
const REWARD_DISTRIBUTOR = "0x493f6Cc4B22441AE84c58aAE44211Efe899720a2";
const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";
const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
const DEFI_COMPTROLLER = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
const MAX_STALE_PERIOD = 60 * 25;

export const vip163 = (maxStalePeriod?: number) => {
  const meta = {
    version: "v2",
    title: "VIP-163 Add THE market to DeFi Pool",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with add market",
    againstDescription: "I do not think that Venus Protocol should proceed with add market",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with add market",
  };

  return makeProposal(
    [
      // Tranfer From Treasury to community wallet
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [VAI, parseUnits("6000", 18), COMMUNITY_WALLET],
      },
      {
        target: BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["THE", maxStalePeriod || MAX_STALE_PERIOD],
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
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [THE, parseUnits("117647", 18), NORMAL_TIMELOCK],
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
        params: [REWARD_DISTRIBUTOR, parseUnits("58823.5", 18)],
      },
      {
        target: DEFI_COMPTROLLER,
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
        params: [[VTHE_DeFi], ["17020688657407407"], ["17020688657407407"]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
