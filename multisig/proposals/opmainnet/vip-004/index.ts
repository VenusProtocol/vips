import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opmainnet } = NETWORK_ADDRESSES;

export const ACM = "0xD71b1F33f6B0259683f11174EE4Ddc2bb9cE4eD6";
export const PSR = "0x735ed037cB0dAcf90B133370C33C08764f88140a";
export const NATIVE_TOKEN_GATEWAY_CORE_POOL = "0x5B1b7465cfDE450e267b562792b434277434413c";

const vip004 = () => {
  return makeProposal([
    {
      target: PSR,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PSR, "removeDistributionConfig(Schema,address)", opmainnet.GUARDIAN],
    },
    {
      target: PSR,
      signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
      params: [
        [
          [0, 10000, opmainnet.VTREASURY],
          [1, 10000, opmainnet.VTREASURY],
        ],
      ],
    },
    {
      target: PSR,
      signature: "setPoolRegistry(address)",
      params: [opmainnet.POOL_REGISTRY],
    },
    {
      target: NATIVE_TOKEN_GATEWAY_CORE_POOL,
      signature: "acceptOwnership()",
      params: [],
    },
  ]);
};

export default vip004;
