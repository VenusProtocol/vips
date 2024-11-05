import { makeProposal } from "../../../../src/utils";

export const vETH_CORE = "0x68a34332983f4Bf866768DD6D6E638b02eF5e1f0";
export const vETH_LST = "0x39D6d13Ea59548637104E40e729E4aABE27FE106";
export const IRM = "0x425dde630be832195619a06175ba45C827Dd3DCa";

export const vip018 = () => {
  return makeProposal([
    {
      target: vETH_CORE,
      signature: "setInterestRateModel(address)",
      params: [IRM],
    },
    {
      target: vETH_LST,
      signature: "setInterestRateModel(address)",
      params: [IRM],
    },
  ]);
};

export default vip018;
