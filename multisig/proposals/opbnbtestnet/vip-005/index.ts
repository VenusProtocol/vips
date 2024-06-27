import { makeProposal } from "src/utils";

export interface VenusMarket {
  name: string;
  address: string;
}

export const ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
export const PROTOCOL_SHARE_RESERVE = "0xc355dEb1A9289f8C58CFAa076EEdBf51F3A8Da7F";
export const POOL_REGISTRY = "0x560eA4e1cC42591E9f5F5D83Ad2fd65F30128951";
export const VTREASURY = "0x3370915301E8a6A6baAe6f461af703e2498409F3";
export const OPBNBTESTNET_MULTISIG = "0xb15f6EfEbC276A3b9805df81b5FB3D50C2A62BDf";

export const MARKETS: VenusMarket[] = [
  {
    name: "VToken_vBTCB_Core",
    address: "0x86F82bca79774fc04859966917D2291A68b870A9",
  },
  {
    name: "VToken_vETH_Core",
    address: "0x034Cc5097379B13d3Ed5F6c85c8FAf20F48aE480",
  },
  {
    name: "VToken_vUSDT_Core",
    address: "0xe3923805f6E117E51f5387421240a86EF1570abC",
  },
  {
    name: "VToken_vWBNB_Core",
    address: "0xD36a31AcD3d901AeD998da6E24e848798378474e",
  },
];

const vip005 = () => {
  return makeProposal([
    {
      target: PROTOCOL_SHARE_RESERVE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: PROTOCOL_SHARE_RESERVE,
      signature: "setAccessControlManager(address)",
      params: [ACM],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PROTOCOL_SHARE_RESERVE, "addOrUpdateDistributionConfigs(DistributionConfig[])", OPBNBTESTNET_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PROTOCOL_SHARE_RESERVE, "removeDistributionConfig(Schema,address)", OPBNBTESTNET_MULTISIG],
    },
    {
      target: PROTOCOL_SHARE_RESERVE,
      signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
      params: [
        [
          [0, 10000, VTREASURY],
          [1, 10000, VTREASURY],
        ],
      ],
    },
    {
      target: PROTOCOL_SHARE_RESERVE,
      signature: "setPoolRegistry(address)",
      params: [POOL_REGISTRY],
    },
    ...MARKETS.map(market => {
      return {
        target: market.address,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      };
    }),
  ]);
};

export default vip005;
