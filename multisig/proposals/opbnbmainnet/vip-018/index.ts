import { makeProposal } from "../../../../src/utils";

const vFDUSD_CORE = "0x13B492B8A03d072Bab5C54AC91Dba5b830a50917";
const vUSDT_CORE = "0xb7a01Ba126830692238521a1aA7E7A7509410b8e";

const NEW_IR = "0x0E43acCbe2f38A0e98C6979bE5b803f813ce8be5";
const vip018 = () => {
  return makeProposal([
    { target: vFDUSD_CORE, signature: "setInterestRateModel(address)", params: [NEW_IR] },
    { target: vUSDT_CORE, signature: "setInterestRateModel(address)", params: [NEW_IR] },
  ]);
};

export default vip018;
