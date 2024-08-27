import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

export const COMPTROLLER_BEACON = "0x12Dcb8D9F1eE7Ad7410F5B36B07bcC7891ab4cEf";
export const VTOKEN_BEACON = "0x74ae9919F5866cE148c81331a5FCdE71b81c4056";
export const ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const POOL_REGISTRY = "0xf93Df3135e0D555185c0BC888073374cA551C5fE";

export const COMPTROLLERS = ["0x006D44b6f5927b3eD83bD0c1C36Fb1A3BaCaC208"];

export const VTOKENS = [
  "0x49FB90A5815904649C44B87001a160C1301D6a2C",
  "0x807dCB6946dDF4C5C6446B1B07ACd248B08F45e2",
  "0xdEFbf0F9Ab6CdDd0a1FdDC894b358D0c0a39B052",
  "0xd9d1e754464eFc7493B177d2c7be04816E089b4C",
  "0x292Ec2b45C549Bc2c6B31937dBd511beaAEabea8",
];

const vip013 = () => {
  return makeProposal([
    {
      target: COMPTROLLER_BEACON,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: VTOKEN_BEACON,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: POOL_REGISTRY,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    ...COMPTROLLERS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [arbitrumsepolia.NORMAL_TIMELOCK],
      };
    }),
    ...VTOKENS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [arbitrumsepolia.NORMAL_TIMELOCK],
      };
    }),
  ]);
};

export default vip013;
