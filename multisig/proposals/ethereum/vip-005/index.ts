import { makeProposal } from "../../../../src/utils";

export interface VenusMarket {
  name: string;
  address: string;
}

export const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const PROTOCOL_SHARE_RESERVE = "0x8c8c8530464f7D95552A11eC31Adbd4dC4AC4d3E";
export const POOL_REGISTRY = "0x61CAff113CCaf05FFc6540302c37adcf077C5179";
export const VTREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
export const ETHEREUM_MULTISIG = "0x285960C5B22fD66A736C7136967A3eB15e93CC67";

export const MARKETS: VenusMarket[] = [
  {
    name: "vcrvUSD_Core",
    address: "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202",
  },
  {
    name: "vUSDC_Core",
    address: "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb",
  },
  {
    name: "vUSDT_Core",
    address: "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E",
  },
  {
    name: "vWBTC_Core",
    address: "0x8716554364f20BCA783cb2BAA744d39361fd1D8d",
  },
  {
    name: "vWETH_Core",
    address: "0x7c8ff7d2A1372433726f879BD945fFb250B94c65",
  },
  {
    name: "vCRV_Curve",
    address: "0x30aD10Bd5Be62CAb37863C2BfcC6E8fb4fD85BDa",
  },
  {
    name: "vcrvUSD_Curve",
    address: "0x2d499800239C4CD3012473Cb1EAE33562F0A6933",
  },
  {
    name: "vwstETH_LiquidStakedETH",
    address: "0x4a240F0ee138697726C8a3E43eFE6Ac3593432CB",
  },
  {
    name: "vWETH_LiquidStakedETH",
    address: "0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2",
  },
];

// ProtocolShareReserve post-deployment configuration
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
      params: [PROTOCOL_SHARE_RESERVE, "addOrUpdateDistributionConfigs(DistributionConfig[])", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PROTOCOL_SHARE_RESERVE, "removeDistributionConfig(Schema,address)", ETHEREUM_MULTISIG],
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

export default vip005
