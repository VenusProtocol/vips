import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
export const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const VDAI = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";
export const VFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
export const VTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
export const VUSDT_STABLE_COIN = "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B";
export const VUSDT_GAMEFI = "0x4978591f17670A846137d9d613e333C38dc68A37";
export const VUSDT_DEFI = "0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854";

export const NEW_VUSDT_IR = "0xBe4609d972FdEBAa9DC870F4A957F40C301bEb1D";
export const NEW_VUSDC_IR = "0xBe4609d972FdEBAa9DC870F4A957F40C301bEb1D";
export const NEW_VDAI_IR = "0xBe4609d972FdEBAa9DC870F4A957F40C301bEb1D";
export const NEW_VFDUSD_IR = "0xE19C14171C2aC6CA63E008133e4B0D8571164BA3";
export const NEW_VTUSD_IR = "0x2ba0F45f7368d2A56d0c9e5a29af363987BE1d02";

export const NEW_VUSDT_STABLE_COIN_IR = "0x2ba0F45f7368d2A56d0c9e5a29af363987BE1d02";
export const NEW_VUSDT_GAMEFI_IR = "0x5ECa0FBBc5e7bf49dbFb1953a92784F8e4248eF6";
export const NEW_VUSDT_DEFI_IR = "0x5ECa0FBBc5e7bf49dbFb1953a92784F8e4248eF6";

const vip304 = () => {
  const meta = {
    version: "v2",
    title: "VIP-304 Chaos labs recommendations (May 16th, 2024)",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VUSDT,
        signature: "_setInterestRateModel(address)",
        params: [NEW_VUSDT_IR],
      },
      {
        target: VUSDC,
        signature: "_setInterestRateModel(address)",
        params: [NEW_VUSDC_IR],
      },
      {
        target: VDAI,
        signature: "_setInterestRateModel(address)",
        params: [NEW_VDAI_IR],
      },
      {
        target: VFDUSD,
        signature: "_setInterestRateModel(address)",
        params: [NEW_VFDUSD_IR],
      },
      {
        target: VTUSD,
        signature: "_setInterestRateModel(address)",
        params: [NEW_VTUSD_IR],
      },
      {
        target: VUSDT_STABLE_COIN,
        signature: "setInterestRateModel(address)",
        params: [NEW_VUSDT_STABLE_COIN_IR],
      },
      {
        target: VUSDT_GAMEFI,
        signature: "setInterestRateModel(address)",
        params: [NEW_VUSDT_GAMEFI_IR],
      },
      {
        target: VUSDT_DEFI,
        signature: "setInterestRateModel(address)",
        params: [NEW_VUSDT_DEFI_IR],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip304;
