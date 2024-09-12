import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opsepolia } = NETWORK_ADDRESSES;

export const ACM = "0x1652E12C8ABE2f0D84466F0fc1fA4286491B3BC1";
export const PSR = "0x0F021c29283c47DF8237741dD5a0aA22952aFc88";
export const NATIVE_TOKEN_GATEWAY_CORE_POOL = "0xfE0AAFd5A4fEB9f6DEC36B0Cb8A972bD0B5149f7";

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
      params: [PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PSR, "removeDistributionConfig(Schema,address)", opsepolia.GUARDIAN],
    },
    {
      target: PSR,
      signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
      params: [
        [
          [0, 10000, opsepolia.VTREASURY],
          [1, 10000, opsepolia.VTREASURY],
        ],
      ],
    },
    {
      target: PSR,
      signature: "setPoolRegistry(address)",
      params: [opsepolia.POOL_REGISTRY],
    },
    {
      target: NATIVE_TOKEN_GATEWAY_CORE_POOL,
      signature: "acceptOwnership()",
      params: [],
    },
  ]);
};

export default vip005;
