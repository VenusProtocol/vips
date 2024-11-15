import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { basesepolia } = NETWORK_ADDRESSES;

export const ACM = "0x724138223D8F76b519fdE715f60124E7Ce51e051";
export const PSR = "0x4Ae3D77Ece08Ec3E5f5842B195f746bd3bCb8d73";
export const NATIVE_TOKEN_GATEWAY_CORE_POOL = "0xbb5211eF838EE04d5010aAdD8946D92e11da91Ac";

const vip003 = () => {
  return makeProposal([
    {
      target: PSR,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PSR, "removeDistributionConfig(Schema,address)", basesepolia.GUARDIAN],
    },
    {
      target: PSR,
      signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
      params: [
        [
          [0, 10000, basesepolia.VTREASURY],
          [1, 10000, basesepolia.VTREASURY],
        ],
      ],
    },
    {
      target: PSR,
      signature: "setPoolRegistry(address)",
      params: [basesepolia.POOL_REGISTRY],
    },
    {
      target: NATIVE_TOKEN_GATEWAY_CORE_POOL,
      signature: "acceptOwnership()",
      params: [],
    },
  ]);
};

export default vip003;
