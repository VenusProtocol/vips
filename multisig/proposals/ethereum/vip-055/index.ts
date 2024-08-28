import { makeProposal } from "src/utils";

export const VDAI_CORE = "0xd8AdD9B41D4E1cd64Edad8722AB0bA8D35536657";
export const VCRVUSD_CORE = "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202";
export const VTUSD_CORE = "0x13eB80FDBe5C5f4a7039728E258A6f05fb3B912b";

export const RATE_MODELS = {
  JumpRateModelV2_base0bps_slope1500bps_jump25000bps_kink8000bps_alternative:
    "0x5C690C694eca13Ac540DD5777a9605503f654033",
  JumpRateModelV2_base0bps_slope875bps_jump25000bps_kink8000bps: "0xD9D3E7adA04993Cf06dE1A5c9C7f101BD1DefBF4",
  JumpRateModelV2_base0bps_slope1500bps_jump25000bps_kink8000bps: "0x244dBE6d11Ae9AadBaD552E6BD8901B680028E31",
};

const vip055 = () => {
  return makeProposal([
    ...[VDAI_CORE, VTUSD_CORE].map((vToken: string) => ({
      target: vToken,
      signature: "setInterestRateModel(address)",
      params: [RATE_MODELS.JumpRateModelV2_base0bps_slope875bps_jump25000bps_kink8000bps],
    })),
    {
      target: VCRVUSD_CORE,
      signature: "setInterestRateModel(address)",
      params: [RATE_MODELS.JumpRateModelV2_base0bps_slope1500bps_jump25000bps_kink8000bps],
    },
  ]);
};

export default vip055;
