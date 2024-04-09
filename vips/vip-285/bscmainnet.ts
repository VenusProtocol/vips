import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VDAI = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";
const VFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
const VTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
const VUSDT_StableCoin = "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B";
const VUSDT_GameFi = "0x4978591f17670A846137d9d613e333C38dc68A37";
const VUSDT_DeFi = "0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854";

const VUSDT_IR = "0x9e8fbACBfbD811Fc561af3Af7df8e38dEd4c52F3";
const VUSDC_IR = "0x9e8fbACBfbD811Fc561af3Af7df8e38dEd4c52F3";
const VDAI_IR = "0x9e8fbACBfbD811Fc561af3Af7df8e38dEd4c52F3";
const VFDUSD_IR = "0x958F4C84d3ad523Fa9936Dc465A123C7AD43D69B";
const VTUSD_IR = "0x9e8fbACBfbD811Fc561af3Af7df8e38dEd4c52F3";
const VUSDT_StableCoin_IR = "0x9e8fbACBfbD811Fc561af3Af7df8e38dEd4c52F3";
const VUSDT_GameFi_IR = "0x81908BBaad3f6fC74093540Ab2E9B749BB62aA0d";
const VUSDT_DeFi_IR = "0x81908BBaad3f6fC74093540Ab2E9B749BB62aA0d";

export const vip285 = () => {
  const meta = {
    version: "v2",
    title: "VIP-285 Chaos lab recommendation for the week 4th April(1/3)",
    description: `This VIP will perform the following Risk Parameter action as per Chaos lab recommendation[Risk Parameter Updates 04/04/2024](https://community.venus.io/t/chaos-labs-stablecoin-ir-updates-04-04-24/4241). 
    - USDT (Core pool) : update multiplier from 0.0687 to 0.1.
    - USDC (Core pool) : update multiplier from 0.0687 to 0.1.
    - DAI (Core pool) : update multiplier from 0.0687 to 0.1.
    - TUSD (Core pool) : update multiplier from 0.0687 to 0.1.
    - FDUSD (Core pool) : update multiplier from 0.0687 to 0.1 and jump multiplier from 2.5 to 0.5.
    - USDT (StableCoin pool) : update multiplier from 0.0687 to 0.1.
    - USDT (GameFi pool) : update multiplier from 0.10 to 0.15.
    - USDT (DeFi pool) : update multiplier from 0.10 to 0.15. 
      `,

    forDescription: "I agree that Venus Protocol should proceed with the Risk Parameters Update's",
    againstDescription: "I do not think that Venus Protocol should proceed with the Risk Parameters Update's",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Risk Parameters Update's or not",
  };

  return makeProposal(
    [
      {
        target: VUSDT,
        signature: "_setInterestRateModel(address)",
        params: [VUSDT_IR],
      },
      {
        target: VUSDC,
        signature: "_setInterestRateModel(address)",
        params: [VUSDC_IR],
      },
      {
        target: VDAI,
        signature: "_setInterestRateModel(address)",
        params: [VDAI_IR],
      },
      {
        target: VFDUSD,
        signature: "_setInterestRateModel(address)",
        params: [VFDUSD_IR],
      },
      {
        target: VTUSD,
        signature: "_setInterestRateModel(address)",
        params: [VTUSD_IR],
      },

      {
        target: VUSDT_StableCoin,
        signature: "setInterestRateModel(address)",
        params: [VUSDT_StableCoin_IR],
      },
      {
        target: VUSDT_GameFi,
        signature: "setInterestRateModel(address)",
        params: [VUSDT_GameFi_IR],
      },
      {
        target: VUSDT_DeFi,
        signature: "setInterestRateModel(address)",
        params: [VUSDT_DeFi_IR],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
