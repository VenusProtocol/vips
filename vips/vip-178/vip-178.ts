import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const agEUR = "0x12f31b73d812c6bb0d735a218c086d44d5fe5f89";
const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
const VTOKEN_RECEIVER_agEUR = "0xDC2D855A95Ee70d7282BebD35c96f905CDE31f55"; // To be revised
const vagEUR_StableCoin = "0x1a9D2862028F6f5E6C299A7AC3C285508942b15E";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const MAX_STALE_PERIOD = 60 * 25;

export const vip178 = (maxStalePeriod?: number) => {
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
        target: BINANCE_ORACLE,
        signature: "setSymbolOverride(string,string)",
        params: ["agEUR", "AGEUR"],
      },
      {
        target: BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["AGEUR", maxStalePeriod || MAX_STALE_PERIOD],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            agEUR,
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
        params: [agEUR, parseUnits("10000", 18), NORMAL_TIMELOCK],
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
            vagEUR_StableCoin,
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
