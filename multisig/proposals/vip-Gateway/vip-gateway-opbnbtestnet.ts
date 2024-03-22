import { makeProposal } from "../../../src/utils";

export const COMPTROLLER_BEACON = "0x2020BDa1F931E07B14C9d346E2f6D5943b4cd56D";
export const VTOKEN_BEACON = "0xcc633492097078Ae590C0d11924e82A23f3Ab3E2";
export const NEW_COMPTROLLER_IMPLEMENTATION = "0x996597fc8726eC0f62BCA0aF4f2Af67D2f7563Ee";
export const NEW_VTOKEN_IMPLEMENTATION = "0xcdeF2739BAC410Af396054f17C9217b15FF89f96";
export const NATIVE_TOKEN_GATEWAY = "0xbA12d0BFC59fd29C44795FfFa8A3Ccc877A41325";

export const POOL_REGISTRY = "0x560eA4e1cC42591E9f5F5D83Ad2fd65F30128951";
export const ORIGINAL_POOL_REGISTRY_IMP = "0x90cc662c722190bed60061e291e064b157c90065";
export const PROXY_ADMIN = "0xB1281ADC816fba7df64B798D7A0BC4bd2a6d42f4";
const TEMP_POOL_REGISTRY_IMP = "0xF8bABa91d9cd38bb41bfb874222273c29fb07594";

export const MOCK_WBNB = "0xF9ce72611a1BE9797FdD2c995dB6fB61FD20E4eB";
export const WBNB = "0x4200000000000000000000000000000000000006";
export const COMPTROLLER_CORE = "0x2FCABb31E57F010D623D8d68e1E18Aed11d5A388";
export const VWBNB_CORE = "0xD36a31AcD3d901AeD998da6E24e848798378474e";

export const vipGateway = () => {
  return makeProposal([
    {
      target: PROXY_ADMIN,
      signature: "upgrade(address,address)",
      params: [POOL_REGISTRY, TEMP_POOL_REGISTRY_IMP],
    },
    {
      target: POOL_REGISTRY,
      signature: "updateUnderlying(address,address,address,address)",
      params: [MOCK_WBNB, WBNB, COMPTROLLER_CORE, VWBNB_CORE],
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
