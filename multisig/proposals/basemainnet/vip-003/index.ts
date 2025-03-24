import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { basemainnet } = NETWORK_ADDRESSES;

export const ACM = "0x9E6CeEfDC6183e4D0DF8092A9B90cDF659687daB";
export const PSR = "0x3565001d57c91062367C3792B74458e3c6eD910a";
export const NATIVE_TOKEN_GATEWAY_CORE_POOL = "0x8e890ca3829c740895cdEACd4a3BE36ff9343643";

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
      params: [PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PSR, "removeDistributionConfig(Schema,address)", basemainnet.GUARDIAN],
    },
    {
      target: PSR,
      signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
      params: [
        [
          [0, 10000, basemainnet.VTREASURY],
          [1, 10000, basemainnet.VTREASURY],
        ],
      ],
    },
    {
      target: PSR,
      signature: "setPoolRegistry(address)",
      params: [basemainnet.POOL_REGISTRY],
    },
    {
      target: NATIVE_TOKEN_GATEWAY_CORE_POOL,
      signature: "acceptOwnership()",
      params: [],
    },
  ]);
};

export default vip003;
