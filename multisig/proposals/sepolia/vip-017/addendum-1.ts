import { makeProposal } from "../../../../src/utils";

export const COMPTROLLER_BEACON = "0x6cE54143a88CC22500D49D744fb6535D66a8294F";
export const VTOKEN_BEACON = "0x0463a7E5221EAE1990cEddB51A5821a68cdA6008";
export const NEW_COMPTROLLER_IMPLEMENTATION = "0x7b5804A85fB05ebd70f525f06EcF3C238b57f585";
export const NEW_VTOKEN_IMPLEMENTATION = "0x558083c8Ca93e42F5c0FE7e8c5FC49e9c0d94E14";
export const NATIVE_TOKEN_GATEWAY = "0xe6FF9010852a14fA58CdBe3F2e91d6FbCB3567f9";

export const POOL_REGISTRY = "0x758f5715d817e02857Ba40889251201A5aE3E186";
export const ORIGINAL_POOL_REGISTRY_IMP = "0x3213607Db41319E32C3706116Adf1Ae890E4083A";
export const PROXY_ADMIN = "0xe98a3110929c6650c73031756288Ec518f65e846";
const TEMP_POOL_REGISTRY_IMP = "0x437042777255A1f25BE60eD25C814Dea6E43bC28";

export const MOCK_WETH = "0x700868CAbb60e90d77B6588ce072d9859ec8E281";
export const WETH = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
export const COMPTROLLER_LIQUID_STAKED_ETH = "0xd79CeB8EF8188E44b7Eb899094e8A3A4d7A1e236";
export const VWETH_LIQUID_STAKED_ETH = "0x9f6213dFa9069a5426Fe8fAE73857712E1259Ed4";

const vip017 = () => {
  return makeProposal([
    {
      target: PROXY_ADMIN,
      signature: "upgrade(address,address)",
      params: [POOL_REGISTRY, TEMP_POOL_REGISTRY_IMP],
    },
    {
      target: POOL_REGISTRY,
      signature: "updateUnderlying(address,address,address,address)",
      params: [MOCK_WETH, WETH, COMPTROLLER_LIQUID_STAKED_ETH, VWETH_LIQUID_STAKED_ETH],
    },
    {
      target: PROXY_ADMIN,
      signature: "upgrade(address,address)",
      params: [POOL_REGISTRY, ORIGINAL_POOL_REGISTRY_IMP],
    },
    {
      target: COMPTROLLER_BEACON,
      signature: "upgradeTo(address)",
      params: [NEW_COMPTROLLER_IMPLEMENTATION],
    },
    {
      target: VTOKEN_BEACON,
      signature: "upgradeTo(address)",
      params: [NEW_VTOKEN_IMPLEMENTATION],
    },
    {
      target: NATIVE_TOKEN_GATEWAY,
      signature: "acceptOwnership()",
      params: [],
    },
  ]);
};

export default vip017;
