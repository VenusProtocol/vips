import { makeProposal } from "../../../../src/utils";

const vUSDC_CORE = "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb";
const vUSDT_CORE = "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E";
const vCURUSD_CORE = "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202";
const vCURUSD_CURVE = "0x2d499800239C4CD3012473Cb1EAE33562F0A6933";

const NEW_IR = "0xd7fbFD2A36b8b388E6d04C7a05956Df91862E146";
const vip018 = () => {
  return makeProposal([
    { target: vUSDC_CORE, signature: "setInterestRateModel(address)", params: [NEW_IR] },
    { target: vUSDT_CORE, signature: "setInterestRateModel(address)", params: [NEW_IR] },
    { target: vCURUSD_CORE, signature: "setInterestRateModel(address)", params: [NEW_IR] },
    { target: vCURUSD_CURVE, signature: "setInterestRateModel(address)", params: [NEW_IR] },
  ]);
};

export default vip018;
