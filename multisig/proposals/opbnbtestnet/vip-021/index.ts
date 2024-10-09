import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opbnbtestnet } = NETWORK_ADDRESSES;
export const DEFAULT_PROXY_ADMIN = "0xB1281ADC816fba7df64B798D7A0BC4bd2a6d42f4";
export const PSR = "0xc355dEb1A9289f8C58CFAa076EEdBf51F3A8Da7F";
export const COMPTROLLER_BEACON = "0x2020BDa1F931E07B14C9d346E2f6D5943b4cd56D";
export const VTOKEN_BEACON = "0xcc633492097078Ae590C0d11924e82A23f3Ab3E2";
export const ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
export const POOL_REGISTRY = "0x560eA4e1cC42591E9f5F5D83Ad2fd65F30128951";

export const COMPTROLLERS = ["0x2FCABb31E57F010D623D8d68e1E18Aed11d5A388"];

export const VTOKENS = [
  "0x86F82bca79774fc04859966917D2291A68b870A9",
  "0x034Cc5097379B13d3Ed5F6c85c8FAf20F48aE480",
  "0xe3923805f6E117E51f5387421240a86EF1570abC",
  "0xD36a31AcD3d901AeD998da6E24e848798378474e",
];
export const XVS_STORE = "0x06473fB3f7bF11e2E8EfEcC95aC55ABEFCb2e0A0";
export const XVS_BRIDGE_ADMIN_PROXY = "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff";
export const XVS = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";
export const BOUND_VALIDATOR = "0x049537Bb065e6253e9D8D08B45Bf6b753657A746";

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

const vip021 = () => {
  return makeProposal([
    {
      target: DEFAULT_PROXY_ADMIN,
      signature: "transferOwnership(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: PSR,
      signature: "transferOwnership(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: COMPTROLLER_BEACON,
      signature: "transferOwnership(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: VTOKEN_BEACON,
      signature: "transferOwnership(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: POOL_REGISTRY,
      signature: "transferOwnership(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
    ...COMPTROLLERS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [opbnbtestnet.NORMAL_TIMELOCK],
      };
    }),
    ...VTOKENS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [opbnbtestnet.NORMAL_TIMELOCK],
      };
    }),
    {
      target: opbnbtestnet.XVS_VAULT_PROXY,
      signature: "_setPendingAdmin(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: XVS_STORE,
      signature: "setPendingAdmin(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "transferOwnership(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: XVS,
      signature: "transferOwnership(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: opbnbtestnet.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: opbnbtestnet.BINANCE_ORACLE,
      signature: "transferOwnership(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: opbnbtestnet.VTREASURY,
      signature: "transferOwnership(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip021;
