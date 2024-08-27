import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumone } = NETWORK_ADDRESSES;

export const COMPTROLLER_BEACON = "0x8b6c2E8672504523Ca3a29a5527EcF47fC7d43FC";
export const VTOKEN_BEACON = "0xE9381D8CA7006c12Ae9eB97890575E705996fa66";
export const ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const POOL_REGISTRY = "0x382238f07Bc4Fe4aA99e561adE8A4164b5f815DA";

export const COMPTROLLERS = ["0x317c1A5739F39046E20b08ac9BeEa3f10fD43326"];

export const VTOKENS = [
  "0xaDa57840B372D4c28623E87FC175dE8490792811",
  "0x68a34332983f4Bf866768DD6D6E638b02eF5e1f0",
  "0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD",
  "0x7D8609f8da70fF9027E9bc5229Af4F6727662707",
  "0xAeB0FEd69354f34831fe1D16475D9A83ddaCaDA6",
];

const vip010 = () => {
  return makeProposal([
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
  ]);
};

export default vip010;
