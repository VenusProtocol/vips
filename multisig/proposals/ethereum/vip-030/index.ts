import { makeProposal } from "../../../../src/utils";

const JUMPRATEMODELV2_BASE0BPS_SLOPE875BPS_JUMP25000BPS_KINK8000BPS = "0xD9D3E7adA04993Cf06dE1A5c9C7f101BD1DefBF4";

export const VUSDC_CORE = "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb";
export const VUSDT_CORE = "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E";
export const VCRVUSD_CORE = "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202";

export const NEW_IR = JUMPRATEMODELV2_BASE0BPS_SLOPE875BPS_JUMP25000BPS_KINK8000BPS;

const vip030 = () => {
  return makeProposal([
    { target: VUSDC_CORE, signature: "setInterestRateModel(address)", params: [NEW_IR] },
    { target: VUSDT_CORE, signature: "setInterestRateModel(address)", params: [NEW_IR] },
    { target: VCRVUSD_CORE, signature: "setInterestRateModel(address)", params: [NEW_IR] },
  ]);
};

export default vip030;
