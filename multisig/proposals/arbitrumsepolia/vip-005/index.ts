import { makeProposal } from "../../../../src/utils";

const ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
const PSR = "0x26C3dc654091D940CB5015591F40DAE85Eb47D4B";
const VTREASURY = "0x4e7ab1fD841E1387Df4c91813Ae03819C33D5bdB";
const NORMAL_TIMELOCK = "0x1426A5Ae009c4443188DA8793751024E358A61C2";
const POOL_REGISTRY = "0xEcFa4d4FcBB76A19EB90F947CCCd5c29375bD3Bd";

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
