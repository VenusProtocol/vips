import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { basesepolia } = NETWORK_ADDRESSES;
export const DEFAULT_PROXY_ADMIN = "0xB85dD19112c4BF1240FeD0f26E8D0b0576a82546";
export const PRIME = "0xF0168dde19Ce84B07530B9eD7c32C3292ebBb19B";
export const PLP = "0x792c51fb738145a39E18935D17E6B8F3A56F6bfa";
export const PSR = "0x4Ae3D77Ece08Ec3E5f5842B195f746bd3bCb8d73";
export const COMPTROLLER_BEACON = "0x5c06f1FBCE587f64752c037cA83262F08d9Cb648";
export const VTOKEN_BEACON = "0x72F924aeE730395576764422C277c964f558351D";
export const ACM = "0x724138223D8F76b519fdE715f60124E7Ce51e051";
export const POOL_REGISTRY = "0xCa330282BEeb07a81963336d0bf8f5f34317916c";

export const COMPTROLLERS = ["0x272795dd6c5355CF25765F36043F34014454Eb5b"];
export const XVS_STORE = "0x0ff9Ec1118f1E332CF4DE2A685110316af60F9fD";
export const XVS_BRIDGE_ADMIN_PROXY = "0xE431E82d8fFfd81E7c082BeC7Fe2C306f5c988aD";
export const XVS = "0xE657EDb5579B82135a274E85187927C42E38C021";

export const VTOKENS = [
  "0xA31D67c056Aadc2501535f2776bF1157904f810e",
  "0x436E5A07F58AAA86277e8b992bC3e596eC423d09",
  "0x776f14D624aBdAfa912d6Cd0864976DdaF5Ca4a7",
];
export const BOUND_VALIDATOR = "0xC76284488E57554A457A75a8b166fB2ADAB430dB";

const vip014 = () => {
  return makeProposal([
    {
      target: DEFAULT_PROXY_ADMIN,
      signature: "transferOwnership(address)",
      params: [basesepolia.NORMAL_TIMELOCK],
    },
    {
      target: PRIME,
      signature: "transferOwnership(address)",
      params: [basesepolia.NORMAL_TIMELOCK],
    },
    {
      target: PLP,
      signature: "transferOwnership(address)",
      params: [basesepolia.NORMAL_TIMELOCK],
    },
    {
      target: PSR,
      signature: "transferOwnership(address)",
      params: [basesepolia.NORMAL_TIMELOCK],
    },
    {
      target: COMPTROLLER_BEACON,
      signature: "transferOwnership(address)",
      params: [basesepolia.NORMAL_TIMELOCK],
    },
    {
      target: VTOKEN_BEACON,
      signature: "transferOwnership(address)",
      params: [basesepolia.NORMAL_TIMELOCK],
    },
    {
      target: POOL_REGISTRY,
      signature: "transferOwnership(address)",
      params: [basesepolia.NORMAL_TIMELOCK],
    },
    ...COMPTROLLERS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [basesepolia.NORMAL_TIMELOCK],
      };
    }),
    ...VTOKENS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [basesepolia.NORMAL_TIMELOCK],
      };
    }),
    {
      target: basesepolia.XVS_VAULT_PROXY,
      signature: "_setPendingAdmin(address)",
      params: [basesepolia.NORMAL_TIMELOCK],
    },
    {
      target: XVS_STORE,
      signature: "setPendingAdmin(address)",
      params: [basesepolia.NORMAL_TIMELOCK],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "transferOwnership(address)",
      params: [basesepolia.NORMAL_TIMELOCK],
    },
    {
      target: XVS,
      signature: "transferOwnership(address)",
      params: [basesepolia.NORMAL_TIMELOCK],
    },
    {
      target: basesepolia.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [basesepolia.NORMAL_TIMELOCK],
    },
    {
      target: basesepolia.CHAINLINK_ORACLE,
      signature: "transferOwnership(address)",
      params: [basesepolia.NORMAL_TIMELOCK],
    },
    {
      target: basesepolia.REDSTONE_ORACLE,
      signature: "transferOwnership(address)",
      params: [basesepolia.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [basesepolia.NORMAL_TIMELOCK],
    },
    {
      target: basesepolia.VTREASURY,
      signature: "transferOwnership(address)",
      params: [basesepolia.NORMAL_TIMELOCK],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "setWhitelist(address,bool)",
      params: [basesepolia.NORMAL_TIMELOCK, true],
    },
  ]);
};

export default vip014;