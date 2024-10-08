import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

export const ACM = "0x526159A92A82afE5327d37Ef446b68FD9a5cA914";
export const PSR = "0xA1193e941BDf34E858f7F276221B4886EfdD040b";
export const POOL_REGISTRY = "0xFD96B926298034aed9bBe0Cca4b651E41eB87Bc4";

const { zksyncmainnet } = NETWORK_ADDRESSES;
const vip006 = () => {
  return makeProposal([
    {
      target: PSR,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PSR, "removeDistributionConfig(Schema,address)", zksyncmainnet.GUARDIAN],
    },
    {
      target: PSR,
      signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
      params: [
        [
          [0, 10000, zksyncmainnet.VTREASURY],
          [1, 10000, zksyncmainnet.VTREASURY],
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

export default vip006;
