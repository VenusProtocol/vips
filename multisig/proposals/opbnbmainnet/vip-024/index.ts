import { makeProposal } from "../../../../src/utils";

export const vETH_CORE = "0x509e81eF638D489936FA85BC58F52Df01190d26C";
export const IRM = "0x0d75544019e3015eEbF61F26595D08d60f3aC841";

export const vip024 = () => {
  return makeProposal([
    {
      target: vETH_CORE,
      signature: "setInterestRateModel(address)",
      params: [IRM],
    },
  ]);
};

export default vip024;
