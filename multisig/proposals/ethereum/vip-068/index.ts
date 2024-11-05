import { makeProposal } from "../../../../src/utils";

export const vETH_CORE = "0x7c8ff7d2A1372433726f879BD945fFb250B94c65";
export const vETH_LST = "0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2";
export const IRM = "0x2F81dAA9de0fD60fb9B105Cfc5b67A31Fda547b6";

export const vip068 = () => {
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

export default vip068;
