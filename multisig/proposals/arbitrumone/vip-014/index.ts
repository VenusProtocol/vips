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

export const VTOKENS = [
  "0xaDa57840B372D4c28623E87FC175dE8490792811",
  "0x68a34332983f4Bf866768DD6D6E638b02eF5e1f0",
  "0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD",
  "0x7D8609f8da70fF9027E9bc5229Af4F6727662707",
  "0xAeB0FEd69354f34831fe1D16475D9A83ddaCaDA6",
];

const vip014 = () => {
  return makeProposal([
    {
      target: DEFAULT_PROXY_ADMIN,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
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

export default vip014;