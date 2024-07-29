import { makeProposal } from "src/utils";

export const ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const PSR = "0xF9263eaF7eB50815194f26aCcAB6765820B13D41";
export const VTREASURY = "0x8a662ceAC418daeF956Bc0e6B2dd417c80CDA631";
export const NORMAL_TIMELOCK = "0x14e0E151b33f9802b3e75b621c1457afc44DcAA0";
export const POOL_REGISTRY = "0x382238f07Bc4Fe4aA99e561adE8A4164b5f815DA";

const vip005 = () => {
  return makeProposal([
    {
      target: PSR,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PSR, "removeDistributionConfig(Schema,address)", NORMAL_TIMELOCK],
    },
    {
      target: PSR,
      signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
      params: [
        [
          [0, 10000, VTREASURY],
          [1, 10000, VTREASURY],
        ],
      ],
    },
    {
      target: PSR,
      signature: "setPoolRegistry(address)",
      params: [POOL_REGISTRY],
    },
  ]);
};

export default vip005;
