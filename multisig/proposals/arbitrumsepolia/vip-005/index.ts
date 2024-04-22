import { makeProposal } from "../../../../src/utils";

const ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
const PSR = "0x09267d30798B59c581ce54E861A084C6FC298666";
const VTREASURY = "0x4e7ab1fD841E1387Df4c91813Ae03819C33D5bdB";
const NORMAL_TIMELOCK = "0x1426A5Ae009c4443188DA8793751024E358A61C2";
const POOL_REGISTRY = "0x6866b2BDaaEf6648ddd5b678B3e9f3352bF3d2A5";

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
