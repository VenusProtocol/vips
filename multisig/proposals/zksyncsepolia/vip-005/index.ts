import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

export const ACM = "0xD07f543d47c3a8997D6079958308e981AC14CD01";
export const PSR = "0x5722B43BD91fAaDC4E7f384F4d6Fb32456Ec5ffB";
export const VTREASURY = "0x943eBE4460a12F551D60A68f510Ea10CD8d564BA";
export const POOL_REGISTRY = "0x1401404e6279BB8C06E5E3999eCA3e2008B46A76";

const { zksyncsepolia } = NETWORK_ADDRESSES;
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
      params: [PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PSR, "removeDistributionConfig(Schema,address)", zksyncsepolia.GUARDIAN],
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
