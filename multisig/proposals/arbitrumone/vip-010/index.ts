import { makeProposal } from "src/utils";

export const VUSDC_CORE = "0x7D8609f8da70fF9027E9bc5229Af4F6727662707";
export const VUSDT_CORE = "0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD";

export const RATE_MODELS = {
  JumpRateModelV2_base0bps_slope875bps_jump25000bps_kink8000bps: "0xC7EDE29FE265aA46C1Bbc62Dc7e0f3565cce3Db6",
  JumpRateModelV2_base0bps_slope800bps_jump25000bps_kink8000bps: "0x42888177eB8FcdEa0884De66c7E0f7638125914A",
};

const vip010 = () => {
  return makeProposal([
    ...[VUSDC_CORE, VUSDT_CORE].map((vToken: string) => ({
      target: vToken,
      signature: "setInterestRateModel(address)",
      params: [RATE_MODELS.JumpRateModelV2_base0bps_slope800bps_jump25000bps_kink8000bps],
    })),
  ]);
};

export default vip010;
