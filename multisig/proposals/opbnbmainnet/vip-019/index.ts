import { makeProposal } from "../../../../src/utils";

const vFDUSD_CORE = "0x13B492B8A03d072Bab5C54AC91Dba5b830a50917";
const vUSDT_CORE = "0xb7a01Ba126830692238521a1aA7E7A7509410b8e";

const NEW_IR = "0x28dAf2e471371Af2efE5caa2b750a17D60DD2Fd3";
const vip019 = () => {
  return makeProposal([
    { target: vFDUSD_CORE, signature: "setInterestRateModel(address)", params: [NEW_IR] },
    { target: vUSDT_CORE, signature: "setInterestRateModel(address)", params: [NEW_IR] },
  ]);
};

export default vip019;
