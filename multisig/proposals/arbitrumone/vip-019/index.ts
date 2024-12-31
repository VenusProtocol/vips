import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumone } = NETWORK_ADDRESSES;

export const DEFAULT_PROXY_ADMIN = "0xF6fF3e9459227f0cDE8B102b90bE25960317b216";
export const ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const PRIME = "0xFE69720424C954A2da05648a0FAC84f9bf11Ef49";
export const PLP = "0x86bf21dB200f29F21253080942Be8af61046Ec29";
export const REWARD_DISTRIBUTORS = ["0x53b488baA4052094495b6De9E5505FE1Ee3EAc7a"];
export const PSR = "0xF9263eaF7eB50815194f26aCcAB6765820B13D41";
export const COMPTROLLER_BEACON = "0x8b6c2E8672504523Ca3a29a5527EcF47fC7d43FC";
export const VTOKEN_BEACON = "0xE9381D8CA7006c12Ae9eB97890575E705996fa66";
export const POOL_REGISTRY = "0x382238f07Bc4Fe4aA99e561adE8A4164b5f815DA";
export const XVS_STORE = "0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e";
export const COMPTROLLERS = ["0x317c1A5739F39046E20b08ac9BeEa3f10fD43326"];
export const XVS_BRIDGE_ADMIN_PROXY = "0xf5d81C6F7DAA3F97A6265C8441f92eFda22Ad784";
export const XVS = "0xc1Eb7689147C81aC840d4FF0D298489fc7986d52";
export const BOUND_VALIDATOR = "0x2245FA2420925Cd3C2D889Ddc5bA1aefEF0E14CF";
export const CONVERTERS = [
  "0xb076D4f15c08D7A7B89466327Ba71bc7e1311b58",
  "0x435Fac1B002d5D31f374E07c0177A1D709d5DC2D",
  "0x6553C9f9E131191d4fECb6F0E73bE13E229065C6",
  "0xF91369009c37f029aa28AF89709a352375E5A162",
  "0x4aCB90ddD6df24dC6b0D50df84C94e72012026d0",
  "0x9c5A7aB705EA40876c1B292630a3ff2e0c213DB1",
];
export const SINGLE_TOKEN_CONVERTER_BEACON = "0x993900Ab4ef4092e5B76d4781D09A2732086F0F0";
export const CONVERTER_NETWORK = "0x2F6672C9A0988748b0172D97961BecfD9DC6D6d5";

export const VTOKENS = [
  "0xaDa57840B372D4c28623E87FC175dE8490792811",
  "0x68a34332983f4Bf866768DD6D6E638b02eF5e1f0",
  "0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD",
  "0x7D8609f8da70fF9027E9bc5229Af4F6727662707",
  "0xAeB0FEd69354f34831fe1D16475D9A83ddaCaDA6",
  "0x39D6d13Ea59548637104E40e729E4aABE27FE106",
  "0x246a35E79a3a0618535A469aDaF5091cAA9f7E88",
  "0x9df6B5132135f14719696bBAe3C54BAb272fDb16",
];

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

const vip019 = () => {
  return makeProposal([
    {
      target: DEFAULT_PROXY_ADMIN,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
    // {
    //   target: SINGLE_TOKEN_CONVERTER_BEACON,
    //   signature: "transferOwnership(address)",
    //   params: [arbitrumone.NORMAL_TIMELOCK],
    // },
    {
      target: CONVERTER_NETWORK,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
    ...CONVERTERS.map(converter => {
      return {
        target: converter,
        signature: "transferOwnership(address)",
        params: [arbitrumone.NORMAL_TIMELOCK],
      };
    }),
    {
      target: PRIME,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: PLP,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
    ...REWARD_DISTRIBUTORS.map(rewardDistributor => {
      return {
        target: rewardDistributor,
        signature: "transferOwnership(address)",
        params: [arbitrumone.NORMAL_TIMELOCK],
      };
    }),
    {
      target: PSR,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: COMPTROLLER_BEACON,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: VTOKEN_BEACON,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: POOL_REGISTRY,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
    ...COMPTROLLERS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [arbitrumone.NORMAL_TIMELOCK],
      };
    }),
    ...VTOKENS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [arbitrumone.NORMAL_TIMELOCK],
      };
    }),
    {
      target: arbitrumone.XVS_VAULT_PROXY,
      signature: "_setPendingAdmin(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: XVS_STORE,
      signature: "setPendingAdmin(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: XVS,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumone.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumone.CHAINLINK_ORACLE,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumone.REDSTONE_ORACLE,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumone.VTREASURY,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip019;
