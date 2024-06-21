import { makeProposal } from "src/utils";

export const COMPTROLLER_BEACON = "0x6cE54143a88CC22500D49D744fb6535D66a8294F";
export const VTOKEN_BEACON = "0x0463a7E5221EAE1990cEddB51A5821a68cdA6008";
export const NEW_COMPTROLLER_IMPLEMENTATION = "0xF37e2f9366Db8F26B1fAf16700C6858c09C8E754";
export const NEW_VTOKEN_IMPLEMENTATION = "0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE";
export const NATIVE_TOKEN_GATEWAY = "0x02fC3253e6839e001Ac959b9834f6BdDAC7bE705";

export const POOL_REGISTRY = "0x758f5715d817e02857Ba40889251201A5aE3E186";
export const ORIGINAL_POOL_REGISTRY_IMP = "0x3213607Db41319E32C3706116Adf1Ae890E4083A";
export const PROXY_ADMIN = "0xe98a3110929c6650c73031756288Ec518f65e846";
const TEMP_POOL_REGISTRY_IMP = "0x437042777255A1f25BE60eD25C814Dea6E43bC28";

export const MOCK_WETH = "0x700868CAbb60e90d77B6588ce072d9859ec8E281";
export const WETH = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
export const COMPTROLLER_CORE_ADDRESS = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
export const VWETH_CORE = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";

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
      params: [MOCK_WETH, WETH, COMPTROLLER_CORE_ADDRESS, VWETH_CORE],
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
